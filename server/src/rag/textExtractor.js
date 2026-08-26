import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { logger } from '../utils/logger.js';

/**
 * Extracts text from supported file types (PDF, DOCX, TXT, MD)
 * Returns structured array of { text: string, pageNumber: number }
 */
export async function extractTextFromFile(filePath, fileType) {
  const normalizedType = fileType.toLowerCase().replace('.', '');
  logger.rag('EXTRACTOR', `Extracting text from ${path.basename(filePath)} (${normalizedType})`);

  try {
    const fileBuffer = await fs.readFile(filePath);

    if (normalizedType === 'pdf') {
      let rawText = '';
      try {
        const pdfData = await pdfParse(fileBuffer);
        rawText = pdfData.text || '';
      } catch (pdfErr) {
        logger.warn(`pdf-parse warning (${pdfErr.message}). Attempting stream string recovery...`);
        // Fallback: extract readable strings from buffer
        const bufferStr = fileBuffer.toString('binary');
        const matches = bufferStr.match(/[\x20-\x7E\r\n\t]{4,}/g) || [];
        rawText = matches
          .filter((s) => !s.startsWith('/') && !s.includes('obj') && !s.includes('endobj'))
          .join(' ');
      }

      if (!rawText.trim()) {
        rawText = fileBuffer.toString('utf-8').replace(/[^\x20-\x7E\r\n\t]/g, ' ');
      }

      const rawPages = rawText.split(/\f|\n--- Page \d+ ---\n/);
      if (rawPages.length > 1) {
        return rawPages
          .map((text, idx) => ({
            text: text.trim(),
            pageNumber: idx + 1,
          }))
          .filter((p) => p.text.length > 0);
      }

      const pageSize = 2500;
      const pages = [];
      for (let i = 0; i < rawText.length; i += pageSize) {
        const slice = rawText.slice(i, i + pageSize).trim();
        if (slice.length > 0) {
          pages.push({
            text: slice,
            pageNumber: Math.floor(i / pageSize) + 1,
          });
        }
      }
      return pages.length ? pages : [{ text: rawText.trim() || 'Document Content', pageNumber: 1 }];
    }

    if (normalizedType === 'docx') {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      const text = result.value || '';
      return [
        {
          text: text.trim(),
          pageNumber: 1,
        },
      ];
    }

    if (normalizedType === 'txt' || normalizedType === 'md') {
      const text = fileBuffer.toString('utf-8');
      
      // Check for section markers like "### 1." or "---" to segment into virtual pages if large
      const sections = text.split(/\n(?=###?\s+|\n---\n)/);
      if (sections.length > 1 && text.length > 3000) {
        return sections
          .map((sec, idx) => ({
            text: sec.trim(),
            pageNumber: idx + 1,
          }))
          .filter((s) => s.text.length > 0);
      }

      return [
        {
          text: text.trim(),
          pageNumber: 1,
        },
      ];
    }

    throw new Error(`Unsupported file type: ${fileType}`);
  } catch (error) {
    logger.error(`Text extraction failed for ${filePath}: ${error.message}`);
    throw error;
  }
}
