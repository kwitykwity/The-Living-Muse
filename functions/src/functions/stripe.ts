import { onCall, HttpsError, onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from '../config/firebase-admin';
import { env, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '../config/env';
import { StripeService } from '../services/stripe.service';
import { grantCredits, upgradeTier } from '../services/credit.service';
import { SubscriptionTier, SubscriptionDoc } from '../types/firestore';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * createStripeCheckout — Callable
 * Initiates a Stripe Checkout session for a subscription or credit pack.
 */
export const createStripeCheckout = onCall({ secrets: [STRIPE_SECRET_KEY] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in.');
  }
// ... (rest of the code remains the same)

  const { priceId, mode, successUrl, cancelUrl } = request.data;

  if (!priceId || !mode || !successUrl || !cancelUrl) {
    throw new HttpsError('invalid-argument', 'Missing required parameters.');
  }

  const uid = request.auth.uid;
  const userDoc = await db.collection('users').doc(uid).get();
  const userData = userDoc.data();

  if (!userData) {
    throw new HttpsError('not-found', 'User not found.');
  }

  try {
    const session = await StripeService.createCheckoutSession({
      uid,
      email: userData.email,
      priceId,
      mode: mode as 'subscription' | 'payment',
      successUrl,
      cancelUrl,
      customerId: userData.stripeCustomerId,
    });

    return { url: session.url };
  } catch (error: any) {
    logger.error('Stripe Checkout Error:', error);
    throw new HttpsError('internal', error.message || 'Failed to create checkout session.');
  }
});

/**
 * stripeWebhook — HTTPS Webhook
 * Handles Stripe events (checkout.session.completed, etc).
 */
export const stripeWebhook = onRequest({ secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET] }, async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;
// ... (rest of the code remains the same)

  let event;
  try {
    event = StripeService.constructEvent(req.rawBody, signature);
  } catch (err: any) {
    logger.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  const session = event.data.object as any;

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(session);
      break;
    
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(session);
      break;

    default:
      logger.info(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * handleCheckoutCompleted
 * Processes successful payments for subscriptions or credit packs.
 */
async function handleCheckoutCompleted(session: any) {
  const uid = session.client_reference_id || session.metadata?.uid;
  if (!uid) {
    logger.error('No UID found in checkout session', session.id);
    return;
  }

  // Save stripe customer ID if not present
  if (session.customer) {
    await db.collection('users').doc(uid).update({
      stripeCustomerId: session.customer,
      updatedAt: Timestamp.now(),
    });
  }

  // Handle Subscription
  if (session.mode === 'subscription') {
    const subscriptionId = session.subscription as string;
    // Map priceId to tier
    let tier: SubscriptionTier = 'free';
    const priceId = session.line_items?.data[0]?.price?.id || session.metadata?.priceId; // session.line_items might be empty depending on expand
    
    // Fallback mapping if priceId not in metadata (Stripe expanded objects preferred)
    if (Object.values(env.prices).includes(priceId)) {
       if (priceId === env.prices.starter) tier = 'starter';
       else if (priceId === env.prices.pro) tier = 'pro';
       else if (priceId === env.prices.studio) tier = 'studio';
    }

    if (tier !== 'free') {
      await upgradeTier(uid, tier);
      
      // Store subscription record
      await db.collection('subscriptions').doc(subscriptionId).set({
        id: subscriptionId,
        uid,
        tier,
        status: 'active',
        provider: 'stripe',
        providerSubscriptionId: subscriptionId,
        priceId: priceId || 'unknown',
        createdAt: Timestamp.now(),
      } as Partial<SubscriptionDoc>);
    }
  } 
  
  // Handle Credit Pack (One-time payment)
  else if (session.mode === 'payment') {
    let credits = 0;
    const priceId = session.metadata?.priceId; // Recommended to pass via metadata

    if (priceId === env.prices.pack50) credits = 50;
    else if (priceId === env.prices.pack150) credits = 150;
    else if (priceId === env.prices.pack500) credits = 500;
    else if (priceId === env.prices.pack1500) credits = 1500;

    if (credits > 0) {
      await grantCredits(uid, credits, `Stripe Purchase: ${priceId}`);
    }
  }
}

/**
 * handleSubscriptionDeleted
 * Reverts user to free tier.
 */
async function handleSubscriptionDeleted(subscription: any) {
  const uid = subscription.metadata?.uid;
  if (uid) {
    await db.collection('users').doc(uid).update({
      subscriptionTier: 'free',
      updatedAt: Timestamp.now(),
    });
    logger.info(`Subscription ${subscription.id} deleted, user ${uid} reverted to free.`);
  }
}
