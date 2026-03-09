import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from '../config/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { VectorService } from '../services/vector.service';

/**
 * searchLivingPages — Semantic (RAG) search for the gallery.
 * Scope: 'personal' (my verses) or 'global' (community discovery).
 */
export const searchLivingPages = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in to search.');
  }

  const { query, scope = 'personal', limit = 12 } = request.data;
  if (!query || typeof query !== 'string') {
    throw new HttpsError('invalid-argument', 'Query string is required.');
  }

  const uid = request.auth.uid;

  try {
    // 1. Perform semantic search via VectorService
    // identifier is uid for personal, or empty for global
    const identifier = scope === 'personal' ? uid : '';
    const memories = await VectorService.searchSimilarMemories(scope, identifier, query, limit);

    if (memories.length === 0) return { results: [] };

    // 2. Map memories back to LivingPages
    const poemIds = memories
      .filter(m => m.metadata?.type === 'poem' && m.metadata?.relatedId)
      .map(m => m.metadata.relatedId);

    if (poemIds.length === 0) return { results: [] };

    // 3. Fetch corresponding LivingPages
    let queryRef = db.collection('living_pages') as any;
    if (scope === 'personal') {
      queryRef = queryRef.where('uid', '==', uid);
    } else {
      queryRef = queryRef.where('isPublic', '==', true);
    }
    
    // Firestore 'in' queries are capped at 30
    const finalIds = poemIds.slice(0, 30);
    const pagesSnapshot = await queryRef.where('poemId', 'in', finalIds).get();

    const results = pagesSnapshot.docs.map((doc: any) => ({
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
 * Now syncs with Vector Index for Global Discovery.
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
    const data = pageDoc.data()!;
    if (data.uid !== uid) throw new HttpsError('permission-denied', 'Not your page.');

    // 1. Update Living Page
    await pageRef.update({
      isPublic: !!isPublic,
      updatedAt: Timestamp.now()
    });

    // 2. Sync to Vector Index (Memories)
    if (data.poemId) {
      await db.collection('memories').doc(data.poemId).update({
        'metadata.isPublic': !!isPublic,
        updatedAt: Timestamp.now()
      }).catch(err => logger.warn(`Failed to sync isPublic to memory ${data.poemId}`, err));
    }

    return { success: true, isPublic: !!isPublic };
  } catch (error) {
    logger.error('Toggle visibility failed', error);
    throw new HttpsError('internal', 'Could not update visibility.');
  }
});
