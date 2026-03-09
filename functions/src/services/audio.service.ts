import textToSpeech from '@google-cloud/text-to-speech';
import * as logger from 'firebase-functions/logger';
import { bucket } from '../config/firebase-admin';

const client = new textToSpeech.TextToSpeechClient();

/**
 * AudioService — Handles poem narration and premium voice synthesis.
 */
export class AudioService {
  /**
   * synthesizePoem
   * Standard: Google Cloud TTS
   * Premium: High-fidelity (e.g., ElevenLabs or Neural2)
   */
  static async synthesizePoem(params: {
    uid: string;
    text: string;
    voiceId: string;
    speed?: number;
    pitch?: number;
    storagePath: string;
  }): Promise<{ storageURL: string; sizeBytes: number }> {
    logger.info(`Synthesizing audio for user ${params.uid}, voice: ${params.voiceId}`);

    // Map internal voice IDs to Google Cloud TTS voice names
    const voiceMap: Record<string, { name: string; languageCode: string; ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL' }> = {
      sarah: { name: 'en-US-Neural2-F', languageCode: 'en-US', ssmlGender: 'FEMALE' },
      george: { name: 'en-US-Neural2-D', languageCode: 'en-US', ssmlGender: 'MALE' },
      lily: { name: 'en-GB-Neural2-A', languageCode: 'en-GB', ssmlGender: 'FEMALE' },
      brian: { name: 'en-AU-Neural2-B', languageCode: 'en-AU', ssmlGender: 'MALE' },
      // Premium (using more expressive voices)
      alice: { name: 'en-US-Studio-O', languageCode: 'en-US', ssmlGender: 'FEMALE' },
      daniel: { name: 'en-US-Studio-Q', languageCode: 'en-US', ssmlGender: 'MALE' },
      jessica: { name: 'en-GB-Wavenet-A', languageCode: 'en-GB', ssmlGender: 'FEMALE' },
      chris: { name: 'en-US-Wavenet-D', languageCode: 'en-US', ssmlGender: 'MALE' },
    };

    const voiceConfig = voiceMap[params.voiceId] || voiceMap.sarah;

    const [response] = await client.synthesizeSpeech({
      input: { text: params.text },
      voice: {
        name: voiceConfig.name,
        languageCode: voiceConfig.languageCode,
        ssmlGender: voiceConfig.ssmlGender,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: params.speed || 1.0,
        pitch: params.pitch || 0.0,
      },
    });

    const audioContent = response.audioContent as Uint8Array;
    if (!audioContent) {
      throw new Error('Audio content is empty after synthesis.');
    }

    // Upload to Cloud Storage
    const file = bucket.file(params.storagePath);
    await file.save(Buffer.from(audioContent), {
      metadata: { contentType: 'audio/mpeg' },
    });

    return {
      storageURL: params.storagePath,
      sizeBytes: audioContent.byteLength,
    };
  }
}
