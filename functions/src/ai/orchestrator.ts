import * as logger from 'firebase-functions/logger';
import { createFlashPoemAdapter, createProPoemAdapter } from './gemini';
import { ImagenAvatarAdapter } from './imagen';
import { env } from '../config/env';
import { trackUsage } from '../services/usage.service';
import { GuardrailsService } from '../services/guardrails.service';

/**
 * AI Orchestrator — manages the multi-step AI pipeline with
 * retry logic, fallbacks, usage tracking, and cost control.
 * Incorporates AI Verification and Validation (Guardrails).
 */

interface OrchestrationContext {
  uid: string;
  requestId: string; // For idempotency
}

/**
 * Generate an avatar with retry + fallback.
 * Primary: Nano Banana (Gemini 3 Pro Image)
 * Fallback: Imagen 3 Fast
 */
export async function orchestrateAvatarGeneration(
  ctx: OrchestrationContext,
  photoURL: string,
  stylePrompt: string,
  vibe: string,
  resolution: '1024x1024' | '2048x2048' | '4096x4096'
) {
  const primary = new ImagenAvatarAdapter(env.imagenModel);
  const fallback = new ImagenAvatarAdapter('imagen-3-fast');

  // Try primary
  let result = await primary.generateAvatar({ photoURL, stylePrompt, vibe, resolution });

  // Retry once on failure
  if (!result.success) {
    logger.warn(`Avatar gen failed (${result.model}), retrying...`, { error: result.error });
    result = await primary.generateAvatar({ photoURL, stylePrompt, vibe, resolution });
  }

  // Fallback to cheaper model
  if (!result.success) {
    logger.warn(`Avatar gen failed again, falling back to ${fallback}...`);
    result = await fallback.generateAvatar({ photoURL, stylePrompt, vibe, resolution });
  }

  // Track usage regardless of outcome
  await trackUsage({
    uid: ctx.uid,
    action: 'avatar_gen',
    model: result.model,
    durationSeconds: result.durationMs / 1000,
    estimatedCostUSD: result.estimatedCostUSD,
    success: result.success,
    error: result.error,
  });

  return result;
}

/**
 * Generate a poem with retry + fallback.
 * Primary: Gemini 3.1 Pro (pro users) or Gemini 3 Flash (free users)
 * Fallback: Always falls back to Gemini 3 Flash
 */
export async function orchestratePoemGeneration(
  ctx: OrchestrationContext,
  input: {
    context: string;
    vibe?: string;
    prompt?: string;
    emotion?: string;
    poemType?: string;
    previousTurns?: { role: string; content: string }[];
    userMemory?: string;
    isPro: boolean;
  }
) {
  const primary = input.isPro ? createProPoemAdapter() : createFlashPoemAdapter();
  const fallback = createFlashPoemAdapter();

  let result = await primary.generatePoem(input);

  // AI Verification & Validation (Guardrails)
  if (result.success && result.data) {
    const validation = GuardrailsService.validatePoem(result.data.textContent, input.poemType || 'quatrain');
    if (!validation.valid) {
      logger.warn(`AI Validation failed: ${validation.error}. Retrying with Pro model...`);
      // Force Pro model for retry if validation failed on Flash
      const retryAdapter = createProPoemAdapter();
      result = await retryAdapter.generatePoem(input);
    }
  }

  // Final validation check
  if (result.success && result.data) {
    const finalCheck = GuardrailsService.validatePoem(result.data.textContent, input.poemType || 'quatrain');
    if (!finalCheck.valid) {
      // Retry once with fallback if primary failed validation
      logger.warn(`Final validation failed: ${finalCheck.error}. Attempting fallback...`);
      result = await fallback.generatePoem(input);
    }
  }

  // Track usage
  await trackUsage({
    uid: ctx.uid,
    action: 'poem_gen',
    model: result.model,
    tokensInput: result.tokensInput,
    tokensOutput: result.tokensOutput,
    durationSeconds: result.durationMs / 1000,
    estimatedCostUSD: result.estimatedCostUSD,
    success: result.success,
    error: result.error,
  });

  return result;
}

/**
 * refineTechnicalPrompt — The "Double-Buffer" technician turn.
 * Converts creative intent/sentiment into model-ready technical parameters.
 */
export async function refineTechnicalPrompt(
  ctx: OrchestrationContext,
  intent: string,
  modality: 'video' | 'image',
  vibe: string = 'orchid_noir',
  sentimentScore: number = 0
) {
  const adapter = createFlashPoemAdapter(); // Flash is fast and sufficient for technical mapping
  
  // Define facial gestures based on sentiment score
  let facialGestures = '';
  if (modality === 'video') {
    if (sentimentScore < -0.4) {
      facialGestures = "Expression: Wistful, downward gaze, slight quiver of the lip, profound melancholy.";
    } else if (sentimentScore > 0.4) {
      facialGestures = "Expression: Radiant smile, eyes sparkling with joy, head tilted slightly back.";
    } else if (sentimentScore < 0) {
      facialGestures = "Expression: Reflective, steady deep gaze, calm and contemplative facial muscles.";
    } else {
      facialGestures = "Expression: Gentle curious look, soft pleasant smile, presence of mind.";
    }
  }

  const systemContext = `You are a Technical Cinematographer and Prompt Engineer for The Living Muse.
Your job is to convert creative intent into precise technical parameters for ${modality === 'video' ? 'Veo 3' : 'Imagen 3'}.
Vibe Preset: ${vibe}.
${facialGestures ? `EMOTIONAL CUE: ${facialGestures}` : ''}
Output ONLY the final prompt string. No conversational filler.
Include cinematic technical terms: chiaroscuro, volumetric lighting, shot types, camera motion, specific color hex codes congruent with ${vibe}.`;

  const result = await adapter.generatePoem({
    context: systemContext,
    prompt: `Refine this creative intent: "${intent}" into a highly detailed ${modality} prompt. ${modality === 'video' ? 'Ensure the facial gestures described are integrated into the technical direction.' : ''}`
  });

  return result.success ? result.data?.textContent || intent : intent;
}

/**
 * Orchestrate a conversational refinement turn.
 * Uses Gemini 3.1 Pro exclusively for high-context awareness.
 */
export async function orchestrateRefinementTurn(
  ctx: OrchestrationContext,
  input: {
    poemId: string;
    currentContent: string;
    userFeedback: string;
    history: { role: string; content: string }[];
    userMemory?: string;
  }
) {
  const adapter = createProPoemAdapter();
  
  // Custom orchestration for refinement
  const result = await adapter.generatePoem({
    context: `You are the User's Muse. Refine this poem: "${input.currentContent}". User feedback: "${input.userFeedback}". Reference history if needed.`,
    previousTurns: input.history,
    userMemory: input.userMemory
  });

  // Track usage
  await trackUsage({
    uid: ctx.uid,
    action: 'poem_gen', // Categorized as poem generation
    model: result.model,
    tokensInput: result.tokensInput,
    tokensOutput: result.tokensOutput,
    durationSeconds: result.durationMs / 1000,
    estimatedCostUSD: result.estimatedCostUSD,
    success: result.success,
    error: result.error,
  });

  return result;
}

/**
 * Generate a unique request ID for idempotency.
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
