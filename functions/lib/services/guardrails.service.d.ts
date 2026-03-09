/**
 * GuardrailsService — Implements AI Verification and Validation logic.
 * Ensures AI outputs meet quality, safety, and brand standards.
 */
export declare class GuardrailsService {
    /**
     * validatePoem
     * Checks for structural integrity (4-line quatrain) and emotional alignment.
     */
    static validatePoem(text: string, expectedType: string): {
        valid: boolean;
        error?: string;
    };
    /**
     * validateSentiment
     * Verifies that the LLM-generated sentiment score is within a sane range.
     */
    static validateSentiment(score: number): boolean;
}
//# sourceMappingURL=guardrails.service.d.ts.map