import { VertexAI, GenerativeModel } from '@google-cloud/vertexai';
import * as logger from 'firebase-functions/logger';
import { env } from '../config/env';
import {
  IPoemAdapter,
  PoemGenerationInput,
  PoemGenerationOutput,
  AIGenerationResult,
} from './adapter';

/**
 * Gemini Poem Adapter — generates poetry via Gemini 3.1 Pro or Flash.
 * Uses real Vertex AI SDK for empathetic semantic analysis.
 */
export class GeminiPoemAdapter implements IPoemAdapter {
  private model: string;
  private vertexAI: VertexAI;
  private generativeModel: GenerativeModel;

  constructor(model?: string) {
    this.model = model || env.geminiModel;
    this.vertexAI = new VertexAI({ project: env.projectId, location: env.vertexLocation });
    this.generativeModel = this.vertexAI.getGenerativeModel({
      model: this.model,
      generationConfig: {
        responseMimeType: 'application/json',
        candidateCount: 1,
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });
  }

  async generatePoem(input: PoemGenerationInput): Promise<AIGenerationResult<PoemGenerationOutput>> {
    const start = Date.now();

    try {
      const systemPrompt = this.buildSystemPrompt(input);
      const userPrompt = this.buildUserPrompt(input);

      // ─── Call Vertex AI Gemini API ───
      const result = await this.generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
      });

      const response = await result.response;
      const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        throw new Error('No response text from Gemini');
      }

      // Parse the structured JSON response
      const parsed = JSON.parse(responseText);
      const durationMs = Date.now() - start;
      const estimatedCostUSD = this.estimateCost(
        response.usageMetadata?.promptTokenCount || 0,
        response.usageMetadata?.candidatesTokenCount || 0
      );

      // ─── Monitoring ───
      const { MonitoringService } = require('../services/monitoring.service');
      await MonitoringService.trackAICall({
        modality: 'text',
        model: this.model,
        durationMs,
        tokensInput: response.usageMetadata?.promptTokenCount || 0,
        tokensOutput: response.usageMetadata?.candidatesTokenCount || 0,
        estimatedCostUSD,
        success: true
      });

      return {
        success: true,
        data: {
          textContent: parsed.poem,
          sentiment: parsed.sentiment,
          sentimentScore: parsed.sentimentScore,
          poemType: input.poemType || 'quatrain',
        },
        model: this.model,
        tokensInput: response.usageMetadata?.promptTokenCount || 0,
        tokensOutput: response.usageMetadata?.candidatesTokenCount || 0,
        durationMs,
        estimatedCostUSD,
      };
    } catch (error: any) {
      const durationMs = Date.now() - start;
      logger.error('Gemini poem generation failed', { error: error.message, model: this.model });

      try {
        const { MonitoringService } = require('../services/monitoring.service');
        await MonitoringService.trackAICall({
          modality: 'text',
          model: this.model,
          durationMs,
          estimatedCostUSD: 0,
          success: false,
          error: error.message
        });
      } catch (monError) {
        logger.error('Failed to log AI failure to monitoring', monError);
      }

      return {
        success: false,
        model: this.model,
        durationMs,
        estimatedCostUSD: 0,
        error: error.message,
      };
    }
  }

  private buildSystemPrompt(input: PoemGenerationInput): string {
    const poemType = input.poemType || 'quatrain';
    
    return `You are The Living Muse — a sophisticated AI creative engine with deep semantic and sentimental intelligence.
Your purpose is to transform visual and emotional context into evocative poetry that captures the soul of the user.

You write in the style of ${poemType}.

CORE INSTRUCTIONS:
1. SEMANTIC DEPTH: Do not just describe the scene. Analyze the underlying meaning and mood.
2. SENTIMENTAL ALIGNMENT: Match the emotional frequency of the provided context.
3. CONTEXTUAL CONTINUITY: If user memory or previous conversation history is provided, weave it seamlessly into the new verse.
4. STRUCTURE: Exactly 4 lines for quatrains, 3 lines (5-7-5) for haiku, or natural flow for free verse.

RESPONSE FORMAT:
You MUST respond with a JSON object in this exact structure:
{
  "poem": "the generated poem text here",
  "sentiment": "one of: melancholic, joyful, fierce, reflective, playful, mysterious",
  "sentimentScore": -1.0 to 1.0 (float reflecting emotional depth),
  "analysis": "a 1-sentence analytical breakdown of the emotional arc"
}

Your voice is artistic, imagery-rich, and profoundly empathetic.`;
  }

  private buildUserPrompt(input: PoemGenerationInput): string {
    let prompt = '';

    if (input.userMemory) {
      prompt += `--- CREATIVE MEMORY (Personalization) ---\n${input.userMemory}\n\n`;
    }

    if (input.previousTurns && input.previousTurns.length > 0) {
      prompt += "--- CONVERSATION HISTORY ---\n";
      input.previousTurns.forEach(turn => {
        prompt += `${turn.role.toUpperCase()}: ${turn.content}\n`;
      });
      prompt += "\n";
    }

    prompt += "--- CURRENT CONTEXT ---\n";
    if (input.context) prompt += `Semantic Context: ${input.context}\n`;
    if (input.vibe) prompt += `Vibe Preset: ${input.vibe}\n`;
    if (input.emotion) prompt += `Sentimental Tone override: ${input.emotion}\n`;
    if (input.prompt) prompt += `User Input: "${input.prompt}"\n`;

    prompt += `\nGenerate a ${input.poemType || 'quatrain'} as requested in the JSON format.`;

    return prompt;
  }

  private estimateCost(inputTokens: number, outputTokens: number): number {
    if (this.model.includes('flash')) {
      return (inputTokens * 0.1 / 1_000_000) + (outputTokens * 0.4 / 1_000_000);
    }
    // Gemini 3.1 Pro (placeholder costs, adjust to actual GCP rates)
    return (inputTokens * 1.25 / 1_000_000) + (outputTokens * 5.0 / 1_000_000);
  }
}

/**
 * Create a Flash adapter for cost-optimized draft poems (free tier)
 */
export function createFlashPoemAdapter(): GeminiPoemAdapter {
  return new GeminiPoemAdapter(env.geminiFlashModel);
}

/**
 * Create a Pro adapter for high-quality final poems (pro tier)
 */
export function createProPoemAdapter(): GeminiPoemAdapter {
  return new GeminiPoemAdapter(env.geminiModel);
}
