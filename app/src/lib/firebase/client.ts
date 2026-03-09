import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy-init — only creates Firebase app on the client side.
// This prevents SSR prerender errors when env vars aren't set.
function getApp(): FirebaseApp {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp(firebaseConfig);
}

// Lazy getters — avoids initialization during server-side builds
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;
let _functions: Functions | null = null;

export function getClientAuth(): Auth {
  if (!_auth) _auth = getAuth(getApp());
  return _auth;
}

export function getClientDb(): Firestore {
  if (!_db) _db = getFirestore(getApp());
  return _db;
}

export function getClientStorage(): FirebaseStorage {
  if (!_storage) _storage = getStorage(getApp());
  return _storage;
}

export function getClientFunctions(): Functions {
  if (!_functions) _functions = getFunctions(getApp(), 'us-central1');
  return _functions;
}

// Re-export for convenience (lazy, safe for SSR)
export const auth = typeof window !== 'undefined' ? getClientAuth() : (null as unknown as Auth);
export const db = typeof window !== 'undefined' ? getClientDb() : (null as unknown as Firestore);
export const storage = typeof window !== 'undefined' ? getClientStorage() : (null as unknown as FirebaseStorage);
export const functions = typeof window !== 'undefined' ? getClientFunctions() : (null as unknown as Functions);
