/**
 * generatePoem — callable function
 * Deducts 1 credit → generates poem from muse context + style/mood.
 * Personalizes output via Creative Memory Service.
 * Refunds on failure.
 */
export declare const generatePoem: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    poemId: string;
    textContent: string;
    sentiment: string;
    sentimentScore: number;
    poemType: string;
    creditsCharged: number;
    balanceAfter: number;
}>>;
//# sourceMappingURL=poem.d.ts.map