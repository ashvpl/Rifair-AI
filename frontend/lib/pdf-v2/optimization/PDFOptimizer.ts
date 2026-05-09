// optimization/PDFOptimizer.ts

import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export class PDFOptimizer {
  /**
   * Reduce PDF file size while maintaining quality
   */
  async optimize(inputBuffer: Buffer): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.load(inputBuffer);
      pdfDoc.registerFontkit(fontkit);
      
      // 1. Remove unnecessary metadata
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('Rifair AI');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('Rifair PDF Engine v2');
      pdfDoc.setCreator('Rifair AI');
      
      // 2. Compress the document
      const optimized = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });
      
      return Buffer.from(optimized);
    } catch (err) {
      console.error('[PDF Optimizer] Optimization failed, returning original buffer:', err);
      return inputBuffer;
    }
  }
}
