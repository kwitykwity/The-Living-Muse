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
exports.trackUsage = trackUsage;
exports.getUserMonthlyCost = getUserMonthlyCost;
const logger = __importStar(require("firebase-functions/logger"));
const firebase_admin_1 = require("../config/firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
/**
 * Track a usage event — called after every AI API call.
 * This is the cost tracking backbone of the entire system.
 */
async function trackUsage(params) {
    const eventRef = firebase_admin_1.db.collection('usage_events').doc();
    const event = {
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
        createdAt: firestore_1.Timestamp.now(),
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
async function getUserMonthlyCost(uid) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const snapshot = await firebase_admin_1.db
        .collection('usage_events')
        .where('uid', '==', uid)
        .where('createdAt', '>=', firestore_1.Timestamp.fromDate(startOfMonth))
        .where('success', '==', true)
        .get();
    let totalCost = 0;
    snapshot.forEach((doc) => {
        totalCost += doc.data().estimatedCostUSD;
    });
    return totalCost;
}
//# sourceMappingURL=usage.service.js.map