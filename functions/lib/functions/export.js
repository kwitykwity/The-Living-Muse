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
exports.createPDFExport = exports.createVideoExport = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_admin_1 = require("../config/firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const credit_service_1 = require("../services/credit.service");
/**
 * createVideoExport — Request a high-resolution cinematic video export.
 */
exports.createVideoExport = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be signed in to export.');
    }
    const { pageId, quality = 'standard' } = request.data;
    if (!pageId)
        throw new https_1.HttpsError('invalid-argument', 'pageId is required.');
    const uid = request.auth.uid;
    try {
        // 1. Verify ownership and state
        const pageDoc = await firebase_admin_1.db.collection('living_pages').doc(pageId).get();
        if (!pageDoc.exists || pageDoc.data()?.uid !== uid) {
            throw new https_1.HttpsError('permission-denied', 'Cannot export this page.');
        }
        // 2. Deduct credits (Exports are premium actions)
        await (0, credit_service_1.deductCredits)(uid, 'export_hd');
        // 3. Create export record
        const exportRef = firebase_admin_1.db.collection('exports').doc();
        await exportRef.set({
            id: exportRef.id,
            uid,
            livingPageId: pageId,
            type: 'video_sd', // Placeholder for higher quality
            status: 'queued',
            resolution: quality === 'premium' ? '1080p' : '720p',
            watermarked: false,
            createdAt: firestore_1.Timestamp.now(),
            expiresAt: firestore_1.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days
        });
        logger.info(`Video export ${exportRef.id} queued for page ${pageId}`);
        return { success: true, exportId: exportRef.id, status: 'queued' };
    }
    catch (error) {
        logger.error('Video export failed', error);
        if (error instanceof https_1.HttpsError)
            throw error;
        throw new https_1.HttpsError('internal', 'Failed to initiate video export.');
    }
});
/**
 * createPDFExport — Generates a beautiful fine-art PDF of the verse.
 */
exports.createPDFExport = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be signed in.');
    }
    const { pageId } = request.data;
    const uid = request.auth.uid;
    try {
        // PDF generation would typically happen via a microservice or specialized library
        // For now, we queue the request
        const exportRef = firebase_admin_1.db.collection('exports').doc();
        await exportRef.set({
            id: exportRef.id,
            uid,
            livingPageId: pageId,
            type: 'living_book_pdf',
            status: 'ready', // MOCK: Return ready immediately with a placeholder
            downloadURL: 'https://storage.googleapis.com/living-muse-placeholders/sample_verse.pdf',
            createdAt: firestore_1.Timestamp.now(),
            expiresAt: firestore_1.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        });
        return { success: true, downloadURL: exportRef.id };
    }
    catch (error) {
        logger.error('PDF export failed', error);
        throw new https_1.HttpsError('internal', 'Could not generate PDF.');
    }
});
//# sourceMappingURL=export.js.map