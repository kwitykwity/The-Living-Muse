import * as logger from 'firebase-functions/logger';
import { db } from '../config/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

/**
 * MonitoringService — Infrastructure for "The Scale" (Phase 4).
 * Tracks performance, reliability, and cost of AI creative units.
 */
export class MonitoringService {
  /**
   * trackAICall
   * Records performance and cost metrics for an AI model invocation.
   */
  static async trackAICall(params: {
    uid?: string;
    modality: 'text' | 'image' | 'audio' | 'video' | 'vector';
    model: string;
    durationMs: number;
    tokensInput?: number;
    tokensOutput?: number;
    estimatedCostUSD: number;
    success: boolean;
    error?: string;
  }): Promise<void> {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // 1. Log to Cloud Logging (Structured)
    logger.info(`AI Performance Log: ${params.modality} via ${params.model}`, {
      ...params,
      logId,
      timestamp: new Date().toISOString()
    });

    // 2. Persist to Firestore for Dashboard Analytics
    const performanceRef = db.collection('system_monitoring').doc('ai_performance');
    const dayKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    try {
      await performanceRef.set({
        [dayKey]: {
          [params.modality]: {
            callCount: FieldValue.increment(1),
            failureCount: params.success ? FieldValue.increment(0) : FieldValue.increment(1),
            totalDurationMs: FieldValue.increment(params.durationMs),
            totalTokens: FieldValue.increment((params.tokensInput || 0) + (params.tokensOutput || 0)),
            totalCostUSD: FieldValue.increment(params.estimatedCostUSD),
          }
        }
      }, { merge: true });
    } catch (error) {
      logger.error('Failed to update monitoring dashboard', error);
    }
  }

  /**
   * logSafetyViolation
   * Tracks when content guardrails block a generation.
   */
  static async logSafetyViolation(uid: string, modality: string, reason: string): Promise<void> {
    logger.warn(`Safety Violation: User ${uid} triggered guardrail on ${modality}. Reason: ${reason}`);
    
    await db.collection('safety_logs').add({
      uid,
      modality,
      reason,
      timestamp: Timestamp.now(),
    });

    // Optionally flag user or update risk score
    await db.collection('users').doc(uid).update({
      safetyViolationCount: FieldValue.increment(1),
      updatedAt: Timestamp.now()
    });
  }
}
