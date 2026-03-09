import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from './client';

const googleProvider = new GoogleAuthProvider();

// ─── Sign In Methods ───

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserProfile(result.user);
  return result.user;
}

export async function signUpWithEmail(email: string, password: string, displayName: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(result.user, displayName);
  return result.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// ─── Auth State ───

export function onAuthStateChanged(callback: (user: User | null) => void): () => void {
  return firebaseOnAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// ─── Profile Creation ───

async function ensureUserProfile(user: User, displayName?: string): Promise<void> {
  try {
    const createProfile = httpsCallable(functions, 'createUserProfile');
    await createProfile({
      displayName: displayName || user.displayName || 'Creative Soul',
    });
  } catch (error: any) {
    // Profile already exists — that's fine
    if (error.code !== 'functions/already-exists') {
      console.error('Failed to create user profile:', error);
    }
  }
}
