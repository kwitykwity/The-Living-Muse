import * as logger from 'firebase-functions/logger';
import { db } from '../config/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import {
  UserDoc,
  SubscriptionTier,
  CreditAction,
  CreditTransactionDoc,
  CREDIT_COSTS,
  TIER_CREDITS,
  TIER_FEATURES,
} from '../types/firestore';

export interface CreditStatus {
  balance: number;       // Monthly credits remaining
  purchased: number;     // Pack credits remaining
  totalAvailable: number;
  limit: number;
  tier: SubscriptionTier;
  resetDate: Date;
}

// ──────────────────────────────────────────────────────
// Core Credit Operations
// ──────────────────────────────────────────────────────

/**
 * Check a user's current credit status, resetting monthly credits if needed.
 * Uses a Firestore transaction to prevent race conditions.
 */
export async function checkCredits(uid: string): Promise<CreditStatus> {
  const userRef = db.collection('users').doc(uid);

  return db.runTransaction(async (tx) => {
    const doc = await tx.get(userRef);

    if (!doc.exists) {
      throw new HttpsError('not-found', 'User profile not found.');
    }

    const data = doc.data() as UserDoc;
    const now = new Date();
    const resetDate = data.creditResetDate.toDate();

    // Reset monthly credits if past reset date
    if (resetDate <= now) {
      const nextReset = getFirstOfNextMonth();
      const newBalance = TIER_CREDITS[data.subscriptionTier];

      tx.update(userRef, {
        creditBalance: newBalance,
        creditLimit: newBalance,
        creditResetDate: Timestamp.fromDate(nextReset),
        updatedAt: Timestamp.now(),
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
export async function deductCredits(
  uid: string,
  action: CreditAction,
): Promise<{ creditsCharged: number; balanceAfter: number }> {
  const cost = CREDIT_COSTS[action];
  const userRef = db.collection('users').doc(uid);

  return db.runTransaction(async (tx) => {
    const doc = await tx.get(userRef);

    if (!doc.exists) {
      throw new HttpsError('not-found', 'User profile not found.');
    }

    const data = doc.data() as UserDoc;

    // Check reset
    const now = new Date();
    const resetDate = data.creditResetDate.toDate();
    let balance = data.creditBalance;

    if (resetDate <= now) {
      const newBalance = TIER_CREDITS[data.subscriptionTier];
      balance = newBalance;
      tx.update(userRef, {
        creditBalance: newBalance,
        creditLimit: newBalance,
        creditResetDate: Timestamp.fromDate(getFirstOfNextMonth()),
      });
    }

    const purchased = data.purchasedCredits;
    const totalAvailable = balance + purchased;

    if (totalAvailable < cost) {
      throw new HttpsError(
        'resource-exhausted',
        `Not enough credits. This ${action.replace('_', ' ')} costs ${cost} credits, ` +
        `but you have ${totalAvailable} available. ` +
        (data.subscriptionTier === 'free'
          ? 'Upgrade to Starter for 75 credits/month.'
          : 'Purchase a credit pack for more.')
      );
    }

    // Feature gate check for video and premium audio
    const features = TIER_FEATURES[data.subscriptionTier];
    if (action.startsWith('video_') && !features.videoEnabled) {
      throw new HttpsError(
        'permission-denied',
        'Video generation requires a Pro or Studio subscription.'
      );
    }
    if (action === 'audio_premium' && !features.premiumAudioEnabled) {
      throw new HttpsError(
        'permission-denied',
        'Premium audio voices require a Pro or Studio subscription.'
      );
    }

    // Deduct: use purchased credits first, then monthly balance
    let fromPurchased = 0;
    let fromBalance = 0;

    if (purchased >= cost) {
      fromPurchased = cost;
    } else {
      fromPurchased = purchased;
      fromBalance = cost - purchased;
    }

    const newBalance = balance - fromBalance;
    const newPurchased = purchased - fromPurchased;

    tx.update(userRef, {
      creditBalance: newBalance,
      purchasedCredits: newPurchased,
      updatedAt: Timestamp.now(),
    });

    // Record transaction for audit trail
    const txRef = db.collection('credit_transactions').doc();
    const transaction: CreditTransactionDoc = {
      id: txRef.id,
      uid,
      type: 'debit',
      amount: -cost,
      action,
      balanceAfter: newBalance + newPurchased,
      metadata: { fromPurchased, fromBalance },
      createdAt: Timestamp.now(),
    };
    tx.set(txRef, transaction);

    logger.info(
      `Credits deducted: ${uid} -${cost} for ${action} ` +
      `(${fromPurchased} purchased + ${fromBalance} monthly). ` +
      `Balance: ${newBalance + newPurchased}`
    );

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
export async function refundCredits(
  uid: string,
  amount: number,
  reason: string
): Promise<void> {
  const userRef = db.collection('users').doc(uid);

  await db.runTransaction(async (tx) => {
    const doc = await tx.get(userRef);
    if (!doc.exists) return;

    const data = doc.data() as UserDoc;
    const toBalance = Math.min(amount, data.creditLimit - data.creditBalance);
    const toPurchased = amount - toBalance;

    tx.update(userRef, {
      creditBalance: data.creditBalance + toBalance,
      purchasedCredits: data.purchasedCredits + toPurchased,
      updatedAt: Timestamp.now(),
    });

    // Record refund transaction
    const txRef = db.collection('credit_transactions').doc();
    const transaction: CreditTransactionDoc = {
      id: txRef.id,
      uid,
      type: 'refund',
      amount,
      balanceAfter: (data.creditBalance + toBalance) + (data.purchasedCredits + toPurchased),
      metadata: { reason, toBalance, toPurchased },
      createdAt: Timestamp.now(),
    };
    tx.set(txRef, transaction);

    logger.info(`Credits refunded: ${uid} +${amount} (reason: ${reason})`);
  });
}

/**
 * Grant credits from a pack purchase. Purchased credits never expire.
 */
export async function grantCredits(
  uid: string,
  amount: number,
  source: string
): Promise<void> {
  const userRef = db.collection('users').doc(uid);

  await db.runTransaction(async (tx) => {
    const doc = await tx.get(userRef);
    if (!doc.exists) {
      throw new HttpsError('not-found', 'User not found.');
    }

    const data = doc.data() as UserDoc;
    const newPurchased = data.purchasedCredits + amount;

    tx.update(userRef, {
      purchasedCredits: newPurchased,
      updatedAt: Timestamp.now(),
    });

    // Record purchase transaction
    const txRef = db.collection('credit_transactions').doc();
    const transaction: CreditTransactionDoc = {
      id: txRef.id,
      uid,
      type: 'purchase',
      amount,
      balanceAfter: data.creditBalance + newPurchased,
      metadata: { source },
      createdAt: Timestamp.now(),
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
export async function upgradeTier(uid: string, newTier: SubscriptionTier): Promise<void> {
  const userRef = db.collection('users').doc(uid);

  await db.runTransaction(async (tx) => {
    const doc = await tx.get(userRef);
    if (!doc.exists) {
      throw new HttpsError('not-found', 'User not found.');
    }

    const data = doc.data() as UserDoc;
    const oldTier = data.subscriptionTier;
    const newCredits = TIER_CREDITS[newTier];

    // Pro-rate: grant difference between new and old allocation
    const oldCredits = TIER_CREDITS[oldTier];
    const bonusCredits = Math.max(0, newCredits - oldCredits);

    tx.update(userRef, {
      subscriptionTier: newTier,
      creditBalance: data.creditBalance + bonusCredits,
      creditLimit: newCredits,
      subscriptionStartDate: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Record upgrade transaction
    const txRef = db.collection('credit_transactions').doc();
    const transaction: CreditTransactionDoc = {
      id: txRef.id,
      uid,
      type: 'upgrade',
      amount: bonusCredits,
      balanceAfter: data.creditBalance + bonusCredits + data.purchasedCredits,
      metadata: { oldTier, newTier },
      createdAt: Timestamp.now(),
    };
    tx.set(txRef, transaction);

    logger.info(`Tier upgrade: ${uid} ${oldTier} → ${newTier} (+${bonusCredits} credits)`);
  });
}

/**
 * Downgrade user to a lower tier. Credits don't decrease until next reset.
 */
export async function downgradeTier(uid: string, newTier: SubscriptionTier): Promise<void> {
  const userRef = db.collection('users').doc(uid);

  await userRef.update({
    subscriptionTier: newTier,
    creditLimit: TIER_CREDITS[newTier],
    subscriptionEndDate: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  logger.info(`Tier downgrade: ${uid} → ${newTier}`);
}

/**
 * Require a minimum tier for a feature. Throws descriptive error if not met.
 */
export async function requireTier(
  uid: string,
  minTier: SubscriptionTier,
  feature: string
): Promise<UserDoc> {
  const userRef = db.collection('users').doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new HttpsError('not-found', 'User not found.');
  }

  const data = doc.data() as UserDoc;
  const tierRank: Record<SubscriptionTier, number> = { free: 0, starter: 1, pro: 2, studio: 3 };

  if (tierRank[data.subscriptionTier] < tierRank[minTier]) {
    throw new HttpsError(
      'permission-denied',
      `${feature} requires a ${minTier.charAt(0).toUpperCase() + minTier.slice(1)} subscription or higher.`
    );
  }

  return data;
}

// ──────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────

function getFirstOfNextMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}
