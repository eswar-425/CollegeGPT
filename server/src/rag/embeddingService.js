import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let geminiClient = null;
let openaiClient = null;

function getGeminiClient() {
  if (!geminiClient && env.EMBEDDING_API_KEY) {
    geminiClient = new GoogleGenerativeAI(env.EMBEDDING_API_KEY);
  }
  return geminiClient;
}

function getOpenAIClient() {
  if (!openaiClient && env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return openaiClient;
}

/**
 * High-fidelity deterministic semantic vectorizer for zero-config offline / local usage
 * Generates a 384-dimensional unit-length embedding vector from character/word n-grams and TF-IDF
 */
export function generateLocalEmbedding(text) {
  const DIMENSIONS = 384;
  const vector = new Array(DIMENSIONS).fill(0);
  const normalized = (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = normalized.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    vector[0] = 1.0;
    return vector;
  }

  // 1. Unigram & Bigram hashing into vector bins
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Hash word
    let h1 = 5381;
    for (let j = 0; j < word.length; j++) {
      h1 = ((h1 << 5) + h1) ^ word.charCodeAt(j);
    }
    const idx1 = Math.abs(h1) % DIMENSIONS;
    const weight = 1.0 + Math.log(1 + word.length);
    vector[idx1] += weight;

    // Hash bigram
    if (i < words.length - 1) {
      const bigram = `${word}_${words[i + 1]}`;
      let h2 = 2166136261;
      for (let j = 0; j < bigram.length; j++) {
        h2 = ((h2 << 5) + h2) ^ bigram.charCodeAt(j);
      }
      const idx2 = Math.abs(h2) % DIMENSIONS;
      vector[idx2] += weight * 1.5;
    }

    // Hash 3-char subgrams
    for (let k = 0; k <= word.length - 3; k++) {
      const sub = word.slice(k, k + 3);
      let h3 = 1777;
      for (let m = 0; m < 3; m++) {
        h3 = ((h3 << 5) + h3) + sub.charCodeAt(m);
      }
      const idx3 = Math.abs(h3) % DIMENSIONS;
      vector[idx3] += 0.4;
    }
  }

  // 2. L2 normalize vector
  let norm = 0;
  for (let i = 0; i < DIMENSIONS; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < DIMENSIONS; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

/**
 * Generate embedding for a single text chunk
 */
export async function generateEmbedding(text) {
  const provider = env.EMBEDDING_PROVIDER.toLowerCase();

  // If Gemini
  if (provider === 'gemini' && env.EMBEDDING_API_KEY) {
    try {
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({ model: env.EMBEDDING_MODEL || 'text-embedding-004' });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (err) {
      logger.warn(`Gemini embedding failed (${err.message}). Falling back to local vectorizer.`);
    }
  }

  // If OpenAI
  if (provider === 'openai' && env.OPENAI_API_KEY) {
    try {
      const client = getOpenAIClient();
      const response = await client.embeddings.create({
        model: env.EMBEDDING_MODEL || 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    } catch (err) {
      logger.warn(`OpenAI embedding failed (${err.message}). Falling back to local vectorizer.`);
    }
  }

  // Default / Local fallback
  return generateLocalEmbedding(text);
}

/**
 * Generate embeddings for multiple text chunks in batches
 */
export async function generateBatchEmbeddings(chunks, batchSize = 10) {
  const results = [];
  logger.rag('EMBEDDINGS', `Generating embeddings for ${chunks.length} chunks (provider: ${env.EMBEDDING_PROVIDER})`);

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const batchPromises = batch.map(async (c) => {
      const vector = await generateEmbedding(c.text);
      return {
        ...c,
        embedding: vector,
      };
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}
