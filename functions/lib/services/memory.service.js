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
exports.MemoryService = void 0;
const firebase_admin_1 = require("../config/firebase-admin");
const logger = __importStar(require("firebase-functions/logger"));
const vector_service_1 = require("./vector.service");
/**
 * MemoryService — Manages user context retention and sentiment learning.
 * This service helps the AI "learn" the user's style and emotional trends over time.
 */
class MemoryService {
    /**
     * recordSentiment
     * Updates the user's rolling sentiment average and stores the last detected sentiment.
     * @param uid User ID
     * @param score Numeric sentiment score (-1.0 to 1.0)
     * @param label Sentiment label (melancholic, joyful, etc.)
     */
    static async recordSentiment(uid, score, label) {
        const userRef = firebase_admin_1.db.collection('users').doc(uid);
        try {
            await firebase_admin_1.db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists)
                    return;
                const userData = userDoc.data();
                const currentTrend = userData.sentimentTrend || 0;
                // Calculate rolling average (weighted 20% to new sentiment)
                const newTrend = (currentTrend * 0.8) + (score * 0.2);
                transaction.update(userRef, {
                    sentimentTrend: Number(newTrend.toFixed(4)),
                    lastSentiment: label,
                    updatedAt: new Date(),
                });
            });
            logger.info(`Recorded sentiment for user ${uid}: ${label} (${score})`);
        }
        catch (error) {
            logger.error(`Failed to record sentiment for user ${uid}`, error);
        }
    }
    /**
     * getUserContext
     * Retrieves user context to inject into AI prompts for personalization.
     * Now performs a semantic (RAG) search for hyper-relevant memories.
     * @param uid User ID
     * @param query The current prompt/mood to search against
     */
    static async getUserContext(uid, query) {
        const userDoc = await firebase_admin_1.db.collection('users').doc(uid).get();
        if (!userDoc.exists)
            return '';
        const userData = userDoc.data();
        const trend = userData.sentimentTrend || 0;
        const last = userData.lastSentiment;
        // 1. Basic Persona Context
        let context = `User Persona: Tends to have a ${trend < -0.2 ? 'melancholic/reflective' : trend > 0.2 ? 'joyful/positive' : 'balanced'} creative output. `;
        if (last)
            context += `Last creation tone: ${last}. `;
        if (userData.favoriteColor)
            context += `Preference: ${userData.favoriteColor}. `;
        if (userData.vibePreset)
            context += `Vibe: ${userData.vibePreset}. `;
        // 2. Semantic Memory Retrieval (RAG)
        if (query) {
            const searchResult = await vector_service_1.VectorService.searchSimilarMemories(uid, query, 3);
            if (searchResult.length > 0) {
                context += '\n--- Relevant Artistic Memories ---\n';
                searchResult.forEach((mem) => {
                    context += `- ${mem.text}\n`;
                });
            }
        }
        return context;
    }
}
exports.MemoryService = MemoryService;
//# sourceMappingURL=memory.service.js.map