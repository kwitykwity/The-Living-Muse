import { db } from '../config/firebase-admin';
import { UserDoc, Sentiment } from '../types/firestore';
import * as logger from 'firebase-functions/logger';
import { VectorService } from './vector.service';

/**
 * MemoryService — Manages user context retention and sentiment learning.
 * This service helps the AI "learn" the user's style and emotional trends over time.
 */

export class MemoryService {
  /**
   * recordSentiment
   * Updates the user's rolling sentiment average and stores the last detected sentiment.
   * @param uid User ID
   * @param score Numeric sentiment score (-1.0 to 1.0)
   * @param label Sentiment label (melancholic, joyful, etc.)
   */
  static async recordSentiment(uid: string, score: number, label: Sentiment): Promise<void> {
    const userRef = db.collection('users').doc(uid);
    
    try {
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) return;

        const userData = userDoc.data() as UserDoc;
        const currentTrend = userData.sentimentTrend || 0;
        
        // Calculate rolling average (weighted 20% to new sentiment)
        const newTrend = (currentTrend * 0.8) + (score * 0.2);

        transaction.update(userRef, {
          sentimentTrend: Number(newTrend.toFixed(4)),
          lastSentiment: label,
          updatedAt: new Date(),
        });
      });
      
      logger.info(`Recorded sentiment for user ${uid}: ${label} (${score})`);
    } catch (error) {
      logger.error(`Failed to record sentiment for user ${uid}`, error);
    }
  }

  /**
   * getUserContext
   * Retrieves user context to inject into AI prompts for personalization.
   * Now performs a semantic (RAG) search for hyper-relevant memories.
   * @param uid User ID
   * @param query The current prompt/mood to search against
   */
  static async getUserContext(uid: string, query?: string): Promise<string> {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) return '';

    const userData = userDoc.data() as UserDoc;
    const trend = userData.sentimentTrend || 0;
    const last = userData.lastSentiment;

    // 1. Basic Persona Context
    let context = `User Persona: Tends to have a ${trend < -0.2 ? 'melancholic/reflective' : trend > 0.2 ? 'joyful/positive' : 'balanced'} creative output. `;
    if (last) context += `Last creation tone: ${last}. `;
    if (userData.favoriteColor) context += `Preference: ${userData.favoriteColor}. `;
    if (userData.vibePreset) context += `Vibe: ${userData.vibePreset}. `;

    // 2. Semantic Memory Retrieval (RAG)
    if (query) {
      const searchResult = await VectorService.searchSimilarMemories(uid, query, 3);
      if (searchResult.length > 0) {
        context += '\n--- Relevant Artistic Memories ---\n';
        searchResult.forEach((mem: any) => {
          context += `- ${mem.text}\n`;
        });
      }
    }

    return context;
  }
}
