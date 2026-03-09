import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from '../config/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { deductCredits } from '../services/credit.service';

/**
 * createVideoExport — Request a high-resolution cinematic video export.
 */
export const createVideoExport = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in to export.');
  }

  const { pageId, quality = 'standard' } = request.data;
  const resolution = quality === 'premium' ? '4k' : '1080p';
  if (!pageId) throw new HttpsError('invalid-argument', 'pageId is required.');

  const uid = request.auth.uid;
  
  try {
    // 1. Verify ownership and state
    const pageDoc = await db.collection('living_pages').doc(pageId).get();
    if (!pageDoc.exists || pageDoc.data()?.uid !== uid) {
      throw new HttpsError('permission-denied', 'Cannot export this page.');
    }

    // 2. Deduct credits (Exports are premium actions)
    const { creditsCharged } = await deductCredits(uid, 'export_hd');

    // 3. Trigger High-Res Generation
    const page = pageDoc.data()!;
    logger.info(`Triggering high-res export for ${page.title} (Charged: ${creditsCharged} CR)`);

    const exportRef = db.collection('exports').doc();
    await exportRef.set({
      id: exportRef.id,
      uid,
      livingPageId: pageId,
      type: 'video_hd',
      status: 'processing',
      resolution,
      watermarked: quality !== 'premium',
      creditsCharged,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    });

    logger.info(`Video export ${exportRef.id} queued for page ${pageId}`);

    return { success: true, exportId: exportRef.id, status: 'queued' };
  } catch (error) {
    logger.error('Video export failed', error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', 'Failed to initiate video export.');
  }
});

import { PDFService } from '../services/pdf.service';

/**
 * createPDFExport — Generates a beautiful fine-art PDF of the verse.
 */
export const createPDFExport = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in.');
  }

  const { pageId } = request.data;
  if (!pageId) throw new HttpsError('invalid-argument', 'pageId is required.');
  
  const uid = request.auth.uid;

  try {
    // 1. Verify ownership and state
    const pageDoc = await db.collection('living_pages').doc(pageId).get();
    if (!pageDoc.exists || pageDoc.data()?.uid !== uid) {
      throw new HttpsError('permission-denied', 'Cannot export this page.');
    }

    const pageData = pageDoc.data()!;
    const pdfPath = `exports/${uid}/${pageId}_${Date.now()}.pdf`;

    // 2. Generate PDF
    const { storageURL, sizeBytes } = await PDFService.generateVersePDF({
      uid,
      poemTitle: pageData.title || 'Untitled Manifestation',
      poemText: pageData.poemText || '',
      storagePath: pdfPath,
    });

    // 3. Update export record
    const exportRef = db.collection('exports').doc();
    await exportRef.set({
      id: exportRef.id,
      uid,
      livingPageId: pageId,
      type: 'living_book_pdf',
      status: 'ready',
      downloadURL: storageURL,
      sizeBytes,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    });

    return { success: true, downloadURL: storageURL, exportId: exportRef.id };
  } catch (error: any) {
    logger.error('PDF export failed', error);
    throw new HttpsError('internal', `Could not generate PDF: ${error.message}`);
  }
});
