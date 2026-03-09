/**
 * VideoService — Integrates with Veo 3 for high-performance video generation.
 */
export declare class VideoService {
    /**
     * generateVideo
     * Submits a video generation job to Veo 3.
     */
    static generateVideo(params: {
        uid: string;
        sourceImageGcsUri: string;
        prompt: string;
        model: string;
        durationSeconds: number;
        fps?: number;
    }): Promise<{
        jobId: string;
        status: string;
    }>;
}
//# sourceMappingURL=video.service.d.ts.map