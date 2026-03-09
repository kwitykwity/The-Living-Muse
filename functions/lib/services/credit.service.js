"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCredits = checkCredits;
exports.deductCredits = deductCredits;
exports.refundCredits = refundCredits;
exports.grantCredits = grantCredits;
exports.upgradeTier = upgradeTier;
exports.downgradeTier = downgradeTier;
exports.requireTier = requireTier;
const logger = __importStar(require("firebase-functions/logger"));
const firebase_admin_1 = require("../config/firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const firestore_2 = require("../types/firestore");
// ──────────────────────────────────────────────────────
// Core Credit Operations
// ──────────────────────────────────────────────────────
/**
 * Check a user's current credit status, resetting monthly credits if needed.
 * Uses a Firestore transaction to prevent race conditions.
 */
async function checkCredits(uid) {
    const userRef = firebase_admin_1.db.collection('users').doc(uid);
    return firebase_admin_1.db.runTransaction(async (tx) => {
        const doc = await tx.get(userRef);
        if (!doc.exists) {
            throw new https_1.HttpsError('not-found', 'User profile not found.');
        }
        const data = doc.data();
        const now = new Date();
        const resetDate = data.creditResetDate.toDate();
        // Reset monthly credits if past reset date
        if (resetDate <= now) {
            const nextReset = getFirstOfNextMonth();
            const newBalance = firestore_2.TIER_CREDITS[data.subscriptionTier];
            tx.update(userRef, {
                creditBalance: newBalance,
                creditLimit: newBalance,
                creditResetDate: firestore_1.Timestamp.fromDate(nextReset),
                updatedAt: firestore_1.Timestamp.now(),
            });
            logger.info(`Credits reset for user ${uid}: ${newBalance} credits (${data.subscriptionTier})`);
            return {
                balance: newBalance,
                purchased: data.purchasedCredits,
                totalAvailable: newBalance + data.purchasedCredits,
                limit: newBalance,
                tier: data.subscriptionTier,
                resetDate: nextReset,
            };
        }
        return {
            balance: data.creditBalance,
            purchased: data.purchasedCredits,
            totalAvailable: data.creditBalance + data.purchasedCredits,
            limit: data.creditLimit,
            tier: data.subscriptionTier,
            resetDate,
        };
    });
}
/**
 * Deduct credits for a generation action.
 * Uses purchased credits first (they never expire), then monthly balance.
 * Atomic transaction prevents double-deduction.
 */
async function deductCredits(uid, action) {
    const cost = firestore_2.CREDIT_COSTS[action];
    const userRef = firebase_admin_1.db.collection('users').doc(uid);
    return firebase_admin_1.db.runTransaction(async (tx) => {
        const doc = await tx.get(userRef);
        if (!doc.exists) {
            throw new https_1.HttpsError('not-found', 'User profile not found.');
        }
        const data = doc.data();
        // Check reset
        const now = new Date();
        const resetDate = data.creditResetDate.toDate();
        let balance = data.creditBalance;
        if (resetDate <= now) {
            const newBalance = firestore_2.TIER_CREDITS[data.subscriptionTier];
            balance = newBalance;
            tx.update(userRef, {
                creditBalance: newBalance,
                creditLimit: newBalance,
                creditResetDate: firestore_1.Timestamp.fromDate(getFirstOfNextMonth()),
            });
        }
        const purchased = data.purchasedCredits;
        const totalAvailable = balance + purchased;
        if (totalAvailable < cost) {
            throw new https_1.HttpsError('resource-exhausted', `Not enough credits. This ${action.replace('_', ' ')} costs ${cost} credits, ` +
                `but you have ${totalAvailable} available. ` +
                (data.subscriptionTier === 'free'
                    ? 'Upgrade to Starter for 75 credits/month.'
                    : 'Purchase a credit pack for more.'));
        }
        // Feature gate check for video and premium audio
        const features = firestore_2.TIER_FEATURES[data.subscriptionTier];
        if (action.startsWith('video_') && !features.videoEnabled) {
            throw new https_1.HttpsError('permission-denied', 'Video generation requires a Pro or Studio subscription.');
        }
        if (action === 'audio_premium' && !features.premiumAudioEnabled) {
            throw new https_1.HttpsError('permission-denied', 'Premium audio voices require a Pro or Studio subscription.');
        }
        // Deduct: use purchased credits first, then monthly balance
        let fromPurchased = 0;
        let fromBalance = 0;
        if (purchased >= cost) {
            fromPurchased = cost;
        }
        else {
            fromPurchased = purchased;
            fromBalance = cost - purchased;
        }
        const newBalance = balance - fromBalance;
        const newPurchased = purchased - fromPurchased;
        tx.update(userRef, {
            creditBalance: newBalance,
            purchasedCredits: newPurchased,
            updatedAt: firestore_1.Timestamp.now(),
        });
        // Record transaction for audit trail
        const txRef = firebase_admin_1.db.collection('credit_transactions').doc();
        const transaction = {
            id: txRef.id,
            uid,
            type: 'debit',
            amount: -cost,
            action,
            balanceAfter: newBalance + newPurchased,
            metadata: { fromPurchased, fromBalance },
            createdAt: firestore_1.Timestamp.now(),
        };
        tx.set(txRef, transaction);
        logger.info(`Credits deducted: ${uid} -${cost} for ${action} ` +
            `(${fromPurchased} purchased + ${fromBalance} monthly). ` +
            `Balance: ${newBalance + newPurchased}`);
        return {
            creditsCharged: cost,
            balanceAfter: newBalance + newPurchased,
        };
    });
}
/**
 * Refund credits (for failed generations).
 * Credits go back to monthly balance first (up to limit), overflow to purchased.
 */
async function refundCredits(uid, amount, reason) {
    const userRef = firebase_admin_1.db.collection('users').doc(uid);
    await firebase_admin_1.db.runTransaction(async (tx) => {
        const doc = await tx.get(userRef);
        if (!doc.exists)
            return;
        const data = doc.data();
        const toBalance = Math.min(amount, data.creditLimit - data.creditBalance);
        const toPurchased = amount - toBalance;
        tx.update(userRef, {
            creditBalance: data.creditBalance + toBalance,
            purchasedCredits: data.purchasedCredits + toPurchased,
            updatedAt: firestore_1.Timestamp.now(),
        });
        // Record refund transaction
        const txRef = firebase_admin_1.db.collection('credit_transactions').doc();
        const transaction = {
            id: txRef.id,
            uid,
            type: 'refund',
            amount,
            balanceAfter: (data.creditBalance + toBalance) + (data.purchasedCredits + toPurchased),
            metadata: { reason, toBalance, toPurchased },
            createdAt: firestore_1.Timestamp.now(),
        };
        tx.set(txRef, transaction);
        logger.info(`Credits refunded: ${uid} +${amount} (reason: ${reason})`);
    });
}
/**
 * Grant credits from a pack purchase. Purchased credits never expire.
 */
async function grantCredits(uid, amount, source) {
    const userRef = firebase_admin_1.db.collection('users').doc(uid);
    await firebase_admin_1.db.runTransaction(async (tx) => {
        const doc = await tx.get(userRef);
        if (!doc.exists) {
            throw new https_1.HttpsError('not-found', 'User not found.');
        }
        const data = doc.data();
        const newPurchased = data.purchasedCredits + amount;
        tx.update(userRef, {
            purchasedCredits: newPurchased,
            updatedAt: firestore_1.Timestamp.now(),
        });
        // Record purchase transaction
        const txRef = firebase_admin_1.db.collection('credit_transactions').doc();
        const transaction = {
            id: txRef.id,
            uid,
            type: 'purchase',
            amount,
            balanceAfter: data.creditBalance + newPurchased,
            metadata: { source },
            createdAt: firestore_1.Timestamp.now(),
        };
        tx.set(txRef, transaction);
        logger.info(`Credits granted: ${uid} +${amount} (source: ${source})`);
    });
}
// ──────────────────────────────────────────────────────
// Tier Management
// ──────────────────────────────────────────────────────
/**
 * Upgrade user to a new tier. Immediately grants the new tier's credit allocation.
 */
async function upgradeTier(uid, newTier) {
    const userRef = firebase_admin_1.db.collection('users').doc(uid);
    await firebase_admin_1.db.runTransaction(async (tx) => {
        const doc = await tx.get(userRef);
        if (!doc.exists) {
            throw new https_1.HttpsError('not-found', 'User not found.');
        }
        const data = doc.data();
        const oldTier = data.subscriptionTier;
        const newCredits = firestore_2.TIER_CREDITS[newTier];
        // Pro-rate: grant difference between new and old allocation
        const oldCredits = firestore_2.TIER_CREDITS[oldTier];
        const bonusCredits = Math.max(0, newCredits - oldCredits);
        tx.update(userRef, {
            subscriptionTier: newTier,
            creditBalance: data.creditBalance + bonusCredits,
            creditLimit: newCredits,
            subscriptionStartDate: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        });
        // Record upgrade transaction
        const txRef = firebase_admin_1.db.collection('credit_transactions').doc();
        const transaction = {
            id: txRef.id,
            uid,
            type: 'upgrade',
            amount: bonusCredits,
            balanceAfter: data.creditBalance + bonusCredits + data.purchasedCredits,
            metadata: { oldTier, newTier },
            createdAt: firestore_1.Timestamp.now(),
        };
        tx.set(txRef, transaction);
        logger.info(`Tier upgrade: ${uid} ${oldTier} → ${newTier} (+${bonusCredits} credits)`);
    });
}
/**
 * Downgrade user to a lower tier. Credits don't decrease until next reset.
 */
async function downgradeTier(uid, newTier) {
    const userRef = firebase_admin_1.db.collection('users').doc(uid);
    await userRef.update({
        subscriptionTier: newTier,
        creditLimit: firestore_2.TIER_CREDITS[newTier],
        subscriptionEndDate: firestore_1.Timestamp.now(),
        updatedAt: firestore_1.Timestamp.now(),
    });
    logger.info(`Tier downgrade: ${uid} → ${newTier}`);
}
/**
 * Require a minimum tier for a feature. Throws descriptive error if not met.
 */
async function requireTier(uid, minTier, feature) {
    const userRef = firebase_admin_1.db.collection('users').doc(uid);
    const doc = await userRef.get();
    if (!doc.exists) {
        throw new https_1.HttpsError('not-found', 'User not found.');
    }
    const data = doc.data();
    const tierRank = { free: 0, starter: 1, pro: 2, studio: 3 };
    if (tierRank[data.subscriptionTier] < tierRank[minTier]) {
        throw new https_1.HttpsError('permission-denied', `${feature} requires a ${minTier.charAt(0).toUpperCase() + minTier.slice(1)} subscription or higher.`);
    }
    return data;
}
// ──────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────
function getFirstOfNextMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}
//# sourceMappingURL=credit.service.js.map