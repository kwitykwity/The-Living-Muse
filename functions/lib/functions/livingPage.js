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
exports.createLivingPage = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_admin_1 = require("../config/firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
/**
 * createLivingPage — callable function
 * Composes a Living Page from muse + poem + optional audio.
 * No credit charge — individual components (poem, avatar, audio) already cost credits.
 * This is the core composable artifact of the platform.
 */
exports.createLivingPage = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Must be signed in.');
    }
    const uid = request.auth.uid;
    const { museId, poemId, audioAssetId, videoAssetId, title } = request.data;
    // Validation
    if (!museId || !poemId) {
        throw new https_1.HttpsError('invalid-argument', 'museId and poemId are required.');
    }
    // Verify muse belongs to user
    const museDoc = await firebase_admin_1.db.collection('muses').doc(museId).get();
    if (!museDoc.exists || museDoc.data().uid !== uid) {
        throw new https_1.HttpsError('not-found', 'Muse not found or access denied.');
    }
    const muse = museDoc.data();
    // Verify poem belongs to user
    const poemDoc = await firebase_admin_1.db.collection('poems').doc(poemId).get();
    if (!poemDoc.exists || poemDoc.data().uid !== uid) {
        throw new https_1.HttpsError('not-found', 'Poem not found or access denied.');
    }
    const poem = poemDoc.data();
    // Verify video belongs to user if provided
    let videoURL;
    if (videoAssetId) {
        const videoDoc = await firebase_admin_1.db.collection('media_assets').doc(videoAssetId).get();
        if (videoDoc.exists && videoDoc.data()?.uid === uid) {
            videoURL = videoDoc.data()?.storageURL;
        }
    }
    // Get user name for denormalization
    const userDoc = await firebase_admin_1.db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    const userName = userData?.displayName || 'Anonymous';
    // Create Living Page
    const pageRef = firebase_admin_1.db.collection('living_pages').doc();
    const livingPage = {
        id: pageRef.id,
        uid,
        userName,
        museId,
        poemId,
        audioAssetId: audioAssetId || undefined,
        videoAssetId: videoAssetId || undefined,
        title: title || generateTitle(poem.textContent),
        avatarURL: muse.avatarURL,
        thumbnailURL: muse.thumbnailURL,
        videoURL,
        poemPreview: poem.textContent.split('\n')[0] || poem.textContent.substring(0, 60),
        sentiment: poem.sentiment,
        vibePreset: muse.vibePreset,
        status: 'ready',
        isPublic: false,
        isFavorite: false,
        createdAt: firestore_1.Timestamp.now(),
        updatedAt: firestore_1.Timestamp.now(),
    };
    // Batch write: create page + link poem
    const batch = firebase_admin_1.db.batch();
    batch.set(pageRef, livingPage);
    batch.update(firebase_admin_1.db.collection('poems').doc(poemId), { livingPageId: pageRef.id });
    // Also link video if exists
    if (videoAssetId) {
        batch.update(firebase_admin_1.db.collection('media_assets').doc(videoAssetId), { livingPageId: pageRef.id });
    }
    await batch.commit();
    logger.info(`Living Page ${pageRef.id} created for user ${uid}`);
    return {
        livingPageId: pageRef.id,
        status: 'ready',
        title: livingPage.title,
    };
});
/**
 * Auto-generate a title from the first line of the poem.
 */
function generateTitle(poemText) {
    const firstLine = poemText.split('\n')[0] || poemText;
    // Take first 5 words
    const words = firstLine.trim().split(/\s+/).slice(0, 5);
    return words.join(' ') + (words.length >= 5 ? '...' : '');
}
//# sourceMappingURL=livingPage.js.map