"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = exports.stripe = void 0;
const stripe_1 = __importDefault(require("stripe"));
const env_1 = require("../config/env");
/**
 * StripeService — Manages Stripe lifecycle (Checkout + Webhooks).
 */
exports.stripe = new stripe_1.default(env_1.env.stripeSecretKey, {
    apiVersion: '2026-02-25.clover', // Match expected version
    typescript: true,
});
class StripeService {
    /**
     * createCheckoutSession
     * Generates a link for user to pay for subscription or credit pack.
     */
    static async createCheckoutSession(params) {
        const session = await exports.stripe.checkout.sessions.create({
            customer: params.customerId,
            customer_email: params.customerId ? undefined : params.email,
            line_items: [{ price: params.priceId, quantity: 1 }],
            mode: params.mode,
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            client_reference_id: params.uid,
            metadata: { uid: params.uid },
            subscription_data: params.mode === 'subscription' ? {
                metadata: { uid: params.uid }
            } : undefined,
        });
        return { sessionId: session.id, url: session.url };
    }
    /**
     * constructEvent
     * Validates that the webhook came from Stripe.
     */
    static constructEvent(payload, signature) {
        return exports.stripe.webhooks.constructEvent(payload, signature, env_1.env.stripeWebhookSecret);
    }
}
exports.StripeService = StripeService;
//# sourceMappingURL=stripe.service.js.map