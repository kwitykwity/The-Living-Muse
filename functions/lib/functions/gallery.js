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
exports.togglePageVisibility = exports.searchLivingPages = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_admin_1 = require("../config/firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const vector_service_1 = require("../services/vector.service");
/**
 * searchLivingPages — Semantic (RAG) search for the gallery.
 */
exports.searchLivingPages = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be signed in to search.');
    }
    const { query, limit = 10 } = request.data;
    if (!query || typeof query !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'Query string is required.');
    }
    const uid = request.auth.uid;
    try {
        // 1. Perform semantic search via VectorService
        // This searches the 'memories' collection which includes indexed poems
        const memories = await vector_service_1.VectorService.searchSimilarMemories(uid, query, limit);
        if (memories.length === 0)
            return { results: [] };
        // 2. Map memories back to LivingPages
        // We assume every memory indexed with type:'poem' has a relatedId (poemId)
        const poemIds = memories
            .filter(m => m.metadata?.type === 'poem')
            .map(m => m.metadata.relatedId);
        if (poemIds.length === 0)
            return { results: [] };
        // 3. Fetch corresponding LivingPages
        const pagesSnapshot = await firebase_admin_1.db.collection('living_pages')
            .where('uid', '==', uid)
            .where('poemId', 'in', poemIds)
            .get();
        const results = pagesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return { results };
    }
    catch (error) {
        logger.error('Gallery search failed', error);
        throw new https_1.HttpsError('internal', 'Search operation failed.');
    }
});
/**
 * togglePageVisibility — Switches between Public and Private.
 */
exports.togglePageVisibility = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be signed in.');
    }
    const { pageId, isPublic } = request.data;
    if (!pageId)
        throw new https_1.HttpsError('invalid-argument', 'pageId is required.');
    const uid = request.auth.uid;
    const pageRef = firebase_admin_1.db.collection('living_pages').doc(pageId);
    try {
        const pageDoc = await pageRef.get();
        if (!pageDoc.exists)
            throw new https_1.HttpsError('not-found', 'Page not found.');
        if (pageDoc.data()?.uid !== uid)
            throw new https_1.HttpsError('permission-denied', 'Not your page.');
        await pageRef.update({
            isPublic: !!isPublic,
            updatedAt: firestore_1.Timestamp.now()
        });
        return { success: true, isPublic: !!isPublic };
    }
    catch (error) {
        logger.error('Toggle visibility failed', error);
        throw new https_1.HttpsError('internal', 'Could not update visibility.');
    }
});
//# sourceMappingURL=gallery.js.map