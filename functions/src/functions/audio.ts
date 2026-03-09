import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from '../config/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import {
  MediaAssetDoc,
  PoemDoc,
  AudioQualityTier,
  CreditAction,
  VOICE_OPTIONS,
} from '../types/firestore';
import { deductCredits, refundCredits } from '../services/credit.service';
import { trackUsage } from '../services/usage.service';
import { AudioService } from '../services/audio.service';

/**
 * synthesizePoemAudio — callable function
 * Deducts 3 credits (standard) or 10 credits (premium).
 * Generates audio narration of a poem via Google Cloud TTS.
 */
export const synthesizePoemAudio = onCall(
  { timeoutSeconds: 60, memory: '512MiB' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const uid = request.auth.uid;
    const {
      poemId,
      voiceId = 'sarah',
      voiceTier = 'standard',
      speed = 1.0,
    } = request.data;

    // Validation
    if (!poemId || typeof poemId !== 'string') {
      throw new HttpsError('invalid-argument', 'poemId is required.');
    }

    // Validate voice exists and matches tier
    const voice = VOICE_OPTIONS.find((v) => v.id === voiceId);
    if (!voice) {
      throw new HttpsError('invalid-argument', `Invalid voice: ${voiceId}`);
    }
    if (voice.tier !== voiceTier) {
      throw new HttpsError('invalid-argument', `Voice ${voiceId} is ${voice.tier}, not ${voiceTier}`);
    }

    // Determine credit action
    const creditAction: CreditAction = voiceTier === 'premium' ? 'audio_premium' : 'audio_standard';

    // Deduct credits
    const { creditsCharged, balanceAfter } = await deductCredits(uid, creditAction);

    try {
      // Verify poem belongs to user
      const poemDoc = await db.collection('poems').doc(poemId).get();
      if (!poemDoc.exists || (poemDoc.data() as PoemDoc).uid !== uid) {
        await refundCredits(uid, creditsCharged, 'Poem not found');
        throw new HttpsError('not-found', 'Poem not found or access denied.');
      }

      const poem = poemDoc.data() as PoemDoc;
      const audioStoragePath = `audio/${uid}/${poemId}_${voiceId}_${Date.now()}.mp3`;

      // 🎙️ Dynamic Prosody Calculation
      let dynamicRate = speed;
      let dynamicPitch = 0.0;

      const score = poem.sentimentScore || 0;
      if (score < -0.3) {
        // Melancholic/Deep
        dynamicRate *= 0.85;
        dynamicPitch = -2.0;
      } else if (score > 0.4) {
        // Joyful/Bright
        dynamicRate *= 1.1;
        dynamicPitch = 1.5;
      }

      const start = Date.now();
      // Call AudioService for real synthesis
      const { storageURL, sizeBytes } = await AudioService.synthesizePoem({
        uid,
        text: poem.textContent,
        voiceId,
        speed: dynamicRate,
        pitch: dynamicPitch,
        storagePath: audioStoragePath,
      });
      const durationMs = Date.now() - start;

      // ─── Monitoring ───
      const { MonitoringService } = require('../services/monitoring.service');
      await MonitoringService.trackAICall({
        uid,
        modality: 'audio',
        model: voiceTier === 'premium' ? 'neural2-expressive' : 'neural2-standard',
        durationMs,
        estimatedCostUSD: voiceTier === 'premium' ? 0.02 : 0.005,
        success: true
      });

      // Save asset document
      const assetRef = db.collection('media_assets').doc();
      const assetDoc: MediaAssetDoc = {
        id: assetRef.id,
        uid,
        poemId,
        museId: poem.museId,
        type: 'audio',
        qualityTier: voiceTier as AudioQualityTier,
        storageURL,
        mimeType: 'audio/mpeg',
        sizeBytes,
        durationSeconds: undefined,
        voiceId,
        voiceSpeed: speed,
        status: 'ready',
        creditsCharged,
        createdAt: Timestamp.now(),
      };

      await assetRef.set(assetDoc);

      // Track usage
      await trackUsage({
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
    } catch (error: any) {
      if (error?.code !== 'not-found') {
        await refundCredits(uid, creditsCharged, `Audio generation failed: ${error?.message}`);
      }
      throw error;
    }
  }
);
