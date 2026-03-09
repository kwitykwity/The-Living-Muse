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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioService = void 0;
const text_to_speech_1 = __importDefault(require("@google-cloud/text-to-speech"));
const logger = __importStar(require("firebase-functions/logger"));
const firebase_admin_1 = require("../config/firebase-admin");
const client = new text_to_speech_1.default.TextToSpeechClient();
/**
 * AudioService — Handles poem narration and premium voice synthesis.
 */
class AudioService {
    /**
     * synthesizePoem
     * Standard: Google Cloud TTS
     * Premium: High-fidelity (e.g., ElevenLabs or Neural2)
     */
    static async synthesizePoem(params) {
        logger.info(`Synthesizing audio for user ${params.uid}, voice: ${params.voiceId}`);
        // Map internal voice IDs to Google Cloud TTS voice names
        const voiceMap = {
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
            },
        });
        const audioContent = response.audioContent;
        if (!audioContent) {
            throw new Error('Audio content is empty after synthesis.');
        }
        // Upload to Cloud Storage
        const file = firebase_admin_1.bucket.file(params.storagePath);
        await file.save(Buffer.from(audioContent), {
            metadata: { contentType: 'audio/mpeg' },
        });
        return {
            storageURL: params.storagePath,
            sizeBytes: audioContent.byteLength,
        };
    }
}
exports.AudioService = AudioService;
//# sourceMappingURL=audio.service.js.map