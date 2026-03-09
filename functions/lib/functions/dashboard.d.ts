/**
 * getUserDashboard — callable function
 * Returns user profile + credit status + recent Living Pages in one call.
 * Optimized to minimize Firestore reads for the home screen.
 */
export declare const getUserDashboard: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    user: {
        displayName: string;
        email: string;
        photoURL: string | undefined;
        favoriteColor: string;
        vibePreset: import("../types/firestore").VibePreset;
        subscriptionTier: import("../types/firestore").SubscriptionTier;
        onboardingComplete: boolean;
    };
    credits: {
        balance: number;
        purchased: number;
        totalAvailable: number;
        limit: number;
        tier: import("../types/firestore").SubscriptionTier;
        resetDate: string;
    };
    features: {
        videoEnabled: boolean;
        premiumAudioEnabled: boolean;
        conversationalMuse: boolean;
        watermark: boolean;
        exportResolution: "720p" | "1080p" | "4K";
    };
    creditCosts: Record<import("../types/firestore").CreditAction, number>;
    recentPages: {
        id: string;
        title: string;
        avatarURL: string;
        thumbnailURL: string;
        poemPreview: string;
        sentiment: import("../types/firestore").Sentiment;
        vibePreset: import("../types/firestore").VibePreset;
        status: import("../types/firestore").LivingPageStatus;
        isFavorite: boolean;
        createdAt: FirebaseFirestore.Timestamp;
    }[];
    totalPages: number;
}>>;
//# sourceMappingURL=dashboard.d.ts.map