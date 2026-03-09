/**
 * createUserProfile — callable function
 * Creates a user document in Firestore after Firebase Auth signup.
 * Idempotent: returns existing profile if already created.
 */
export declare const createUserProfile: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    userId: string;
    existing: boolean;
}>>;
//# sourceMappingURL=auth.d.ts.map