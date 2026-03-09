import { UserDoc, SubscriptionTier, CreditAction } from '../types/firestore';
export interface CreditStatus {
    balance: number;
    purchased: number;
    totalAvailable: number;
    limit: number;
    tier: SubscriptionTier;
    resetDate: Date;
}
/**
 * Check a user's current credit status, resetting monthly credits if needed.
 * Uses a Firestore transaction to prevent race conditions.
 */
export declare function checkCredits(uid: string): Promise<CreditStatus>;
/**
 * Deduct credits for a generation action.
 * Uses purchased credits first (they never expire), then monthly balance.
 * Atomic transaction prevents double-deduction.
 */
export declare function deductCredits(uid: string, action: CreditAction): Promise<{
    creditsCharged: number;
    balanceAfter: number;
}>;
/**
 * Refund credits (for failed generations).
 * Credits go back to monthly balance first (up to limit), overflow to purchased.
 */
export declare function refundCredits(uid: string, amount: number, reason: string): Promise<void>;
/**
 * Grant credits from a pack purchase. Purchased credits never expire.
 */
export declare function grantCredits(uid: string, amount: number, source: string): Promise<void>;
/**
 * Upgrade user to a new tier. Immediately grants the new tier's credit allocation.
 */
export declare function upgradeTier(uid: string, newTier: SubscriptionTier): Promise<void>;
/**
 * Downgrade user to a lower tier. Credits don't decrease until next reset.
 */
export declare function downgradeTier(uid: string, newTier: SubscriptionTier): Promise<void>;
/**
 * Require a minimum tier for a feature. Throws descriptive error if not met.
 */
export declare function requireTier(uid: string, minTier: SubscriptionTier, feature: string): Promise<UserDoc>;
//# sourceMappingURL=credit.service.d.ts.map