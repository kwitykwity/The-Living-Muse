import { VertexAI } from '@google-cloud/vertexai';
import { env } from '../config/env';
import { refineTechnicalPrompt } from '../ai/orchestrator';
import * as logger from 'firebase-functions/logger';

/**
 * VideoService — Integrates with Veo 3 for high-performance video generation.
 */
export class VideoService {
  private static vertexAI = new VertexAI({ project: env.projectId, location: env.vertexLocation });

  /**
   * refinePromptWithAI
   * Uses the orchestrator "Double-Buffer" turn to improve technical fidelity.
   */
  static async refinePromptWithAI(uid: string, intent: string, vibe: string, sentimentScore?: number): Promise<string> {
    return refineTechnicalPrompt(
      { uid, requestId: Date.now().toString() },
      intent,
      'video',
      vibe,
      sentimentScore
    );
  }

  /**
   * generateVideo
   * Submits a video generation job to Veo 3 via Vertex AI.
   */
  static async generateVideo(params: {
    uid: string;
    sourceImageGcsUri: string;
    prompt: string;
    model: string;
    durationSeconds: number;
    fps?: number;
  }): Promise<{ jobId: string; status: string }> {
    const start = Date.now();
    try {
      const model = this.vertexAI.getGenerativeModel({ model: params.model });

      // Call generateContent with video parameters
      const result = await (model as any).generateContent({
        contents: [{
          role: 'user',
          parts: [
            { text: params.prompt },
            { fileData: { mimeType: 'image/png', fileUri: params.sourceImageGcsUri } }
          ]
        }],
        generationConfig: {
          maxOutputTokens: 1,
          videoConfig: {
            durationSeconds: params.durationSeconds,
            fps: params.fps || 24,
          }
        } as any
      });

      const response = await result.response;
      const durationMs = Date.now() - start;
      const jobId = response.usageMetadata?.promptTokenCount?.toString() || `job_${Date.now()}`;

      const { MonitoringService } = require('./monitoring.service');
      await MonitoringService.trackAICall({
        modality: 'video',
        model: params.model,
        durationMs,
        estimatedCostUSD: params.durationSeconds * 0.2, // Rough estimate
        success: true
      });

      return { jobId, status: 'processing' };
    } catch (error: any) {
      const durationMs = Date.now() - start;
      logger.error('Veo 3 generation failed', { error: error.message, uid: params.uid });
      
      const { MonitoringService } = require('./monitoring.service');
      await MonitoringService.trackAICall({
        modality: 'video',
        model: params.model,
        durationMs,
        estimatedCostUSD: 0,
        success: false,
        error: error.message
      });

      throw new Error(`Video generation service unavailable: ${error.message}`);
    }
  }
}
