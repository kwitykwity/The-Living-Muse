import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from '../config/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { VectorService } from '../services/vector.service';

/**
 * searchLivingPages — Semantic (RAG) search for the gallery.
 */
export const searchLivingPages = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in to search.');
  }

  const { query, limit = 10 } = request.data;
  if (!query || typeof query !== 'string') {
    throw new HttpsError('invalid-argument', 'Query string is required.');
  }

  const uid = request.auth.uid;

  try {
    // 1. Perform semantic search via VectorService
    // This searches the 'memories' collection which includes indexed poems
    const memories = await VectorService.searchSimilarMemories(uid, query, limit);

    if (memories.length === 0) return { results: [] };

    // 2. Map memories back to LivingPages
    // We assume every memory indexed with type:'poem' has a relatedId (poemId)
    const poemIds = memories
      .filter(m => m.metadata?.type === 'poem')
      .map(m => m.metadata.relatedId);

    if (poemIds.length === 0) return { results: [] };

    // 3. Fetch corresponding LivingPages
    const pagesSnapshot = await db.collection('living_pages')
      .where('uid', '==', uid)
      .where('poemId', 'in', poemIds)
      .get();

    const results = pagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { results };
  } catch (error) {
    logger.error('Gallery search failed', error);
    throw new HttpsError('internal', 'Search operation failed.');
  }
});

/**
 * togglePageVisibility — Switches between Public and Private.
 */
export const togglePageVisibility = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in.');
  }

  const { pageId, isPublic } = request.data;
  if (!pageId) throw new HttpsError('invalid-argument', 'pageId is required.');

  const uid = request.auth.uid;
  const pageRef = db.collection('living_pages').doc(pageId);

  try {
    const pageDoc = await pageRef.get();
    if (!pageDoc.exists) throw new HttpsError('not-found', 'Page not found.');
    if (pageDoc.data()?.uid !== uid) throw new HttpsError('permission-denied', 'Not your page.');

    await pageRef.update({
      isPublic: !!isPublic,
      updatedAt: Timestamp.now()
    });

    return { success: true, isPublic: !!isPublic };
  } catch (error) {
    logger.error('Toggle visibility failed', error);
    throw new HttpsError('internal', 'Could not update visibility.');
  }
});
