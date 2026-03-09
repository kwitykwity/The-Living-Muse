import { Sentiment } from '../types/firestore';
/**
 * MemoryService — Manages user context retention and sentiment learning.
 * This service helps the AI "learn" the user's style and emotional trends over time.
 */
export declare class MemoryService {
    /**
     * recordSentiment
     * Updates the user's rolling sentiment average and stores the last detected sentiment.
     * @param uid User ID
     * @param score Numeric sentiment score (-1.0 to 1.0)
     * @param label Sentiment label (melancholic, joyful, etc.)
     */
    static recordSentiment(uid: string, score: number, label: Sentiment): Promise<void>;
    /**
     * getUserContext
     * Retrieves user context to inject into AI prompts for personalization.
     * Now performs a semantic (RAG) search for hyper-relevant memories.
     * @param uid User ID
     * @param query The current prompt/mood to search against
     */
    static getUserContext(uid: string, query?: string): Promise<string>;
}
//# sourceMappingURL=memory.service.d.ts.map