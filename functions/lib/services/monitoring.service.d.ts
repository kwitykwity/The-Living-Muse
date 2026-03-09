/**
 * MonitoringService — Integrates Sentry for error tracking and DeepChecks for AI quality monitoring.
 */
export declare class MonitoringService {
    /**
     * logAIInteraction
     * Logs inputs and outputs to DeepChecks for drift detection and quality scores.
     */
    static logAIInteraction(params: {
        uid: string;
        model: string;
        input: any;
        output: any;
        latencyMs: number;
        tokens?: number;
    }): Promise<void>;
    /**
     * captureException
     * Sends critical errors to Sentry with user context.
     */
    static captureException(error: Error, uid?: string, extra?: any): void;
    /**
     * trackPerformance
     * Simple metric tracking for the creative dashboard.
     */
    static trackMetric(name: string, value: number, tags?: Record<string, string>): void;
}
//# sourceMappingURL=monitoring.service.d.ts.map