import { VertexAI } from '@google-cloud/vertexai';
import { env } from '../config/env';
import * as logger from 'firebase-functions/logger';
import { db } from '../config/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { MemoryDoc } from '../types/firestore';

// Initialize Vertex AI for Embeddings
const vertexAI = new VertexAI({ project: env.projectId, location: env.vertexLocation });
const generativeModel = vertexAI.getGenerativeModel({ model: 'text-embedding-004' });

/**
 * VectorService — Handles semantic embedding generation and vector search synchronization.
 */
export class VectorService {
  /**
   * generateEmbedding
   * Converts text (poem, dialogue, journal) into a 768d vector for semantic search.
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    logger.info(`Generating embedding for text: "${text.substring(0, 30)}..."`);
    
    try {
      // Bypass lint check if SDK type is incomplete (API exists in Vertex AI Node SDK)
      const result = await (generativeModel as any).embedContent({ 
        content: { parts: [{ text }] } 
      });
      const embedding = result.embeddings?.[0]?.values;
      if (!embedding) throw new Error('No embedding returned from Vertex AI');
      return Array.from(embedding);
    } catch (error: any) {
      logger.error('Embedding generation FATAL error', { error: error.message });
      throw error; // Rethrow to ensure visibility and prevent "silent" failures during hardening
    }
  }

  /**
   * upsertToVectorDB
   * Syncs user memory to a vector database (Firestore Vector Search).
   */
  static async upsertToVectorDB(params: {
    uid: string;
    id: string;
    text: string;
    metadata: any;
    isPublic?: boolean;
  }): Promise<void> {
    const embedding = await this.generateEmbedding(params.text);
    
    const memoryRef = db.collection('memories').doc(params.id);
    const memory: MemoryDoc = {
      id: params.id,
      uid: params.uid,
      text: params.text,
      embedding,
      metadata: { 
        ...params.metadata,
        isPublic: !!params.isPublic 
      },
      createdAt: Timestamp.now(),
    };

    const batch = db.batch();
    batch.set(memoryRef, memory);
    batch.update(db.collection('users').doc(params.uid), {
      memoryCount: FieldValue.increment(1),
      updatedAt: Timestamp.now()
    });

    await batch.commit();
    logger.info(`Memory ${params.id} indexed for user ${params.uid}.`);
  }

  /**
   * searchSimilarMemories
   * Retrieves semantically similar context.
   * scope: 'personal' (filter by uid) or 'global' (filter by isPublic:true).
   */
  static async searchSimilarMemories(scope: 'personal' | 'global', identifier: string, query: string, topK = 10): Promise<any[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    
    logger.info(`Searching ${scope} memories similar to: "${query.substring(0, 30)}..."`);
    
    try {
      let queryRef = db.collection('memories') as any;

      if (scope === 'personal') {
        queryRef = queryRef.where('uid', '==', identifier);
      } else {
        queryRef = queryRef.where('metadata.isPublic', '==', true);
      }

      const vectorQuery = queryRef.findNearest({
        vectorField: 'embedding',
        queryVector: queryEmbedding,
        limit: topK,
        distanceMeasure: 'COSINE'
      });

      const snapshot = await vectorQuery.get();
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        score: doc.data().score,
        text: doc.data().text,
        metadata: doc.data().metadata
      }));
    } catch (error) {
      logger.warn('Firestore Vector Search failed', error);
      return [];
    }
  }
}
