import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './client';

// ─── Cloud Function Callables ───

export const callCreateMuseFromPhoto = httpsCallable(functions, 'createMuseFromPhoto');
export const callGeneratePoem = httpsCallable(functions, 'generatePoem');
export const callSynthesizePoemAudio = httpsCallable(functions, 'synthesizePoemAudio');
export const callCreateLivingPage = httpsCallable(functions, 'createLivingPage');
export const callGetUserDashboard = httpsCallable(functions, 'getUserDashboard');
export const callGenerateVideo = httpsCallable(functions, 'generateVideo');
export const callCreateStripeCheckout = httpsCallable(functions, 'createStripeCheckout');
export const callStartConversationalSession = httpsCallable(functions, 'startConversationalSession');
export const callContinueConversationalPoem = httpsCallable(functions, 'continueConversationalPoem');
export const callSearchLivingPages = httpsCallable(functions, 'searchLivingPages');
export const callTogglePageVisibility = httpsCallable(functions, 'togglePageVisibility');
export const callCreateVideoExport = httpsCallable(functions, 'createVideoExport');
export const callCreatePDFExport = httpsCallable(functions, 'createPDFExport');
export const callCreateCollection = httpsCallable(functions, 'createCollection');
export const callAddPageToCollection = httpsCallable(functions, 'addPageToCollection');

// ─── Direct Firestore Reads (for real-time listeners) ───

export function subscribeCollections(
  uid: string,
  callback: (collections: DocumentData[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'collections'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const cols = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(cols);
  });
}

export function subscribeLivingPages(
  uid: string,
  callback: (pages: DocumentData[]) => void,
  filters?: { vibePreset?: string; sentiment?: string; favoritesOnly?: boolean }
): Unsubscribe {
  const constraints: QueryConstraint[] = [
    where('uid', '==', uid),
  ];

  if (filters?.vibePreset) {
    constraints.push(where('vibePreset', '==', filters.vibePreset));
  }
  if (filters?.sentiment) {
    constraints.push(where('sentiment', '==', filters.sentiment));
  }
  if (filters?.favoritesOnly) {
    constraints.push(where('isFavorite', '==', true));
  }

  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(50));

  const q = query(collection(db, 'living_pages'), ...constraints);

  return onSnapshot(q, (snapshot) => {
    const pages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(pages);
  });
}

export async function getLivingPage(pageId: string): Promise<DocumentData | null> {
  const docRef = doc(db, 'living_pages', pageId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

export function subscribeToUserProfile(
  uid: string,
  callback: (user: DocumentData | null) => void
): Unsubscribe {
  const docRef = doc(db, 'users', uid);
  return onSnapshot(docRef, (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

export async function updateUserProfile(uid: string, data: Partial<DocumentData>): Promise<void> {
  const { updateDoc } = await import('firebase/firestore');
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date(),
  });
}
