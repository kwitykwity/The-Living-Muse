import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from '../config/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { LivingPageDoc, MuseDoc, PoemDoc } from '../types/firestore';

/**
 * createLivingPage — callable function
 * Composes a Living Page from muse + poem + optional audio.
 * No credit charge — individual components (poem, avatar, audio) already cost credits.
 * This is the core composable artifact of the platform.
 */
export const createLivingPage = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in.');
  }

  const uid = request.auth.uid;
  const { museId, poemId, audioAssetId, videoAssetId, title } = request.data;

  // Validation
  if (!museId || !poemId) {
    throw new HttpsError('invalid-argument', 'museId and poemId are required.');
  }

  // Verify muse belongs to user
  const museDoc = await db.collection('muses').doc(museId).get();
  if (!museDoc.exists || (museDoc.data() as MuseDoc).uid !== uid) {
    throw new HttpsError('not-found', 'Muse not found or access denied.');
  }
  const muse = museDoc.data() as MuseDoc;

  // Verify poem belongs to user
  const poemDoc = await db.collection('poems').doc(poemId).get();
  if (!poemDoc.exists || (poemDoc.data() as PoemDoc).uid !== uid) {
    throw new HttpsError('not-found', 'Poem not found or access denied.');
  }
  const poem = poemDoc.data() as PoemDoc;

  // Verify audio belongs to user if provided
  let audioURL: string | undefined;
  if (audioAssetId) {
    const audioDoc = await db.collection('media_assets').doc(audioAssetId).get();
    if (audioDoc.exists && audioDoc.data()?.uid === uid) {
      audioURL = audioDoc.data()?.storageURL;
    }
  }

  // Verify video belongs to user if provided
  let videoURL: string | undefined;
  if (videoAssetId) {
    const videoDoc = await db.collection('media_assets').doc(videoAssetId).get();
    if (videoDoc.exists && videoDoc.data()?.uid === uid) {
      videoURL = videoDoc.data()?.storageURL;
    }
  }

  // Get user name for denormalization
  const userDoc = await db.collection('users').doc(uid).get();
  const userData = userDoc.data();
  const userName = userData?.displayName || 'Anonymous';

  // Create Living Page
  const pageRef = db.collection('living_pages').doc();
  const livingPage: LivingPageDoc = {
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
    audioURL,
    videoURL,
    poemPreview: poem.textContent.split('\n')[0] || poem.textContent.substring(0, 60),
    sentiment: poem.sentiment,
    vibePreset: muse.vibePreset,
    status: 'ready',
    lastGenerationStatus: videoAssetId ? 'running' : 'success',
    isPublic: false,
    isFavorite: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Batch write: create page + link poem
  const batch = db.batch();
  batch.set(pageRef, livingPage);
  batch.update(db.collection('poems').doc(poemId), { livingPageId: pageRef.id });
  
  // Also link video if exists
  if (videoAssetId) {
    batch.update(db.collection('media_assets').doc(videoAssetId), { livingPageId: pageRef.id });
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
function generateTitle(poemText: string): string {
  const firstLine = poemText.split('\n')[0] || poemText;
  // Take first 5 words
  const words = firstLine.trim().split(/\s+/).slice(0, 5);
  return words.join(' ') + (words.length >= 5 ? '...' : '');
}
