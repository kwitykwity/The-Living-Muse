import Stripe from 'stripe';
import { env } from '../config/env';

/**
 * StripeService — Manages Stripe lifecycle (Checkout + Webhooks).
 */
export const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: '2026-02-25.clover' as any, // Match expected version
  typescript: true,
});

export class StripeService {
  /**
   * createCheckoutSession
   * Generates a link for user to pay for subscription or credit pack.
   */
  static async createCheckoutSession(params: {
    uid: string;
    email: string;
    priceId: string;
    mode: 'subscription' | 'payment';
    successUrl: string;
    cancelUrl: string;
    customerId?: string;
  }) {
    const session = await stripe.checkout.sessions.create({
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
  static constructEvent(payload: string | Buffer, signature: string) {
    return stripe.webhooks.constructEvent(payload, signature, env.stripeWebhookSecret);
  }
}
