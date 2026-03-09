/**
 * synthesizePoemAudio — callable function
 * Deducts 3 credits (standard) or 10 credits (premium).
 * Generates audio narration of a poem via Google Cloud TTS.
 */
export declare const synthesizePoemAudio: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    audioAssetId: string;
    storageURL: string;
    voiceId: any;
    voiceTier: any;
    creditsCharged: number;
    balanceAfter: number;
}>>;
//# sourceMappingURL=audio.d.ts.map