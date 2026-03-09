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
exports.createMuseFromPhoto = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_admin_1 = require("../config/firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const firestore_2 = require("../types/firestore");
const credit_service_1 = require("../services/credit.service");
const orchestrator_1 = require("../ai/orchestrator");
const memory_service_1 = require("../services/memory.service");
/**
 * createMuseFromPhoto — callable function
 * Deducts 5 credits → uploads photo → calls AI → creates Muse document.
 * Personalizes style via Creative Memory Service.
 * Refunds credits on failure.
 */
exports.createMuseFromPhoto = (0, https_1.onCall)({ timeoutSeconds: 60, memory: '1GiB' }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be signed in.');
    }
    const uid = request.auth.uid;
    const { photoStoragePath, artisticStyle = 'orchid_surrealism', stylizationStrength = 70, aspectRatio = '1:1', } = request.data;
    // Validation
    if (!photoStoragePath || typeof photoStoragePath !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'photoStoragePath is required.');
    }
    if (!photoStoragePath.startsWith(`uploads/${uid}/`)) {
        throw new https_1.HttpsError('permission-denied', 'Cannot access photos from other users.');
    }
    // Deduct credits BEFORE generation (reserve pattern)
    const { creditsCharged, balanceAfter } = await (0, credit_service_1.deductCredits)(uid, 'avatar');
    try {
        // Get user preferences and memory context
        const userDoc = await firebase_admin_1.db.collection('users').doc(uid).get();
        const userData = userDoc.data();
        const tier = userData.subscriptionTier;
        const features = firestore_2.TIER_FEATURES[tier];
        const userMemory = await memory_service_1.MemoryService.getUserContext(uid);
        // Build style prompt from artistic style + vibe + color + memory
        const styleBase = firestore_2.AVATAR_STYLE_PROMPTS[artisticStyle] || firestore_2.AVATAR_STYLE_PROMPTS.orchid_surrealism;
        const vibeStyle = firestore_2.VIBE_STYLE_MAP[userData.vibePreset] || '';
        const colorStyle = firestore_2.COLOR_PROMPT_MAP[userData.favoriteColor] || firestore_2.COLOR_PROMPT_MAP.purple;
        const strengthLabel = stylizationStrength > 70 ? 'heavily stylized' : stylizationStrength > 40 ? 'moderately stylized' : 'subtly stylized';
        const stylePrompt = `${styleBase}. ${vibeStyle}. Color palette: ${colorStyle}. ${userMemory}. Orchid flower elements woven into the composition. ${strengthLabel}. Optimized with Nano Banana high-fidelity creative studio rendering.`;
        // Determine resolution based on tier
        const resolution = features.exportResolution === '4K' ? '4096x4096'
            : features.exportResolution === '1080p' ? '2048x2048'
                : '1024x1024';
        // Generate avatar via orchestrator (retry + fallback)
        const requestId = (0, orchestrator_1.generateRequestId)();
        const result = await (0, orchestrator_1.orchestrateAvatarGeneration)({ uid, requestId }, photoStoragePath, stylePrompt, userData.vibePreset, resolution);
        if (!result.success || !result.data) {
            // Refund credits on failure
            await (0, credit_service_1.refundCredits)(uid, creditsCharged, `Avatar generation failed: ${result.error}`);
            throw new https_1.HttpsError('internal', `Avatar generation failed: ${result.error}`);
        }
        // Upload avatar to storage
        const museId = firebase_admin_1.db.collection('muses').doc().id;
        const avatarPath = `avatars/${uid}/${museId}_avatar.png`;
        const thumbPath = `thumbnails/${uid}/${museId}_thumb.webp`;
        const bucket = firebase_admin_1.storage.bucket();
        const avatarFile = bucket.file(avatarPath);
        await avatarFile.save(result.data.imageBuffer, {
            contentType: result.data.mimeType,
            metadata: { museId, uid },
        });
        // Create Muse document
        const museRef = firebase_admin_1.db.collection('muses').doc(museId);
        const museDoc = {
            id: museId,
            uid,
            originalPhotoURL: photoStoragePath,
            avatarURL: avatarPath,
            thumbnailURL: thumbPath,
            artisticStyle: artisticStyle,
            stylizationStrength,
            aspectRatio,
            vibePreset: userData.vibePreset,
            colorPalette: userData.favoriteColor,
            voiceID: 'aoede',
            status: 'ready',
            createdAt: firestore_1.Timestamp.now(),
        };
        await museRef.set(museDoc);
        logger.info(`Muse ${museId} created for user ${uid} (${creditsCharged} credits)`);
        return {
            museId,
            avatarURL: avatarPath,
            thumbnailURL: thumbPath,
            status: 'ready',
            creditsCharged,
            balanceAfter,
        };
    }
    catch (error) {
        // If the error is not already an HttpsError we threw above, refund
        if (error?.code !== 'internal') {
            await (0, credit_service_1.refundCredits)(uid, creditsCharged, `Unexpected error: ${error?.message}`);
        }
        throw error;
    }
});
//# sourceMappingURL=muse.js.map