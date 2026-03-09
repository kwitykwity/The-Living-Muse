/**
 * createCollection — Initializes a new thematic volume.
 */
export declare const createCollection: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    collectionId: string;
}>>;
/**
 * addPageToCollection — Adds a verse to a thematic volume.
 */
export declare const addPageToCollection: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
}>>;
//# sourceMappingURL=collection.d.ts.map