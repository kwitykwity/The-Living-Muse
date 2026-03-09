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
exports.MonitoringService = void 0;
const logger = __importStar(require("firebase-functions/logger"));
/**
 * MonitoringService — Integrates Sentry for error tracking and DeepChecks for AI quality monitoring.
 */
class MonitoringService {
    /**
     * logAIInteraction
     * Logs inputs and outputs to DeepChecks for drift detection and quality scores.
     */
    static async logAIInteraction(params) {
        logger.info(`AI Interaction Logged: ${params.model} for user ${params.uid} (${params.latencyMs}ms)`);
        // MOCK: Send to DeepChecks
        /*
        await deepchecks.log({
          model: params.model,
          input: JSON.stringify(params.input),
          output: JSON.stringify(params.output),
          metadata: { uid: params.uid, latency: params.latencyMs }
        });
        */
    }
    /**
     * captureException
     * Sends critical errors to Sentry with user context.
     */
    static captureException(error, uid, extra) {
        logger.error('Critical Exception Captured:', error, { uid, ...extra });
        // MOCK: Sentry Integration
        /*
        Sentry.withScope((scope) => {
          if (uid) scope.setUser({ id: uid });
          if (extra) scope.setExtras(extra);
          Sentry.captureException(error);
        });
        */
    }
    /**
     * trackPerformance
     * Simple metric tracking for the creative dashboard.
     */
    static trackMetric(name, value, tags = {}) {
        logger.info(`Metric: ${name}=${value}`, tags);
        // MOCK: Send to Prometheus/Cloud Monitoring
    }
}
exports.MonitoringService = MonitoringService;
//# sourceMappingURL=monitoring.service.js.map