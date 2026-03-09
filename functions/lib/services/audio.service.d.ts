/**
 * AudioService — Handles poem narration and premium voice synthesis.
 */
export declare class AudioService {
    /**
     * synthesizePoem
     * Standard: Google Cloud TTS
     * Premium: High-fidelity (e.g., ElevenLabs or Neural2)
     */
    static synthesizePoem(params: {
        uid: string;
        text: string;
        voiceId: string;
        speed?: number;
        storagePath: string;
    }): Promise<{
        storageURL: string;
        sizeBytes: number;
    }>;
}
//# sourceMappingURL=audio.service.d.ts.map