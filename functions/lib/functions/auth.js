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
exports.createUserProfile = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_admin_1 = require("../config/firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const firestore_2 = require("../types/firestore");
/**
 * createUserProfile — callable function
 * Creates a user document in Firestore after Firebase Auth signup.
 * Idempotent: returns existing profile if already created.
 */
exports.createUserProfile = (0, https_1.onCall)(async (request) => {
    // Auth check
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be signed in to create a profile.');
    }
    const uid = request.auth.uid;
    const { displayName, favoriteColor, vibePreset } = request.data;
    // Validation
    if (!displayName || typeof displayName !== 'string' || displayName.length > 100) {
        throw new https_1.HttpsError('invalid-argument', 'displayName is required (max 100 chars).');
    }
    const validColors = ['purple', 'blue', 'gold', 'rose'];
    const validVibes = ['harlem_soul', 'k_dreamer', 'orchid_noir', 'cosmic_bloom'];
    // Check if user already exists (idempotent)
    const userRef = firebase_admin_1.db.collection('users').doc(uid);
    const existing = await userRef.get();
    if (existing.exists) {
        logger.info(`User profile already exists for ${uid}`);
        return { success: true, userId: uid, existing: true };
    }
    // Build user document
    const now = firestore_1.Timestamp.now();
    const nextMonth = getFirstOfNextMonth();
    const userDoc = {
        uid,
        email: request.auth.token.email || '',
        displayName: displayName.trim(),
        photoURL: request.auth.token.picture || undefined,
        provider: getProvider(request.auth.token.firebase?.sign_in_provider),
        favoriteColor: validColors.includes(favoriteColor) ? favoriteColor : 'purple',
        vibePreset: validVibes.includes(vibePreset) ? vibePreset : 'orchid_noir',
        onboardingComplete: false,
        sentimentTrend: 0,
        // Server-managed fields
        subscriptionTier: 'free',
        creditBalance: firestore_2.TIER_CREDITS.free,
        creditLimit: firestore_2.TIER_CREDITS.free,
        creditResetDate: firestore_1.Timestamp.fromDate(nextMonth),
        purchasedCredits: 0,
        memoryCount: 0,
        createdAt: now,
        updatedAt: now,
    };
    await userRef.set(userDoc);
    logger.info(`Created user profile for ${uid}`);
    return { success: true, userId: uid, existing: false };
});
// ─── Helpers ───
function getFirstOfNextMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}
function getProvider(signInProvider) {
    if (signInProvider === 'google.com')
        return 'google';
    if (signInProvider === 'apple.com')
        return 'apple';
    return 'email';
}
//# sourceMappingURL=auth.js.map