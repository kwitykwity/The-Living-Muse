import * as logger from 'firebase-functions/logger';
import { db } from '../config/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { UsageEventDoc, UsageAction } from '../types/firestore';

/**
 * Track a usage event — called after every AI API call.
 * This is the cost tracking backbone of the entire system.
 */
export async function trackUsage(params: {
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
}): Promise<string> {
  const eventRef = db.collection('usage_events').doc();

  const event: UsageEventDoc = {
    id: eventRef.id,
    uid: params.uid,
    action: params.action,
    model: params.model,
    tokensInput: params.tokensInput,
    tokensOutput: params.tokensOutput,
    durationSeconds: params.durationSeconds,
    estimatedCostUSD: params.estimatedCostUSD,
    creditsCharged: params.creditsCharged || 0,
    success: params.success,
    error: params.error,
    metadata: params.metadata,
    createdAt: Timestamp.now(),
  };

  await eventRef.set(event);

  logger.info('Usage event tracked', {
    uid: params.uid,
    action: params.action,
    model: params.model,
    cost: params.estimatedCostUSD,
    success: params.success,
  });

  return eventRef.id;
}

/**
 * Get total estimated cost for a user in the current month.
 */
export async function getUserMonthlyCost(uid: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const snapshot = await db
    .collection('usage_events')
    .where('uid', '==', uid)
    .where('createdAt', '>=', Timestamp.fromDate(startOfMonth))
    .where('success', '==', true)
    .get();

  let totalCost = 0;
  snapshot.forEach((doc) => {
    totalCost += (doc.data() as UsageEventDoc).estimatedCostUSD;
  });

  return totalCost;
}
