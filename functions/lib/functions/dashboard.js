"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserDashboard = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_admin_1 = require("../config/firebase-admin");
const credit_service_1 = require("../services/credit.service");
const firestore_1 = require("../types/firestore");
/**
 * getUserDashboard — callable function
 * Returns user profile + credit status + recent Living Pages in one call.
 * Optimized to minimize Firestore reads for the home screen.
 */
exports.getUserDashboard = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be signed in.');
    }
    const uid = request.auth.uid;
    // Parallel reads for speed
    const [userDoc, creditStatus, recentPagesSnapshot] = await Promise.all([
        firebase_admin_1.db.collection('users').doc(uid).get(),
        (0, credit_service_1.checkCredits)(uid),
        firebase_admin_1.db.collection('living_pages')
            .where('uid', '==', uid)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get(),
    ]);
    if (!userDoc.exists) {
        throw new https_1.HttpsError('not-found', 'User profile not found. Please complete onboarding.');
    }
    const userData = userDoc.data();
    const features = firestore_1.TIER_FEATURES[userData.subscriptionTier];
    const recentPages = recentPagesSnapshot.docs.map((doc) => {
        const page = doc.data();
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
        creditCosts: firestore_1.CREDIT_COSTS,
        recentPages,
        totalPages: recentPagesSnapshot.size,
    };
});
//# sourceMappingURL=dashboard.js.map