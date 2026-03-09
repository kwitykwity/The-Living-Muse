/**
 * VectorService — Handles semantic embedding generation and vector search synchronization.
 */
export declare class VectorService {
    /**
     * generateEmbedding
     * Converts text (poem, dialogue, journal) into a 768d vector for semantic search.
     */
    static generateEmbedding(text: string): Promise<number[]>;
    /**
     * upsertToVectorDB
     * Syncs user memory to a vector database (Firestore Vector Search).
     */
    static upsertToVectorDB(params: {
        uid: string;
        id: string;
        text: string;
        metadata: any;
    }): Promise<void>;
    /**
     * searchSimilarMemories
     * Retrieves semantically similar context from the user's creative history.
     * Uses Firestore Vector Search (findNearest).
     */
    static searchSimilarMemories(uid: string, query: string, topK?: number): Promise<any[]>;
}
//# sourceMappingURL=vector.service.d.ts.map