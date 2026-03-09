import { IPoemAdapter, PoemGenerationInput, PoemGenerationOutput, AIGenerationResult } from './adapter';
/**
 * Gemini Poem Adapter — generates poetry via Gemini 3.1 Pro or Flash.
 * Uses real Vertex AI SDK for empathetic semantic analysis.
 */
export declare class GeminiPoemAdapter implements IPoemAdapter {
    private model;
    private vertexAI;
    private generativeModel;
    constructor(model?: string);
    generatePoem(input: PoemGenerationInput): Promise<AIGenerationResult<PoemGenerationOutput>>;
    private buildSystemPrompt;
    private buildUserPrompt;
    private estimateCost;
}
/**
 * Create a Flash adapter for cost-optimized draft poems (free tier)
 */
export declare function createFlashPoemAdapter(): GeminiPoemAdapter;
/**
 * Create a Pro adapter for high-quality final poems (pro tier)
 */
export declare function createProPoemAdapter(): GeminiPoemAdapter;
//# sourceMappingURL=gemini.d.ts.map