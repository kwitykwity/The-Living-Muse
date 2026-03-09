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
exports.addPageToCollection = exports.createCollection = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_admin_1 = require("../config/firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
/**
 * createCollection — Initializes a new thematic volume.
 */
exports.createCollection = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be signed in to curate.');
    }
    const { title, description, theme } = request.data;
    if (!title)
        throw new https_1.HttpsError('invalid-argument', 'Title is required.');
    const uid = request.auth.uid;
    try {
        const colRef = firebase_admin_1.db.collection('collections').doc();
        const newCol = {
            id: colRef.id,
            uid,
            title,
            description: description || '',
            theme: theme || 'default',
            livingPageIds: [],
            livingPageCount: 0,
            isLivingBook: true,
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        };
        await colRef.set(newCol);
        return { success: true, collectionId: colRef.id };
    }
    catch (error) {
        logger.error('Failed to create collection', error);
        throw new https_1.HttpsError('internal', 'Collection creation failed.');
    }
});
/**
 * addPageToCollection — Adds a verse to a thematic volume.
 */
exports.addPageToCollection = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be signed in.');
    }
    const { collectionId, pageId } = request.data;
    if (!collectionId || !pageId) {
        throw new https_1.HttpsError('invalid-argument', 'collectionId and pageId are required.');
    }
    const uid = request.auth.uid;
    const colRef = firebase_admin_1.db.collection('collections').doc(collectionId);
    const pageRef = firebase_admin_1.db.collection('living_pages').doc(pageId);
    try {
        return await firebase_admin_1.db.runTransaction(async (tx) => {
            const colDoc = await tx.get(colRef);
            const pageDoc = await tx.get(pageRef);
            if (!colDoc.exists)
                throw new https_1.HttpsError('not-found', 'Collection not found.');
            if (!pageDoc.exists)
                throw new https_1.HttpsError('not-found', 'Living Page not found.');
            const colData = colDoc.data();
            if (colData.uid !== uid)
                throw new https_1.HttpsError('permission-denied', 'Not your collection.');
            if (colData.livingPageIds.includes(pageId)) {
                return { success: true, message: 'Page already in collection.' };
            }
            tx.update(colRef, {
                livingPageIds: firestore_1.FieldValue.arrayUnion(pageId),
                livingPageCount: firestore_1.FieldValue.increment(1),
                updatedAt: firestore_1.Timestamp.now(),
            });
            return { success: true };
        });
    }
    catch (error) {
        logger.error('Failed to add page to collection', error);
        if (error instanceof https_1.HttpsError)
            throw error;
        throw new https_1.HttpsError('internal', 'Failed to update collection.');
    }
});
//# sourceMappingURL=collection.js.map