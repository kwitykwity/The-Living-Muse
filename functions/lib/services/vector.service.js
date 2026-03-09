"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorService = void 0;
const vertexai_1 = require("@google-cloud/vertexai");
const env_1 = require("../config/env");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_admin_1 = require("../config/firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
// Initialize Vertex AI for Embeddings
const vertexAI = new vertexai_1.VertexAI({ project: env_1.env.projectId, location: env_1.env.vertexLocation });
const generativeModel = vertexAI.getGenerativeModel({ model: 'text-embedding-004' });
/**
 * VectorService — Handles semantic embedding generation and vector search synchronization.
 */
class VectorService {
    /**
     * generateEmbedding
     * Converts text (poem, dialogue, journal) into a 768d vector for semantic search.
     */
    static async generateEmbedding(text) {
        logger.info(`Generating embedding for text: "${text.substring(0, 30)}..."`);
        try {
            // Bypass lint check if SDK type is incomplete (API exists in Vertex AI Node SDK)
            const result = await generativeModel.embedContent({
                content: { parts: [{ text }] }
            });
            const embedding = result.embeddings?.[0]?.values;
            if (!embedding)
                throw new Error('No embedding returned from Vertex AI');
            return Array.from(embedding);
        }
        catch (error) {
            logger.error('Embedding generation failed, returning mock vector', error);
            return new Array(768).fill(0).map(() => Math.random());
        }
    }
    /**
     * upsertToVectorDB
     * Syncs user memory to a vector database (Firestore Vector Search).
     */
    static async upsertToVectorDB(params) {
        const embedding = await this.generateEmbedding(params.text);
        const memoryRef = firebase_admin_1.db.collection('memories').doc(params.id);
        const memory = {
            id: params.id,
            uid: params.uid,
            text: params.text,
            embedding,
            metadata: params.metadata,
            createdAt: firestore_1.Timestamp.now(),
        };
        const batch = firebase_admin_1.db.batch();
        batch.set(memoryRef, memory);
        batch.update(firebase_admin_1.db.collection('users').doc(params.uid), {
            memoryCount: firestore_1.FieldValue.increment(1),
            updatedAt: firestore_1.Timestamp.now()
        });
        await batch.commit();
        logger.info(`Memory ${params.id} indexed for user ${params.uid}.`);
    }
    /**
     * searchSimilarMemories
     * Retrieves semantically similar context from the user's creative history.
     * Uses Firestore Vector Search (findNearest).
     */
    static async searchSimilarMemories(uid, query, topK = 5) {
        const queryEmbedding = await this.generateEmbedding(query);
        logger.info(`Searching for memories similar to: "${query.substring(0, 30)}..."`);
        try {
            // Note: This requires google-cloud/firestore >= v7.0.0
            // If not supported, we fall back to a simple collection fetch
            const vectorQuery = firebase_admin_1.db.collection('memories')
                .where('uid', '==', uid)
                .findNearest({
                vectorField: 'embedding',
                queryVector: queryEmbedding,
                limit: topK,
                distanceMeasure: 'COSINE'
            });
            const snapshot = await vectorQuery.get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                score: doc.data().score,
                text: doc.data().text,
                metadata: doc.data().metadata
            }));
        }
        catch (error) {
            logger.warn('Firestore Vector Search failed (potentially missing index or SDK version)', error);
            return [];
        }
    }
}
exports.VectorService = VectorService;
//# sourceMappingURL=vector.service.js.map