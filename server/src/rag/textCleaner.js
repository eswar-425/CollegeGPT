import { logger } from '../utils/logger.js';

/**
 * Cleans extracted text while preserving semantic structure and headers
 */
export function cleanText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  let cleaned = rawText;

  // 1. Normalize line endings (CRLF -> LF)
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Replace weird non-breaking spaces and control characters (except newlines and tabs)
  cleaned = cleaned.replace(/[\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000]/g, ' ');
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 3. Remove repeated hyphens or underscores used as page dividers (keep markdown style headings)
  cleaned = cleaned.replace(/^[_\-=*~]{4,}$/gm, '---');

  // 4. Remove duplicate whitespace per line
  cleaned = cleaned
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n');

  // 5. Compress 3+ consecutive newlines into 2
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

/**
 * Cleans a list of page objects
 */
export function cleanPages(pages) {
  return pages
    .map((page) => ({
      ...page,
      text: cleanText(page.text),
    }))
    .filter((page) => page.text.length > 0);
}
