/**
 * searchLivingPages — Semantic (RAG) search for the gallery.
 */
export declare const searchLivingPages: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    results: {
        id: string;
    }[];
}>>;
/**
 * togglePageVisibility — Switches between Public and Private.
 */
export declare const togglePageVisibility: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    isPublic: boolean;
}>>;
//# sourceMappingURL=gallery.d.ts.map