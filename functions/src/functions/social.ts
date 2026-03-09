import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from '../config/firebase-admin';

/**
 * getPublicLivingPage — Fetches a manifestion if it's public.
 */
export const getPublicLivingPage = onCall(async (request) => {
  const { pageId } = request.data;
  if (!pageId) throw new HttpsError('invalid-argument', 'pageId is required.');

  try {
    const doc = await db.collection('living_pages').doc(pageId).get();
    if (!doc.exists) throw new HttpsError('not-found', 'Manifestation not found.');
    
    const data = doc.data()!;
    if (!data.isPublic) {
      // Check if requester is the owner
      if (request.auth?.uid !== data.uid) {
        throw new HttpsError('permission-denied', 'This manifestation is private.');
      }
    }

    return { page: { id: doc.id, ...data } };
  } catch (error: any) {
    if (error instanceof HttpsError) throw error;
    logger.error('Failed to get public page', error);
    throw new HttpsError('internal', 'Search operation failed.');
  }
});

/**
 * getPublicProfile — Fetches a user's public manifestations.
 */
export const getPublicProfile = onCall(async (request) => {
  const { uid } = request.data;
  if (!uid) throw new HttpsError('invalid-argument', 'uid is required.');

  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) throw new HttpsError('not-found', 'User not found.');
    
    const userData = userDoc.data()!;
    if (!userData.isPublicProfile && request.auth?.uid !== uid) {
      throw new HttpsError('permission-denied', 'This profile is private.');
    }

    // Fetch public living pages
    const pagesSnapshot = await db.collection('living_pages')
      .where('uid', '==', uid)
      .where('isPublic', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const pages = pagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      profile: {
        uid: userData.uid,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        bio: userData.bio || '',
        location: userData.location || '',
        vibePreset: userData.vibePreset,
      },
      pages
    };
  } catch (error: any) {
    if (error instanceof HttpsError) throw error;
    logger.error('Failed to get public profile', error);
    throw new HttpsError('internal', 'Profile lookup failed.');
  }
});
