import { generateEmbedding } from './embeddingService.js';
import { vectorStore } from './vectorService.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const STOP_WORDS = new Set([
  'what', 'is', 'the', 'a', 'an', 'for', 'in', 'to', 'and', 'or', 'of', 'about', 'how', 'when',
  'where', 'who', 'which', 'can', 'i', 'you', 'me', 'my', 'do', 'does', 'are', 'give', 'tell',
  'show', 'please', 'details', 'information', 'regarding', 'about', 'list', 'any', 'all',
]);

/**
 * Advanced Hybrid Retriever:
 * Combines Dense Vector Embedding Similarity with BM25 / Keyword Frequency & Metadata Boosting.
 */
export async function retrieveRelevantChunks(query, options = {}) {
  const topK = options.topK || env.RAG_TOP_K || 5;
  const filter = options.filter || {};

  // Extract clean keywords
  const queryTerms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));

  // Determine dynamic threshold based on query length and keyword density
  const isShortKeywordQuery = queryTerms.length <= 2;
  const minScore =
    options.minScore !== undefined
      ? options.minScore
      : isShortKeywordQuery
      ? 0.05
      : Math.min(env.RAG_MIN_SCORE || 0.15, 0.10);

  logger.rag(
    'RETRIEVER',
    `Searching relevant context for query: "${query}" (terms: [${queryTerms.join(', ')}], topK=${topK}, minScore=${minScore})`
  );

  // 1. Generate query embedding
  const queryVector = await generateEmbedding(query);

  // 2. Query Vector DB (oversample for hybrid re-ranking)
  const rawResults = await vectorStore.search(queryVector, {
    topK: Math.max(topK * 4, 25),
    minScore: 0.01,
    filter,
  });

  if (!rawResults || rawResults.length === 0) {
    logger.rag('RETRIEVER', 'No vector records found in store.');
    return [];
  }

  // 3. Hybrid Re-scoring (Vector Cosine + Keyword Frequency + Document Title/Category relevance)
  const scoredResults = rawResults.map((chunk) => {
    let keywordScore = 0;
    const lowerText = chunk.text.toLowerCase();
    const docName = (chunk.metadata?.documentName || '').toLowerCase();
    const category = (chunk.metadata?.category || '').toLowerCase();
    const department = (chunk.metadata?.department || '').toLowerCase();

    for (const term of queryTerms) {
      // Word stem matching in text
      const regex = new RegExp(`\\b${term}`, 'gi');
      const textMatches = (lowerText.match(regex) || []).length;
      if (textMatches > 0) {
        keywordScore += Math.min(0.35, textMatches * 0.08);
      }

      // Title match boost
      if (docName.includes(term)) {
        keywordScore += 0.25;
      }

      // Category match boost
      if (category.includes(term)) {
        keywordScore += 0.20;
      }

      // Department match boost
      if (department.includes(term)) {
        keywordScore += 0.15;
      }
    }

    // College Specific Match Boost
    const chunkCollege = (chunk.metadata?.collegeName || '').toLowerCase();
    if (filter.collegeName && chunkCollege && chunkCollege === filter.collegeName.toLowerCase()) {
      keywordScore += 0.15;
    }

    // Weight combination: 40% dense semantic embedding + 60% keyword/metadata overlap
    const finalScore = queryTerms.length > 0
      ? chunk.score * 0.4 + keywordScore * 0.6
      : chunk.score;

    return {
      ...chunk,
      cosineScore: chunk.score,
      keywordScore,
      score: Math.min(1.0, finalScore),
    };
  });

  // Filter by dynamic minimum threshold
  const filteredResults = scoredResults.filter((chunk) => chunk.score >= minScore);

  // Sort descending by score
  filteredResults.sort((a, b) => b.score - a.score);

  if (filteredResults.length === 0) {
    logger.rag('RETRIEVER', 'No matching chunks met the similarity threshold.');
    return [];
  }

  // 4. Deduplicate consecutive/identical chunks from same document
  const deduplicated = [];
  const seenTexts = new Set();

  for (const chunk of filteredResults) {
    const textSignature = chunk.text.slice(0, 100).trim();
    if (!seenTexts.has(textSignature)) {
      seenTexts.add(textSignature);
      deduplicated.push(chunk);
    }
    if (deduplicated.length >= topK) break;
  }

  logger.rag('RETRIEVER', `Retrieved ${deduplicated.length} high-confidence chunks.`);
  return deduplicated;
}
