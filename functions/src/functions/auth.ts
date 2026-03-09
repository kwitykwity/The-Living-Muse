import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from '../config/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { UserDoc, TIER_CREDITS } from '../types/firestore';

/**
 * createUserProfile — callable function
 * Creates a user document in Firestore after Firebase Auth signup.
 * Idempotent: returns existing profile if already created.
 */
export const createUserProfile = onCall(async (request) => {
  // Auth check
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in to create a profile.');
  }

  const uid = request.auth.uid;
  const { displayName, favoriteColor, vibePreset } = request.data;

  // Validation
  if (!displayName || typeof displayName !== 'string' || displayName.length > 100) {
    throw new HttpsError('invalid-argument', 'displayName is required (max 100 chars).');
  }

  const validColors = ['purple', 'blue', 'gold', 'rose'];
  const validVibes = ['harlem_soul', 'k_dreamer', 'orchid_noir', 'cosmic_bloom'];

  // Check if user already exists (idempotent)
  const userRef = db.collection('users').doc(uid);
  const existing = await userRef.get();

  if (existing.exists) {
    logger.info(`User profile already exists for ${uid}`);
    return { success: true, userId: uid, existing: true };
  }

  // Build user document
  const now = Timestamp.now();
  const nextMonth = getFirstOfNextMonth();

  const userDoc: UserDoc = {
    uid,
    email: request.auth.token.email || '',
    displayName: displayName.trim(),
    photoURL: request.auth.token.picture || undefined,
    provider: getProvider(request.auth.token.firebase?.sign_in_provider),
    favoriteColor: validColors.includes(favoriteColor) ? favoriteColor : 'purple',
    vibePreset: validVibes.includes(vibePreset) ? vibePreset : 'orchid_noir',
    onboardingComplete: false,
    bio: '',
    isPublicProfile: false,
    sentimentTrend: 0,

    // Server-managed fields
    subscriptionTier: 'free',
    creditBalance: TIER_CREDITS.free,
    creditLimit: TIER_CREDITS.free,
    creditResetDate: Timestamp.fromDate(nextMonth),
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

function getFirstOfNextMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

function getProvider(signInProvider?: string): 'google' | 'apple' | 'email' {
  if (signInProvider === 'google.com') return 'google';
  if (signInProvider === 'apple.com') return 'apple';
  return 'email';
}
