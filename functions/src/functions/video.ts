import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from '../config/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import {
  MediaAssetDoc,
  VideoQualityTier,
  MotionStyle,
  CreditAction,
  VIDEO_TIER_CONFIG,
} from '../types/firestore';
import { deductCredits, refundCredits, requireTier } from '../services/credit.service';
import { trackUsage } from '../services/usage.service';
import { VideoService } from '../services/video.service';

/**
 * generateVideo — callable function
 * Pro+ only. Deducts 20–80 credits based on quality tier.
 * Generates a video from source image with motion style via Veo 3.
 */
export const generateVideo = onCall(
  { timeoutSeconds: 120, memory: '1GiB' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const uid = request.auth.uid;
    const {
      sourceImagePath,
      museId,
      poemId,
      qualityTier = 'standard',
      motionStyle = 'cinematic_drift',
      durationSeconds = 5,
      prompt,
      vibePreset = 'orchid_noir',
    } = request.data;

    // Validation
    if (!sourceImagePath || typeof sourceImagePath !== 'string') {
      throw new HttpsError('invalid-argument', 'sourceImagePath is required.');
    }
    if (!sourceImagePath.startsWith(`uploads/${uid}/`) && !sourceImagePath.startsWith(`avatars/${uid}/`)) {
      throw new HttpsError('permission-denied', 'Cannot access images from other users.');
    }

    // Validate quality tier
    const validTiers: VideoQualityTier[] = ['draft', 'standard', 'premium', 'cinematic'];
    if (!validTiers.includes(qualityTier)) {
      throw new HttpsError('invalid-argument', `Invalid quality tier: ${qualityTier}`);
    }

    // Validate motion style
    const validMotions: MotionStyle[] = ['slow_zoom', 'pan', 'parallax', 'cinematic_drift', 'dynamic', 'static'];
    if (!validMotions.includes(motionStyle)) {
      throw new HttpsError('invalid-argument', `Invalid motion style: ${motionStyle}`);
    }

    // Get tier config
    const tierConfig = VIDEO_TIER_CONFIG[qualityTier as VideoQualityTier];

    // Validate duration against tier max
    if (durationSeconds > tierConfig.maxDurationSeconds) {
      throw new HttpsError(
        'invalid-argument',
        `${qualityTier} tier supports up to ${tierConfig.maxDurationSeconds}s. Requested: ${durationSeconds}s.`
      );
    }

    // Require Pro+ tier
    await requireTier(uid, 'pro', 'Video generation');

    // Determine credit cost
    const creditAction: CreditAction = `video_${qualityTier}` as CreditAction;
    const { creditsCharged, balanceAfter } = await deductCredits(uid, creditAction);

    try {
      // 1. Refine prompt with AI "Double-Buffer"
      let sentimentScore = 0;
      if (poemId) {
        const poemDoc = await db.collection('poems').doc(poemId).get();
        sentimentScore = poemDoc.exists ? (poemDoc.data()?.sentimentScore || 0) : 0;
      }

      const technicalPrompt = await VideoService.refinePromptWithAI(uid, prompt || 'Poetic manifestation', vibePreset || 'orchid_noir', sentimentScore);
      const cinematicPrompt = buildCinematicSequence(motionStyle, technicalPrompt, durationSeconds);
      
      const sourceImageGcsUri = `gs://${process.env.STORAGE_BUCKET || 'the-living-muse.firebasestorage.app'}/${sourceImagePath}`;

      // Submit job to Veo 3 via VideoService
      const { jobId, status } = await VideoService.generateVideo({
        uid,
        sourceImageGcsUri,
        prompt: cinematicPrompt,
        model: tierConfig.model,
        durationSeconds,
      });

      // Save asset document
      const assetRef = db.collection('media_assets').doc();
      const assetDoc: MediaAssetDoc & { jobId?: string } = {
        id: assetRef.id,
        uid,
        museId: museId || undefined,
        poemId: poemId || undefined,
        type: 'video',
        qualityTier: qualityTier as VideoQualityTier,
        storageURL: '', // Will be updated by webhook/polling when job completes
        mimeType: 'video/mp4',
        sizeBytes: 0,
        durationSeconds,
        resolution: tierConfig.resolution,
        generationModel: tierConfig.model,
        motionStyle: motionStyle as MotionStyle,
        status: status as any,
        creditsCharged,
        createdAt: Timestamp.now(),
        jobId,
      } as any;

      await assetRef.set(assetDoc);

      // Track usage
      await trackUsage({
        uid,
        action: 'video_gen',
        model: tierConfig.model,
        durationSeconds,
        estimatedCostUSD: estimateVideoCost(qualityTier as VideoQualityTier, durationSeconds),
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
    } catch (error: any) {
      await refundCredits(uid, creditsCharged, `Video generation failed: ${error?.message}`);
      throw error;
    }
  }
);

// ─── Helpers ───

/**
 * buildCinematicSequence — Orchestrates rhythmic shot changes using LTX-2 standards.
 */
function buildCinematicSequence(motionStyle: string, technicalPrompt: string, duration: number): string {
  const sequences = [
    `Opening: Cinematic establishing wide angle, slow zoom on ${technicalPrompt}. Dolly zoom effect to intensify the emotional shift.`,
    `Mid-Stream: Dynamic orbit around the Muse, highlighting textures and mood. Rack focus from the environment to the Muse's gaze.`,
    `Outro: Macro-detail cut-away, symbolic resolution with volumetric bloom. Soft focus exit with ethereal light leaks.`
  ];

  // If duration is short (< 8s), use only opening and outro
  if (duration < 8) {
    return `${sequences[0]} ${sequences[2]} Motion: ${motionStyle}. High-fidelity, cinematic textures.`;
  }

  // Combine all three for standard/long videos
  return `${sequences.join(' ')} Motion: ${motionStyle}. High-fidelity resolution, 4k, professional cinematography.`;
}

function estimateVideoCost(tier: VideoQualityTier, durationSec: number): number {
  const baseCosts: Record<VideoQualityTier, number> = {
    draft: 0.10,     // per second
    standard: 0.10,
    premium: 0.15,
    cinematic: 0.20,
  };
  return baseCosts[tier] * durationSec;
}
