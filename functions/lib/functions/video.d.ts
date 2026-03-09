/**
 * generateVideo — callable function
 * Pro+ only. Deducts 20–80 credits based on quality tier.
 * Generates a video from source image with motion style via Veo 3.
 */
export declare const generateVideo: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    videoAssetId: string;
    jobId: string;
    status: string;
    qualityTier: any;
    creditsCharged: number;
    balanceAfter: number;
}>>;
//# sourceMappingURL=video.d.ts.map