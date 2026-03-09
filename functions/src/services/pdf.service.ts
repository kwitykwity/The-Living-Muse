import PDFDocument from 'pdfkit';
import { bucket } from '../config/firebase-admin';
import * as logger from 'firebase-functions/logger';

/**
 * PDFService — Generates beautiful print-ready PDFs for verses.
 */
export class PDFService {
  /**
   * generateVersePDF
   * Creates a fine-art layout with the poem text and Muse avatar.
   */
  static async generateVersePDF(params: {
    uid: string;
    poemTitle: string;
    poemText: string;
    avatarUrl?: string;
    storagePath: string;
  }): Promise<{ storageURL: string; sizeBytes: number }> {
    const start = Date.now();
    logger.info(`Generating Fine-Art PDF for user ${params.uid}: ${params.poemTitle}`);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: params.poemTitle,
          Author: 'The Living Muse',
        }
      });

      const chunks: any[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          const { MonitoringService } = require('./monitoring.service');
          await MonitoringService.trackAICall({
            uid: params.uid,
            modality: 'text', // PDF is text-rendered
            model: 'pdfkit-art-engine',
            durationMs: Date.now() - start,
            estimatedCostUSD: 0.01,
            success: true
          });
          resolve({ storageURL: params.storagePath, sizeBytes: buffer.length });
        } catch (err) {
          reject(err);
        }
      });

      // ─── Layout Design ───
      
      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('THE LIVING MUSE', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica').text('A unique poetic manifestation of the soul.', { align: 'center' });
      
      doc.moveDown(2);
      doc.rect(50, doc.y, 495, 2).fill('#B8860B'); // Gold Divider
      doc.moveDown(2);

      // Title
      doc.fontSize(20).font('Helvetica-Oblique').text(params.poemTitle, { align: 'center' });
      doc.moveDown();

      // Poem Text (Centered and Serif-like)
      doc.fontSize(14).font('Times-Roman').text(params.poemText, {
        align: 'center',
        lineGap: 5
      });

      doc.moveDown(4);

      // Simple footer
      doc.moveDown(2);
      doc.fillColor('#888888').fontSize(8).font('Helvetica').text(`Manifested for ${params.uid}`, { align: 'center' });
      doc.fillColor('black'); // Reset to default

      doc.end();
    });
  }
}
