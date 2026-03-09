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
exports.generateVideo = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_admin_1 = require("../config/firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const firestore_2 = require("../types/firestore");
const credit_service_1 = require("../services/credit.service");
const usage_service_1 = require("../services/usage.service");
const video_service_1 = require("../services/video.service");
/**
 * generateVideo — callable function
 * Pro+ only. Deducts 20–80 credits based on quality tier.
 * Generates a video from source image with motion style via Veo 3.
 */
exports.generateVideo = (0, https_1.onCall)({ timeoutSeconds: 120, memory: '1GiB' }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be signed in.');
    }
    const uid = request.auth.uid;
    const { sourceImagePath, museId, poemId, qualityTier = 'standard', motionStyle = 'cinematic_drift', durationSeconds = 5, prompt, } = request.data;
    // Validation
    if (!sourceImagePath || typeof sourceImagePath !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'sourceImagePath is required.');
    }
    if (!sourceImagePath.startsWith(`uploads/${uid}/`) && !sourceImagePath.startsWith(`avatars/${uid}/`)) {
        throw new https_1.HttpsError('permission-denied', 'Cannot access images from other users.');
    }
    // Validate quality tier
    const validTiers = ['draft', 'standard', 'premium', 'cinematic'];
    if (!validTiers.includes(qualityTier)) {
        throw new https_1.HttpsError('invalid-argument', `Invalid quality tier: ${qualityTier}`);
    }
    // Validate motion style
    const validMotions = ['slow_zoom', 'pan', 'parallax', 'cinematic_drift', 'dynamic', 'static'];
    if (!validMotions.includes(motionStyle)) {
        throw new https_1.HttpsError('invalid-argument', `Invalid motion style: ${motionStyle}`);
    }
    // Get tier config
    const tierConfig = firestore_2.VIDEO_TIER_CONFIG[qualityTier];
    // Validate duration against tier max
    if (durationSeconds > tierConfig.maxDurationSeconds) {
        throw new https_1.HttpsError('invalid-argument', `${qualityTier} tier supports up to ${tierConfig.maxDurationSeconds}s. Requested: ${durationSeconds}s.`);
    }
    // Require Pro+ tier
    await (0, credit_service_1.requireTier)(uid, 'pro', 'Video generation');
    // Determine credit cost
    const creditAction = `video_${qualityTier}`;
    const { creditsCharged, balanceAfter } = await (0, credit_service_1.deductCredits)(uid, creditAction);
    try {
        const motionPrompt = buildMotionPrompt(motionStyle, prompt);
        const sourceImageGcsUri = `gs://${process.env.STORAGE_BUCKET || 'the-living-muse.firebasestorage.app'}/${sourceImagePath}`;
        // Submit job to Veo 3 via VideoService
        const { jobId, status } = await video_service_1.VideoService.generateVideo({
            uid,
            sourceImageGcsUri,
            prompt: motionPrompt,
            model: tierConfig.model,
            durationSeconds,
        });
        // Save asset document
        const assetRef = firebase_admin_1.db.collection('media_assets').doc();
        const assetDoc = {
            id: assetRef.id,
            uid,
            museId: museId || undefined,
            poemId: poemId || undefined,
            type: 'video',
            qualityTier: qualityTier,
            storageURL: '', // Will be updated by webhook/polling when job completes
            mimeType: 'video/mp4',
            sizeBytes: 0,
            durationSeconds,
            resolution: tierConfig.resolution,
            generationModel: tierConfig.model,
            motionStyle: motionStyle,
            status: status,
            creditsCharged,
            createdAt: firestore_1.Timestamp.now(),
            jobId,
        };
        await assetRef.set(assetDoc);
        // Track usage
        await (0, usage_service_1.trackUsage)({
            uid,
            action: 'video_gen',
            model: tierConfig.model,
            durationSeconds,
            estimatedCostUSD: estimateVideoCost(qualityTier, durationSeconds),
            success: true,
        });
        logger.info(`Video job ${jobId} created for user ${uid} (${creditsCharged} credits)`);
        return {
            videoAssetId: assetRef.id,
            jobId,
            status,
            qualityTier,
            creditsCharged,
            balanceAfter,
        };
    }
    catch (error) {
        await (0, credit_service_1.refundCredits)(uid, creditsCharged, `Video generation failed: ${error?.message}`);
        throw error;
    }
});
// ─── Helpers ───
function buildMotionPrompt(motionStyle, userPrompt) {
    const motionDescriptions = {
        slow_zoom: 'Camera slowly zooms in, revealing fine details. Smooth, contemplative motion.',
        pan: 'Camera pans horizontally across the scene. Steady, cinematic movement.',
        parallax: 'Multi-layer parallax effect creating depth. Foreground and background move at different speeds.',
        cinematic_drift: 'Gentle cinematic drift with subtle rotation. Ethereal, dreamy quality.',
        dynamic: 'Dynamic camera movement with energy. Quick shifts and dramatic angles.',
        static: 'Static image with subtle atmospheric effects. Gentle particle motion, light shifts.',
    };
    const base = motionDescriptions[motionStyle] || motionDescriptions.cinematic_drift;
    return userPrompt ? `${base} ${userPrompt}` : base;
}
function estimateVideoCost(tier, durationSec) {
    const baseCosts = {
        draft: 0.10, // per second
        standard: 0.10,
        premium: 0.15,
        cinematic: 0.20,
    };
    return baseCosts[tier] * durationSec;
}
//# sourceMappingURL=video.js.map