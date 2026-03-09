import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from '../config/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { CollectionDoc } from '../types/firestore';

/**
 * createCollection — Initializes a new thematic volume.
 */
export const createCollection = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in to curate.');
  }

  const { title, description, theme } = request.data;
  if (!title) throw new HttpsError('invalid-argument', 'Title is required.');

  const uid = request.auth.uid;

  try {
    const colRef = db.collection('collections').doc();
    const newCol: CollectionDoc = {
      id: colRef.id,
      uid,
      title,
      description: description || '',
      theme: theme || 'default',
      livingPageIds: [],
      livingPageCount: 0,
      isLivingBook: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await colRef.set(newCol);
    return { success: true, collectionId: colRef.id };
  } catch (error) {
    logger.error('Failed to create collection', error);
    throw new HttpsError('internal', 'Collection creation failed.');
  }
});

/**
 * addPageToCollection — Adds a verse to a thematic volume.
 */
export const addPageToCollection = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in.');
  }

  const { collectionId, pageId } = request.data;
  if (!collectionId || !pageId) {
    throw new HttpsError('invalid-argument', 'collectionId and pageId are required.');
  }

  const uid = request.auth.uid;
  const colRef = db.collection('collections').doc(collectionId);
  const pageRef = db.collection('living_pages').doc(pageId);

  try {
    return await db.runTransaction(async (tx) => {
      const colDoc = await tx.get(colRef);
      const pageDoc = await tx.get(pageRef);

      if (!colDoc.exists) throw new HttpsError('not-found', 'Collection not found.');
      if (!pageDoc.exists) throw new HttpsError('not-found', 'Living Page not found.');

      const colData = colDoc.data() as CollectionDoc;
      if (colData.uid !== uid) throw new HttpsError('permission-denied', 'Not your collection.');
      
      if (colData.livingPageIds.includes(pageId)) {
        return { success: true, message: 'Page already in collection.' };
      }

      tx.update(colRef, {
        livingPageIds: FieldValue.arrayUnion(pageId),
        livingPageCount: FieldValue.increment(1),
        updatedAt: Timestamp.now(),
      });

      return { success: true };
    });
  } catch (error) {
    logger.error('Failed to add page to collection', error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', 'Failed to update collection.');
  }
});
