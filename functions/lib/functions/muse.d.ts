/**
 * createMuseFromPhoto — callable function
 * Deducts 5 credits → uploads photo → calls AI → creates Muse document.
 * Personalizes style via Creative Memory Service.
 * Refunds credits on failure.
 */
export declare const createMuseFromPhoto: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    museId: string;
    avatarURL: string;
    thumbnailURL: string;
    status: string;
    creditsCharged: number;
    balanceAfter: number;
}>>;
//# sourceMappingURL=muse.d.ts.map