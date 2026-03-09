/**
 * createStripeCheckout — Callable
 * Initiates a Stripe Checkout session for a subscription or credit pack.
 */
export declare const createStripeCheckout: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    url: string | null;
}>>;
/**
 * stripeWebhook — HTTPS Webhook
 * Handles Stripe events (checkout.session.completed, etc).
 */
export declare const stripeWebhook: import("firebase-functions/v2/https").HttpsFunction;
//# sourceMappingURL=stripe.d.ts.map