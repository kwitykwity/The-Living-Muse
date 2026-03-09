/**
 * startConversationalSession
 * Initializes a new chat session with a Muse for interactive poem creation.
 */
export declare const startConversationalSession: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    sessionId: string;
}>>;
/**
 * continueConversationalPoem
 * Refines an existing poem or creates one via dialogue with the Muse.
 * Costs 1 credit per refinement turn.
 */
export declare const continueConversationalPoem: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    textContent: string;
    sentiment: string;
    balanceAfter: number;
}>>;
//# sourceMappingURL=session.d.ts.map