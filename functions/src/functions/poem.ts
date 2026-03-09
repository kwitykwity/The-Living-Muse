import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from '../config/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import {
  PoemDoc,
  MuseDoc,
  PoemStyle,
  PoemMood,
  VIBE_STYLE_MAP,
  COLOR_PROMPT_MAP,
  POEM_STYLE_PROMPTS,
  MOOD_PROMPTS,
} from '../types/firestore';
import { deductCredits, refundCredits } from '../services/credit.service';
import { orchestratePoemGeneration, generateRequestId } from '../ai/orchestrator';
import { MemoryService } from '../services/memory.service';
import { VectorService } from '../services/vector.service';

/**
 * generatePoem — callable function
 * Deducts 1 credit → generates poem from muse context + style/mood.
 * Personalizes output via Creative Memory Service.
 * Refunds on failure.
 */
export const generatePoem = onCall(
  { timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const uid = request.auth.uid;
    const {
      museId,
      prompt,
      vibe,
      poemStyle = 'free_verse',
      mood = 'nostalgic',
      poemType,
      previousTurns = [],
    } = request.data;

    // Deduct 1 credit
    const { creditsCharged, balanceAfter } = await deductCredits(uid, 'poem');

    try {
      // Get user data and memory context
      const userDoc = await db.collection('users').doc(uid).get();
      const userData = userDoc.data()!;
      const isPro = userData.subscriptionTier === 'pro' || userData.subscriptionTier === 'studio';
      const userMemory = await MemoryService.getUserContext(uid, prompt || mood);

      // Build context — muse context is optional (poems can be standalone)
      let context = '';
      if (museId) {
        const museDoc = await db.collection('muses').doc(museId).get();
        if (!museDoc.exists || (museDoc.data() as MuseDoc).uid !== uid) {
          await refundCredits(uid, creditsCharged, 'Muse not found');
          throw new HttpsError('not-found', 'Muse not found or access denied.');
        }
        const muse = museDoc.data() as MuseDoc;
        const vibeStyle = VIBE_STYLE_MAP[muse.vibePreset as keyof typeof VIBE_STYLE_MAP] || '';
        const colorStyle = COLOR_PROMPT_MAP[muse.colorPalette] || '';
        context = `Visual context: ${muse.artisticStyle} style portrait. Vibe: ${vibeStyle}. Colors: ${colorStyle}.`;
      }

      // Add style and mood directions
      const styleDirection = POEM_STYLE_PROMPTS[poemStyle as PoemStyle] || POEM_STYLE_PROMPTS.free_verse;
      const moodDirection = MOOD_PROMPTS[mood as PoemMood] || MOOD_PROMPTS.nostalgic;
      const fullContext = `${context} ${styleDirection}. ${moodDirection}. Voice: artistic, emotional, imagery-rich.`;

      // Generate poem via orchestrator
      const requestId = generateRequestId();
      const result = await orchestratePoemGeneration(
        { uid, requestId },
        { 
          context: fullContext, 
          vibe: vibe || (museId ? (await db.collection('muses').doc(museId).get()).data()?.vibePreset : userData.vibePreset),
          prompt, 
          emotion: mood, 
          poemType, 
          previousTurns,
          userMemory,
          isPro 
        }
      );

      if (!result.success || !result.data) {
        await refundCredits(uid, creditsCharged, `Poem generation failed: ${result.error}`);
        throw new HttpsError('internal', `Poem generation failed: ${result.error}`);
      }

      // Record sentiment in UserDoc (Empathetic AI Learning)
      await MemoryService.recordSentiment(
        uid, 
        result.data.sentimentScore, 
        result.data.sentiment as any
      );

      // Save poem to Firestore
      const poemRef = db.collection('poems').doc();
      const poemDoc: PoemDoc = {
        id: poemRef.id,
        uid,
        museId: museId || undefined,
        textContent: result.data.textContent,
        promptUsed: prompt || mood || 'auto-generated',
        poemStyle: poemStyle as PoemStyle,
        mood: mood as PoemMood,
        sentiment: result.data.sentiment as any,
        sentimentScore: result.data.sentimentScore,
        poemType: result.data.poemType as any,
        generationModel: result.model,
        tokensUsed: (result.tokensInput || 0) + (result.tokensOutput || 0),
        version: 1,
        isEdited: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await poemRef.set(poemDoc);
      logger.info(`Poem ${poemRef.id} created for user ${uid} (${creditsCharged} credit)`);

      // 6. Index in Vectorstore for future RAG recall
      await VectorService.upsertToVectorDB({
        uid,
        id: poemRef.id,
        text: result.data.textContent,
        metadata: {
          type: 'poem',
          mood: mood as string,
          vibe: vibe as string,
          relatedId: poemRef.id
        }
      }).catch(err => logger.error('Failed to index poem in vectorstore', err));

      return {
        poemId: poemRef.id,
        textContent: result.data.textContent,
        sentiment: result.data.sentiment,
        sentimentScore: result.data.sentimentScore,
        poemType: result.data.poemType,
        creditsCharged,
        balanceAfter,
      };
    } catch (error: any) {
      if (error?.code !== 'internal' && error?.code !== 'not-found') {
        await refundCredits(uid, creditsCharged, `Unexpected error: ${error?.message}`);
      }
      throw error;
    }
  }
);
