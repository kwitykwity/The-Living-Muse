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
exports.stripeWebhook = exports.createStripeCheckout = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_admin_1 = require("../config/firebase-admin");
const env_1 = require("../config/env");
const stripe_service_1 = require("../services/stripe.service");
const credit_service_1 = require("../services/credit.service");
const firestore_1 = require("firebase-admin/firestore");
/**
 * createStripeCheckout — Callable
 * Initiates a Stripe Checkout session for a subscription or credit pack.
 */
exports.createStripeCheckout = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be signed in.');
    }
    const { priceId, mode, successUrl, cancelUrl } = request.data;
    if (!priceId || !mode || !successUrl || !cancelUrl) {
        throw new https_1.HttpsError('invalid-argument', 'Missing required parameters.');
    }
    const uid = request.auth.uid;
    const userDoc = await firebase_admin_1.db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    if (!userData) {
        throw new https_1.HttpsError('not-found', 'User not found.');
    }
    try {
        const session = await stripe_service_1.StripeService.createCheckoutSession({
            uid,
            email: userData.email,
            priceId,
            mode: mode,
            successUrl,
            cancelUrl,
            customerId: userData.stripeCustomerId,
        });
        return { url: session.url };
    }
    catch (error) {
        logger.error('Stripe Checkout Error:', error);
        throw new https_1.HttpsError('internal', error.message || 'Failed to create checkout session.');
    }
});
/**
 * stripeWebhook — HTTPS Webhook
 * Handles Stripe events (checkout.session.completed, etc).
 */
exports.stripeWebhook = (0, https_1.onRequest)(async (req, res) => {
    const signature = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe_service_1.StripeService.constructEvent(req.rawBody, signature);
    }
    catch (err) {
        logger.error('Webhook signature verification failed:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    const session = event.data.object;
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
async function handleCheckoutCompleted(session) {
    const uid = session.client_reference_id || session.metadata?.uid;
    if (!uid) {
        logger.error('No UID found in checkout session', session.id);
        return;
    }
    // Save stripe customer ID if not present
    if (session.customer) {
        await firebase_admin_1.db.collection('users').doc(uid).update({
            stripeCustomerId: session.customer,
            updatedAt: firestore_1.Timestamp.now(),
        });
    }
    // Handle Subscription
    if (session.mode === 'subscription') {
        const subscriptionId = session.subscription;
        // Map priceId to tier
        let tier = 'free';
        const priceId = session.line_items?.data[0]?.price?.id || session.metadata?.priceId; // session.line_items might be empty depending on expand
        // Fallback mapping if priceId not in metadata (Stripe expanded objects preferred)
        if (Object.values(env_1.env.prices).includes(priceId)) {
            if (priceId === env_1.env.prices.starter)
                tier = 'starter';
            else if (priceId === env_1.env.prices.pro)
                tier = 'pro';
            else if (priceId === env_1.env.prices.studio)
                tier = 'studio';
        }
        if (tier !== 'free') {
            await (0, credit_service_1.upgradeTier)(uid, tier);
            // Store subscription record
            await firebase_admin_1.db.collection('subscriptions').doc(subscriptionId).set({
                id: subscriptionId,
                uid,
                tier,
                status: 'active',
                provider: 'stripe',
                providerSubscriptionId: subscriptionId,
                priceId: priceId || 'unknown',
                createdAt: firestore_1.Timestamp.now(),
            });
        }
    }
    // Handle Credit Pack (One-time payment)
    else if (session.mode === 'payment') {
        let credits = 0;
        const priceId = session.metadata?.priceId; // Recommended to pass via metadata
        if (priceId === env_1.env.prices.pack50)
            credits = 50;
        else if (priceId === env_1.env.prices.pack150)
            credits = 150;
        else if (priceId === env_1.env.prices.pack500)
            credits = 500;
        else if (priceId === env_1.env.prices.pack1500)
            credits = 1500;
        if (credits > 0) {
            await (0, credit_service_1.grantCredits)(uid, credits, `Stripe Purchase: ${priceId}`);
        }
    }
}
/**
 * handleSubscriptionDeleted
 * Reverts user to free tier.
 */
async function handleSubscriptionDeleted(subscription) {
    const uid = subscription.metadata?.uid;
    if (uid) {
        await firebase_admin_1.db.collection('users').doc(uid).update({
            subscriptionTier: 'free',
            updatedAt: firestore_1.Timestamp.now(),
        });
        logger.info(`Subscription ${subscription.id} deleted, user ${uid} reverted to free.`);
    }
}
//# sourceMappingURL=stripe.js.map