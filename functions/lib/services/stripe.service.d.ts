import Stripe from 'stripe';
/**
 * StripeService — Manages Stripe lifecycle (Checkout + Webhooks).
 */
export declare const stripe: Stripe;
export declare class StripeService {
    /**
     * createCheckoutSession
     * Generates a link for user to pay for subscription or credit pack.
     */
    static createCheckoutSession(params: {
        uid: string;
        email: string;
        priceId: string;
        mode: 'subscription' | 'payment';
        successUrl: string;
        cancelUrl: string;
        customerId?: string;
    }): Promise<{
        sessionId: string;
        url: string | null;
    }>;
    /**
     * constructEvent
     * Validates that the webhook came from Stripe.
     */
    static constructEvent(payload: string | Buffer, signature: string): Stripe.Event;
}
//# sourceMappingURL=stripe.service.d.ts.map