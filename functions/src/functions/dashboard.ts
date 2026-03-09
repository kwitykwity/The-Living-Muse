import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db } from '../config/firebase-admin';
import { checkCredits } from '../services/credit.service';
import { LivingPageDoc, UserDoc, CREDIT_COSTS, TIER_FEATURES } from '../types/firestore';

/**
 * getUserDashboard — callable function
 * Returns user profile + credit status + recent Living Pages in one call.
 * Optimized to minimize Firestore reads for the home screen.
 */
export const getUserDashboard = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in.');
  }

  const uid = request.auth.uid;

  // Parallel reads for speed
  const [userDoc, creditStatus, recentPagesSnapshot] = await Promise.all([
    db.collection('users').doc(uid).get(),
    checkCredits(uid),
    db.collection('living_pages')
      .where('uid', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get(),
  ]);

  if (!userDoc.exists) {
    throw new HttpsError('not-found', 'User profile not found. Please complete onboarding.');
  }

  const userData = userDoc.data() as UserDoc;
  const features = TIER_FEATURES[userData.subscriptionTier];
  const recentPages = recentPagesSnapshot.docs.map((doc) => {
    const page = doc.data() as LivingPageDoc;
    return {
      id: page.id,
      title: page.title,
      avatarURL: page.avatarURL,
      thumbnailURL: page.thumbnailURL,
      poemPreview: page.poemPreview,
      sentiment: page.sentiment,
      vibePreset: page.vibePreset,
      status: page.status,
      isFavorite: page.isFavorite,
      createdAt: page.createdAt,
    };
  });

  return {
    user: {
      displayName: userData.displayName,
      email: userData.email,
      photoURL: userData.photoURL,
      favoriteColor: userData.favoriteColor,
      vibePreset: userData.vibePreset,
      subscriptionTier: userData.subscriptionTier,
      onboardingComplete: userData.onboardingComplete,
    },
    credits: {
      balance: creditStatus.balance,
      purchased: creditStatus.purchased,
      totalAvailable: creditStatus.totalAvailable,
      limit: creditStatus.limit,
      tier: creditStatus.tier,
      resetDate: creditStatus.resetDate.toISOString(),
    },
    features: {
      videoEnabled: features.videoEnabled,
      premiumAudioEnabled: features.premiumAudioEnabled,
      conversationalMuse: features.conversationalMuse,
      watermark: features.watermark,
      exportResolution: features.exportResolution,
    },
    creditCosts: CREDIT_COSTS,
    recentPages,
    totalPages: recentPagesSnapshot.size,
  };
});
