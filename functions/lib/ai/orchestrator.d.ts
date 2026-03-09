/**
 * AI Orchestrator — manages the multi-step AI pipeline with
 * retry logic, fallbacks, usage tracking, and cost control.
 * Incorporates AI Verification and Validation (Guardrails).
 */
interface OrchestrationContext {
    uid: string;
    requestId: string;
}
/**
 * Generate an avatar with retry + fallback.
 * Primary: Nano Banana (Gemini 3 Pro Image)
 * Fallback: Imagen 3 Fast
 */
export declare function orchestrateAvatarGeneration(ctx: OrchestrationContext, photoURL: string, stylePrompt: string, vibe: string, resolution: '1024x1024' | '2048x2048' | '4096x4096'): Promise<import("./adapter").AIGenerationResult<import("./adapter").AvatarGenerationOutput>>;
/**
 * Generate a poem with retry + fallback.
 * Primary: Gemini 3.1 Pro (pro users) or Gemini 3 Flash (free users)
 * Fallback: Always falls back to Gemini 3 Flash
 */
export declare function orchestratePoemGeneration(ctx: OrchestrationContext, input: {
    context: string;
    vibe?: string;
    prompt?: string;
    emotion?: string;
    poemType?: string;
    previousTurns?: {
        role: string;
        content: string;
    }[];
    userMemory?: string;
    isPro: boolean;
}): Promise<import("./adapter").AIGenerationResult<import("./adapter").PoemGenerationOutput>>;
/**
 * Orchestrate a conversational refinement turn.
 * Uses Gemini 3.1 Pro exclusively for high-context awareness.
 */
export declare function orchestrateRefinementTurn(ctx: OrchestrationContext, input: {
    poemId: string;
    currentContent: string;
    userFeedback: string;
    history: {
        role: string;
        content: string;
    }[];
    userMemory?: string;
}): Promise<import("./adapter").AIGenerationResult<import("./adapter").PoemGenerationOutput>>;
/**
 * Generate a unique request ID for idempotency.
 */
export declare function generateRequestId(): string;
export {};
//# sourceMappingURL=orchestrator.d.ts.map