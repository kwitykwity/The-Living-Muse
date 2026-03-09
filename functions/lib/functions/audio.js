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
exports.synthesizePoemAudio = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_admin_1 = require("../config/firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const firestore_2 = require("../types/firestore");
const credit_service_1 = require("../services/credit.service");
const usage_service_1 = require("../services/usage.service");
const audio_service_1 = require("../services/audio.service");
/**
 * synthesizePoemAudio — callable function
 * Deducts 3 credits (standard) or 10 credits (premium).
 * Generates audio narration of a poem via Google Cloud TTS.
 */
exports.synthesizePoemAudio = (0, https_1.onCall)({ timeoutSeconds: 60, memory: '512MiB' }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be signed in.');
    }
    const uid = request.auth.uid;
    const { poemId, voiceId = 'sarah', voiceTier = 'standard', speed = 1.0, } = request.data;
    // Validation
    if (!poemId || typeof poemId !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'poemId is required.');
    }
    // Validate voice exists and matches tier
    const voice = firestore_2.VOICE_OPTIONS.find((v) => v.id === voiceId);
    if (!voice) {
        throw new https_1.HttpsError('invalid-argument', `Invalid voice: ${voiceId}`);
    }
    if (voice.tier !== voiceTier) {
        throw new https_1.HttpsError('invalid-argument', `Voice ${voiceId} is ${voice.tier}, not ${voiceTier}`);
    }
    // Determine credit action
    const creditAction = voiceTier === 'premium' ? 'audio_premium' : 'audio_standard';
    // Deduct credits
    const { creditsCharged, balanceAfter } = await (0, credit_service_1.deductCredits)(uid, creditAction);
    try {
        // Verify poem belongs to user
        const poemDoc = await firebase_admin_1.db.collection('poems').doc(poemId).get();
        if (!poemDoc.exists || poemDoc.data().uid !== uid) {
            await (0, credit_service_1.refundCredits)(uid, creditsCharged, 'Poem not found');
            throw new https_1.HttpsError('not-found', 'Poem not found or access denied.');
        }
        const poem = poemDoc.data();
        const audioStoragePath = `audio/${uid}/${poemId}_${voiceId}_${Date.now()}.mp3`;
        // Call AudioService for real synthesis
        const { storageURL, sizeBytes } = await audio_service_1.AudioService.synthesizePoem({
            uid,
            text: poem.textContent,
            voiceId,
            speed,
            storagePath: audioStoragePath,
        });
        // Save asset document
        const assetRef = firebase_admin_1.db.collection('media_assets').doc();
        const assetDoc = {
            id: assetRef.id,
            uid,
            poemId,
            museId: poem.museId,
            type: 'audio',
            qualityTier: voiceTier,
            storageURL,
            mimeType: 'audio/mpeg',
            sizeBytes,
            durationSeconds: undefined,
            voiceId,
            voiceSpeed: speed,
            status: 'ready',
            creditsCharged,
            createdAt: firestore_1.Timestamp.now(),
        };
        await assetRef.set(assetDoc);
        // Track usage
        await (0, usage_service_1.trackUsage)({
            uid,
            action: 'audio_gen',
            model: voiceTier === 'premium' ? 'neural2-expressive' : 'neural2-standard',
            estimatedCostUSD: voiceTier === 'premium' ? 0.02 : 0.005,
            success: true,
        });
        logger.info(`Audio ${assetRef.id} created for poem ${poemId} (${creditsCharged} credits)`);
        return {
            audioAssetId: assetRef.id,
            storageURL,
            voiceId,
            voiceTier,
            creditsCharged,
            balanceAfter,
        };
    }
    catch (error) {
        if (error?.code !== 'not-found') {
            await (0, credit_service_1.refundCredits)(uid, creditsCharged, `Audio generation failed: ${error?.message}`);
        }
        throw error;
    }
});
//# sourceMappingURL=audio.js.map