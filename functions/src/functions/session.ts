import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db } from '../config/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { SessionDoc, ConversationTurn, PoemDoc } from '../types/firestore';
import { deductCredits, refundCredits } from '../services/credit.service';
import { orchestrateRefinementTurn, generateRequestId } from '../ai/orchestrator';
import { MemoryService } from '../services/memory.service';

/**
 * startConversationalSession
 * Initializes a new chat session with a Muse for interactive poem creation.
 */
export const startConversationalSession = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in.');
  }

  const uid = request.auth.uid;
  const { museId } = request.data;

  const sessionRef = db.collection('sessions').doc();
  const session: SessionDoc = {
    id: sessionRef.id,
    uid,
    museId: museId || 'system_muse',
    type: 'conversational',
    turns: [],
    currentSentiment: 'reflective',
    turnCount: 0,
    maxTurns: 20,
    status: 'active',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await sessionRef.set(session);
  return { sessionId: sessionRef.id };
});

/**
 * continueConversationalPoem
 * Refines an existing poem or creates one via dialogue with the Muse.
 * Costs 1 credit per refinement turn.
 */
export const continueConversationalPoem = onCall(
  { timeoutSeconds: 60 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const uid = request.auth.uid;
    const { sessionId, userFeedback, poemId } = request.data;

    if (!sessionId || !userFeedback || !poemId) {
      throw new HttpsError('invalid-argument', 'sessionId, userFeedback, and poemId are required.');
    }

    // Deduct 1 credit for refinement
    const { creditsCharged, balanceAfter } = await deductCredits(uid, 'refinement');

    try {
      // 1. Fetch Session
      const sessionDoc = await db.collection('sessions').doc(sessionId).get();
      if (!sessionDoc.exists || (sessionDoc.data() as SessionDoc).uid !== uid) {
        throw new HttpsError('not-found', 'Session not found.');
      }
      const session = sessionDoc.data() as SessionDoc;

      // 2. Fetch Current Poem
      const poemDoc = await db.collection('poems').doc(poemId).get();
      if (!poemDoc.exists || (poemDoc.data() as PoemDoc).uid !== uid) {
        throw new HttpsError('not-found', 'Poem not found.');
      }
      const poem = poemDoc.data() as PoemDoc;

      // 3. Get User Memory
      const userMemory = await MemoryService.getUserContext(uid);

      // 4. Orchestrate Refinement
      const requestId = generateRequestId();
      const result = await orchestrateRefinementTurn(
        { uid, requestId },
        {
          poemId,
          currentContent: poem.textContent,
          userFeedback,
          history: session.turns,
          userMemory
        }
      );

      if (!result.success || !result.data) {
        throw new Error(result.error || 'AI Refinement failed');
      }

      // 5. Update Poem + Sentiment
      const newTurn: ConversationTurn = {
        role: 'user',
        content: userFeedback,
        timestamp: Timestamp.now()
      };
      
      const museTurn: ConversationTurn = {
        role: 'muse',
        content: result.data.textContent,
        sentiment: result.data.sentiment as any,
        timestamp: Timestamp.now()
      };

      const batch = db.batch();
      
      // Update session history
      batch.update(db.collection('sessions').doc(sessionId), {
        turns: FieldValue.arrayUnion(newTurn, museTurn),
        turnCount: FieldValue.increment(2),
        currentSentiment: result.data.sentiment,
        updatedAt: Timestamp.now()
      });

      // Update poem content
      batch.update(db.collection('poems').doc(poemId), {
        textContent: result.data.textContent,
        sentiment: result.data.sentiment,
        sentimentScore: result.data.sentimentScore,
        version: FieldValue.increment(1),
        isEdited: true,
        updatedAt: Timestamp.now()
      });

      await batch.commit();

      // Record sentiment trend
      await MemoryService.recordSentiment(uid, result.data.sentimentScore, result.data.sentiment as any);

      return {
        textContent: result.data.textContent,
        sentiment: result.data.sentiment,
        balanceAfter
      };
    } catch (error: any) {
      await refundCredits(uid, creditsCharged, error.message);
      throw new HttpsError('internal', error.message);
    }
  }
);
