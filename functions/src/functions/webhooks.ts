import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from '../config/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * aiWebhook — General endpoint for AI job completions (Vertex AI, Veo 3, etc.)
 */
export const aiWebhook = onRequest(async (req, res) => {
  // 1. Verify webhook signature (Placeholder for security)
  // 2. Extract job ID and status
  const { jobId, status, resultUrl, type } = req.body;

  logger.info(`AI Webhook received: Job ${jobId}, Status ${status}, Type ${type}`);

  if (!jobId || !status) {
    res.status(400).send('Missing jobId or status');
    return;
  }

  try {
    if (type === 'video_generation') {
      // Find asset by jobId
      const assetQuery = await db.collection('media_assets')
        .where('jobId', '==', jobId)
        .limit(1)
        .get();

      if (assetQuery.empty) {
        logger.warn(`No media asset found for job ID: ${jobId}`);
        res.status(404).send('Not found');
        return;
      }

      const assetDoc = assetQuery.docs[0];
      const assetData = assetDoc.data();

      // Update asset status and storage URL
      const updates: any = {
        status: status === 'success' ? 'ready' : 'failed',
        updatedAt: Timestamp.now(),
      };

      if (status === 'success' && resultUrl) {
        updates.storageURL = resultUrl;
      }

      await assetDoc.ref.update(updates);

      // If success, update the corresponding LivingPage
      if (status === 'success' && assetData.livingPageId) {
        await db.collection('living_pages').doc(assetData.livingPageId).update({
          videoURL: resultUrl,
          lastGenerationStatus: 'success',
          updatedAt: Timestamp.now(),
        });
      }
    }

    res.status(200).send('Processed');
  } catch (error) {
    logger.error('Webhook processing failed', error);
    res.status(500).send('Internal Error');
  }
});
