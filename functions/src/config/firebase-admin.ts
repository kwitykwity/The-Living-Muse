import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin — only once
if (getApps().length === 0) {
  initializeApp({
    // In Cloud Functions, credentials are auto-detected.
    // For local dev, set GOOGLE_APPLICATION_CREDENTIALS env var.
    storageBucket: process.env.STORAGE_BUCKET || 'the-living-muse.firebasestorage.app',
  });
}

export const db = getFirestore();
export const storage = getStorage();
export const bucket = storage.bucket();
export const auth = getAuth();

// Enable Firestore settings for better performance
db.settings({ ignoreUndefinedProperties: true });
