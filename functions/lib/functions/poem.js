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
exports.generatePoem = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_admin_1 = require("../config/firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const firestore_2 = require("../types/firestore");
const credit_service_1 = require("../services/credit.service");
const orchestrator_1 = require("../ai/orchestrator");
const memory_service_1 = require("../services/memory.service");
const vector_service_1 = require("../services/vector.service");
/**
 * generatePoem — callable function
 * Deducts 1 credit → generates poem from muse context + style/mood.
 * Personalizes output via Creative Memory Service.
 * Refunds on failure.
 */
exports.generatePoem = (0, https_1.onCall)({ timeoutSeconds: 30 }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be signed in.');
    }
    const uid = request.auth.uid;
    const { museId, prompt, vibe, poemStyle = 'free_verse', mood = 'nostalgic', poemType, previousTurns = [], } = request.data;
    // Deduct 1 credit
    const { creditsCharged, balanceAfter } = await (0, credit_service_1.deductCredits)(uid, 'poem');
    try {
        // Get user data and memory context
        const userDoc = await firebase_admin_1.db.collection('users').doc(uid).get();
        const userData = userDoc.data();
        const isPro = userData.subscriptionTier === 'pro' || userData.subscriptionTier === 'studio';
        const userMemory = await memory_service_1.MemoryService.getUserContext(uid, prompt || mood);
        // Build context — muse context is optional (poems can be standalone)
        let context = '';
        if (museId) {
            const museDoc = await firebase_admin_1.db.collection('muses').doc(museId).get();
            if (!museDoc.exists || museDoc.data().uid !== uid) {
                await (0, credit_service_1.refundCredits)(uid, creditsCharged, 'Muse not found');
                throw new https_1.HttpsError('not-found', 'Muse not found or access denied.');
            }
            const muse = museDoc.data();
            const vibeStyle = firestore_2.VIBE_STYLE_MAP[muse.vibePreset] || '';
            const colorStyle = firestore_2.COLOR_PROMPT_MAP[muse.colorPalette] || '';
            context = `Visual context: ${muse.artisticStyle} style portrait. Vibe: ${vibeStyle}. Colors: ${colorStyle}.`;
        }
        // Add style and mood directions
        const styleDirection = firestore_2.POEM_STYLE_PROMPTS[poemStyle] || firestore_2.POEM_STYLE_PROMPTS.free_verse;
        const moodDirection = firestore_2.MOOD_PROMPTS[mood] || firestore_2.MOOD_PROMPTS.nostalgic;
        const fullContext = `${context} ${styleDirection}. ${moodDirection}. Voice: artistic, emotional, imagery-rich.`;
        // Generate poem via orchestrator
        const requestId = (0, orchestrator_1.generateRequestId)();
        const result = await (0, orchestrator_1.orchestratePoemGeneration)({ uid, requestId }, {
            context: fullContext,
            vibe: vibe || (museId ? (await firebase_admin_1.db.collection('muses').doc(museId).get()).data()?.vibePreset : userData.vibePreset),
            prompt,
            emotion: mood,
            poemType,
            previousTurns,
            userMemory,
            isPro
        });
        if (!result.success || !result.data) {
            await (0, credit_service_1.refundCredits)(uid, creditsCharged, `Poem generation failed: ${result.error}`);
            throw new https_1.HttpsError('internal', `Poem generation failed: ${result.error}`);
        }
        // Record sentiment in UserDoc (Empathetic AI Learning)
        await memory_service_1.MemoryService.recordSentiment(uid, result.data.sentimentScore, result.data.sentiment);
        // Save poem to Firestore
        const poemRef = firebase_admin_1.db.collection('poems').doc();
        const poemDoc = {
            id: poemRef.id,
            uid,
            museId: museId || undefined,
            textContent: result.data.textContent,
            promptUsed: prompt || mood || 'auto-generated',
            poemStyle: poemStyle,
            mood: mood,
            sentiment: result.data.sentiment,
            sentimentScore: result.data.sentimentScore,
            poemType: result.data.poemType,
            generationModel: result.model,
            tokensUsed: (result.tokensInput || 0) + (result.tokensOutput || 0),
            version: 1,
            isEdited: false,
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        };
        await poemRef.set(poemDoc);
        logger.info(`Poem ${poemRef.id} created for user ${uid} (${creditsCharged} credit)`);
        // 6. Index in Vectorstore for future RAG recall
        await vector_service_1.VectorService.upsertToVectorDB({
            uid,
            id: poemRef.id,
            text: result.data.textContent,
            metadata: {
                type: 'poem',
                mood: mood,
                vibe: vibe,
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
    }
    catch (error) {
        if (error?.code !== 'internal' && error?.code !== 'not-found') {
            await (0, credit_service_1.refundCredits)(uid, creditsCharged, `Unexpected error: ${error?.message}`);
        }
        throw error;
    }
});
//# sourceMappingURL=poem.js.map