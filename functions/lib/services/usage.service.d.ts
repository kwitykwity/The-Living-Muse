import { UsageAction } from '../types/firestore';
/**
 * Track a usage event — called after every AI API call.
 * This is the cost tracking backbone of the entire system.
 */
export declare function trackUsage(params: {
    uid: string;
    action: UsageAction;
    model: string;
    tokensInput?: number;
    tokensOutput?: number;
    durationSeconds?: number;
    estimatedCostUSD: number;
    creditsCharged?: number;
    success: boolean;
    error?: string;
    metadata?: Record<string, unknown>;
}): Promise<string>;
/**
 * Get total estimated cost for a user in the current month.
 */
export declare function getUserMonthlyCost(uid: string): Promise<number>;
//# sourceMappingURL=usage.service.d.ts.map