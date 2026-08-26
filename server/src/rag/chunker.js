import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Estimates token count from text (~4 chars per token for English)
 */
export function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.trim().split(/\s+/).length * 1.3);
}

/**
 * Splits text into meaningful, overlapping chunks respecting sentence & paragraph boundaries
 */
export function chunkPages(pages, options = {}) {
  const chunkSize = options.chunkSize || env.CHUNK_SIZE || 1000;
  const chunkOverlap = options.chunkOverlap || env.CHUNK_OVERLAP || 150;

  const chunks = [];
  let globalChunkIndex = 0;

  for (const page of pages) {
    const pageText = page.text;
    const pageNumber = page.pageNumber || 1;

    if (!pageText || pageText.length === 0) continue;

    // If page is smaller than chunkSize, keep as single chunk
    if (pageText.length <= chunkSize) {
      chunks.push({
        chunkIndex: globalChunkIndex++,
        text: pageText,
        pageNumber,
        tokenCount: estimateTokens(pageText),
      });
      continue;
    }

    // Split page into paragraphs or sentences
    const paragraphs = pageText.split(/(?<=\n\n)|(?<=\n(?=[A-Z0-9#]))/);
    let currentChunkText = '';

    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i];

      if ((currentChunkText + '\n' + para).length <= chunkSize) {
        currentChunkText = currentChunkText ? `${currentChunkText}\n${para}` : para;
      } else {
        if (currentChunkText.trim().length > 0) {
          chunks.push({
            chunkIndex: globalChunkIndex++,
            text: currentChunkText.trim(),
            pageNumber,
            tokenCount: estimateTokens(currentChunkText),
          });

          // Compute overlap
          const words = currentChunkText.split(' ');
          const overlapWordCount = Math.floor(chunkOverlap / 6);
          const overlapText = words.slice(-overlapWordCount).join(' ');
          currentChunkText = `${overlapText}\n${para}`.trim();
        } else {
          // Paragraph itself is larger than chunkSize: slice by sentences
          let remaining = para;
          while (remaining.length > 0) {
            const slice = remaining.slice(0, chunkSize);
            chunks.push({
              chunkIndex: globalChunkIndex++,
              text: slice.trim(),
              pageNumber,
              tokenCount: estimateTokens(slice),
            });
            remaining = remaining.slice(chunkSize - chunkOverlap);
            if (remaining.length <= chunkOverlap) break;
          }
          currentChunkText = '';
        }
      }
    }

    // Push trailing text
    if (currentChunkText.trim().length > 0) {
      chunks.push({
        chunkIndex: globalChunkIndex++,
        text: currentChunkText.trim(),
        pageNumber,
        tokenCount: estimateTokens(currentChunkText),
      });
    }
  }

  logger.rag('CHUNKER', `Created ${chunks.length} chunks across ${pages.length} pages`);
  return chunks;
}
