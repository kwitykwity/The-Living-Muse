"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.bucket = exports.storage = exports.db = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
const auth_1 = require("firebase-admin/auth");
// Initialize Firebase Admin — only once
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)({
        // In Cloud Functions, credentials are auto-detected.
        // For local dev, set GOOGLE_APPLICATION_CREDENTIALS env var.
        storageBucket: process.env.STORAGE_BUCKET || 'the-living-muse.firebasestorage.app',
    });
}
exports.db = (0, firestore_1.getFirestore)();
exports.storage = (0, storage_1.getStorage)();
exports.bucket = exports.storage.bucket();
exports.auth = (0, auth_1.getAuth)();
// Enable Firestore settings for better performance
exports.db.settings({ ignoreUndefinedProperties: true });
//# sourceMappingURL=firebase-admin.js.map