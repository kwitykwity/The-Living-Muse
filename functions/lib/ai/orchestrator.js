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
Object.defineProperty(exports, "__esModule", { value: true });
exports.orchestrateAvatarGeneration = orchestrateAvatarGeneration;
exports.orchestratePoemGeneration = orchestratePoemGeneration;
exports.orchestrateRefinementTurn = orchestrateRefinementTurn;
exports.generateRequestId = generateRequestId;
const logger = __importStar(require("firebase-functions/logger"));
const gemini_1 = require("./gemini");
const imagen_1 = require("./imagen");
const env_1 = require("../config/env");
const usage_service_1 = require("../services/usage.service");
const guardrails_service_1 = require("../services/guardrails.service");
/**
 * Generate an avatar with retry + fallback.
 * Primary: Nano Banana (Gemini 3 Pro Image)
 * Fallback: Imagen 3 Fast
 */
async function orchestrateAvatarGeneration(ctx, photoURL, stylePrompt, vibe, resolution) {
    const primary = new imagen_1.ImagenAvatarAdapter(env_1.env.imagenModel);
    const fallback = new imagen_1.ImagenAvatarAdapter('imagen-3-fast');
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
    await (0, usage_service_1.trackUsage)({
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
async function orchestratePoemGeneration(ctx, input) {
    const primary = input.isPro ? (0, gemini_1.createProPoemAdapter)() : (0, gemini_1.createFlashPoemAdapter)();
    const fallback = (0, gemini_1.createFlashPoemAdapter)();
    let result = await primary.generatePoem(input);
    // AI Verification & Validation (Guardrails)
    if (result.success && result.data) {
        const validation = guardrails_service_1.GuardrailsService.validatePoem(result.data.textContent, input.poemType || 'quatrain');
        if (!validation.valid) {
            logger.warn(`AI Validation failed: ${validation.error}. Retrying with Pro model...`);
            // Force Pro model for retry if validation failed on Flash
            const retryAdapter = (0, gemini_1.createProPoemAdapter)();
            result = await retryAdapter.generatePoem(input);
        }
    }
    // Final validation check
    if (result.success && result.data) {
        const finalCheck = guardrails_service_1.GuardrailsService.validatePoem(result.data.textContent, input.poemType || 'quatrain');
        if (!finalCheck.valid) {
            // Retry once with fallback if primary failed validation
            logger.warn(`Final validation failed: ${finalCheck.error}. Attempting fallback...`);
            result = await fallback.generatePoem(input);
        }
    }
    // Track usage
    await (0, usage_service_1.trackUsage)({
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
 * Orchestrate a conversational refinement turn.
 * Uses Gemini 3.1 Pro exclusively for high-context awareness.
 */
async function orchestrateRefinementTurn(ctx, input) {
    const adapter = (0, gemini_1.createProPoemAdapter)();
    // Custom orchestration for refinement
    const result = await adapter.generatePoem({
        context: `You are the User's Muse. Refine this poem: "${input.currentContent}". User feedback: "${input.userFeedback}". Reference history if needed.`,
        previousTurns: input.history,
        userMemory: input.userMemory
    });
    // Track usage
    await (0, usage_service_1.trackUsage)({
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
function generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
//# sourceMappingURL=orchestrator.js.map