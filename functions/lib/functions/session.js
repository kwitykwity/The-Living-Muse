"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.continueConversationalPoem = exports.startConversationalSession = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_admin_1 = require("../config/firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const credit_service_1 = require("../services/credit.service");
const orchestrator_1 = require("../ai/orchestrator");
const memory_service_1 = require("../services/memory.service");
/**
 * startConversationalSession
 * Initializes a new chat session with a Muse for interactive poem creation.
 */
exports.startConversationalSession = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be signed in.');
    }
    const uid = request.auth.uid;
    const { museId } = request.data;
    const sessionRef = firebase_admin_1.db.collection('sessions').doc();
    const session = {
        id: sessionRef.id,
        uid,
        museId: museId || 'system_muse',
        type: 'conversational',
        turns: [],
        currentSentiment: 'reflective',
        turnCount: 0,
        maxTurns: 20,
        status: 'active',
        createdAt: firestore_1.Timestamp.now(),
        updatedAt: firestore_1.Timestamp.now(),
    };
    await sessionRef.set(session);
    return { sessionId: sessionRef.id };
});
/**
 * continueConversationalPoem
 * Refines an existing poem or creates one via dialogue with the Muse.
 * Costs 1 credit per refinement turn.
 */
exports.continueConversationalPoem = (0, https_1.onCall)({ timeoutSeconds: 60 }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be signed in.');
    }
    const uid = request.auth.uid;
    const { sessionId, userFeedback, poemId } = request.data;
    if (!sessionId || !userFeedback || !poemId) {
        throw new https_1.HttpsError('invalid-argument', 'sessionId, userFeedback, and poemId are required.');
    }
    // Deduct 1 credit for refinement
    const { creditsCharged, balanceAfter } = await (0, credit_service_1.deductCredits)(uid, 'refinement');
    try {
        // 1. Fetch Session
        const sessionDoc = await firebase_admin_1.db.collection('sessions').doc(sessionId).get();
        if (!sessionDoc.exists || sessionDoc.data().uid !== uid) {
            throw new https_1.HttpsError('not-found', 'Session not found.');
        }
        const session = sessionDoc.data();
        // 2. Fetch Current Poem
        const poemDoc = await firebase_admin_1.db.collection('poems').doc(poemId).get();
        if (!poemDoc.exists || poemDoc.data().uid !== uid) {
            throw new https_1.HttpsError('not-found', 'Poem not found.');
        }
        const poem = poemDoc.data();
        // 3. Get User Memory
        const userMemory = await memory_service_1.MemoryService.getUserContext(uid);
        // 4. Orchestrate Refinement
        const requestId = (0, orchestrator_1.generateRequestId)();
        const result = await (0, orchestrator_1.orchestrateRefinementTurn)({ uid, requestId }, {
            poemId,
            currentContent: poem.textContent,
            userFeedback,
            history: session.turns,
            userMemory
        });
        if (!result.success || !result.data) {
            throw new Error(result.error || 'AI Refinement failed');
        }
        // 5. Update Poem + Sentiment
        const newTurn = {
            role: 'user',
            content: userFeedback,
            timestamp: firestore_1.Timestamp.now()
        };
        const museTurn = {
            role: 'muse',
            content: result.data.textContent,
            sentiment: result.data.sentiment,
            timestamp: firestore_1.Timestamp.now()
        };
        const batch = firebase_admin_1.db.batch();
        // Update session history
        batch.update(firebase_admin_1.db.collection('sessions').doc(sessionId), {
            turns: firestore_1.FieldValue.arrayUnion(newTurn, museTurn),
            turnCount: firestore_1.FieldValue.increment(2),
            currentSentiment: result.data.sentiment,
            updatedAt: firestore_1.Timestamp.now()
        });
        // Update poem content
        batch.update(firebase_admin_1.db.collection('poems').doc(poemId), {
            textContent: result.data.textContent,
            sentiment: result.data.sentiment,
            sentimentScore: result.data.sentimentScore,
            version: firestore_1.FieldValue.increment(1),
            isEdited: true,
            updatedAt: firestore_1.Timestamp.now()
        });
        await batch.commit();
        // Record sentiment trend
        await memory_service_1.MemoryService.recordSentiment(uid, result.data.sentimentScore, result.data.sentiment);
        return {
            textContent: result.data.textContent,
            sentiment: result.data.sentiment,
            balanceAfter
        };
    }
    catch (error) {
        await (0, credit_service_1.refundCredits)(uid, creditsCharged, error.message);
        throw new https_1.HttpsError('internal', error.message);
    }
});
//# sourceMappingURL=session.js.map