import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db, storage } from '../config/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import {
  MuseDoc,
  AvatarStyle,
  AVATAR_STYLE_PROMPTS,
  VIBE_STYLE_MAP,
  COLOR_PROMPT_MAP,
  TIER_FEATURES,
} from '../types/firestore';
import { deductCredits, refundCredits } from '../services/credit.service';
import { orchestrateAvatarGeneration, generateRequestId } from '../ai/orchestrator';
import { MemoryService } from '../services/memory.service';

/**
 * createMuseFromPhoto — callable function
 * Deducts 5 credits → uploads photo → calls AI → creates Muse document.
 * Personalizes style via Creative Memory Service.
 * Refunds credits on failure.
 */
export const createMuseFromPhoto = onCall(
  { timeoutSeconds: 60, memory: '1GiB' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const uid = request.auth.uid;
    const {
      photoStoragePath,
      artisticStyle = 'orchid_surrealism',
      stylizationStrength = 70,
      aspectRatio = '1:1',
    } = request.data;

    // Validation
    if (!photoStoragePath || typeof photoStoragePath !== 'string') {
      throw new HttpsError('invalid-argument', 'photoStoragePath is required.');
    }
    if (!photoStoragePath.startsWith(`uploads/${uid}/`)) {
      throw new HttpsError('permission-denied', 'Cannot access photos from other users.');
    }

    // Deduct credits BEFORE generation (reserve pattern)
    const { creditsCharged, balanceAfter } = await deductCredits(uid, 'avatar');

    try {
      // Get user preferences and memory context
      const userDoc = await db.collection('users').doc(uid).get();
      const userData = userDoc.data()!;
      const tier = userData.subscriptionTier;
      const features = TIER_FEATURES[tier as keyof typeof TIER_FEATURES];
      const userMemory = await MemoryService.getUserContext(uid);

      // Build style prompt from artistic style + vibe + color + memory
      const styleBase = AVATAR_STYLE_PROMPTS[artisticStyle as AvatarStyle] || AVATAR_STYLE_PROMPTS.orchid_surrealism;
      const vibeStyle = VIBE_STYLE_MAP[userData.vibePreset as keyof typeof VIBE_STYLE_MAP] || '';
      const colorStyle = COLOR_PROMPT_MAP[userData.favoriteColor] || COLOR_PROMPT_MAP.purple;
      const strengthLabel = stylizationStrength > 70 ? 'heavily stylized' : stylizationStrength > 40 ? 'moderately stylized' : 'subtly stylized';

      const stylePrompt = `${styleBase}. ${vibeStyle}. Color palette: ${colorStyle}. ${userMemory}. Orchid flower elements woven into the composition. ${strengthLabel}. Optimized with Nano Banana high-fidelity creative studio rendering.`;

      // Determine resolution based on tier
      const resolution = features.exportResolution === '4K' ? '4096x4096' as const
        : features.exportResolution === '1080p' ? '2048x2048' as const
        : '1024x1024' as const;

      // Generate avatar via orchestrator (retry + fallback)
      const requestId = generateRequestId();
      const result = await orchestrateAvatarGeneration(
        { uid, requestId },
        photoStoragePath,
        stylePrompt,
        userData.vibePreset,
        resolution
      );

      if (!result.success || !result.data) {
        // Refund credits on failure
        await refundCredits(uid, creditsCharged, `Avatar generation failed: ${result.error}`);
        throw new HttpsError('internal', `Avatar generation failed: ${result.error}`);
      }

      // Upload avatar to storage
      const museId = db.collection('muses').doc().id;
      const avatarPath = `avatars/${uid}/${museId}_avatar.png`;
      const thumbPath = `thumbnails/${uid}/${museId}_thumb.webp`;

      const bucket = storage.bucket();
      const avatarFile = bucket.file(avatarPath);
      await avatarFile.save(result.data.imageBuffer, {
        contentType: result.data.mimeType,
        metadata: { museId, uid },
      });

      // Create Muse document
      const museRef = db.collection('muses').doc(museId);
      const museDoc: MuseDoc = {
        id: museId,
        uid,
        originalPhotoURL: photoStoragePath,
        avatarURL: avatarPath,
        thumbnailURL: thumbPath,
        artisticStyle: artisticStyle as AvatarStyle,
        stylizationStrength,
        aspectRatio,
        vibePreset: userData.vibePreset,
        colorPalette: userData.favoriteColor,
        voiceID: 'aoede',
        status: 'ready',
        createdAt: Timestamp.now(),
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
    } catch (error: any) {
      // If the error is not already an HttpsError we threw above, refund
      if (error?.code !== 'internal') {
        await refundCredits(uid, creditsCharged, `Unexpected error: ${error?.message}`);
      }
      throw error;
    }
  }
);
