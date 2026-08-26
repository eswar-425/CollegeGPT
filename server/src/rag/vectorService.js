import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.resolve(__dirname, '../../uploads/vector_store.json');

/**
 * In-Memory Vector Store implementation with disk persistence & metadata filtering
 */
class InMemoryVectorStore {
  constructor() {
    this.vectors = new Map(); // id -> { id, vector, documentId, chunkIndex, text, pageNumber, metadata }
    this.isLoaded = false;
  }

  async init() {
    if (this.isLoaded) return;
    try {
      await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
      const data = await fs.readFile(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      for (const item of parsed) {
        this.vectors.set(item.id, item);
      }
      logger.rag('VECTOR_STORE', `Loaded ${this.vectors.size} vectors from disk storage`);
    } catch (err) {
      // File doesn't exist yet, start empty
      this.vectors.clear();
    }
    this.isLoaded = true;
  }

  async persist() {
    try {
      const items = Array.from(this.vectors.values());
      await fs.writeFile(STORE_PATH, JSON.stringify(items, null, 2), 'utf-8');
    } catch (err) {
      logger.error(`Failed to persist vector store: ${err.message}`);
    }
  }

  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async insertVectors(records) {
    await this.init();
    for (const record of records) {
      const id = record.id || `${record.documentId}_chunk_${record.chunkIndex}`;
      this.vectors.set(id, {
        id,
        vector: record.vector,
        documentId: String(record.documentId),
        chunkIndex: record.chunkIndex,
        text: record.text,
        pageNumber: record.pageNumber || 1,
        metadata: record.metadata || {},
      });
    }
    await this.persist();
    logger.rag('VECTOR_STORE', `Stored ${records.length} vectors. Total in store: ${this.vectors.size}`);
    return true;
  }

  async deleteDocumentVectors(documentId) {
    await this.init();
    const docIdStr = String(documentId);
    let deletedCount = 0;

    for (const [id, record] of this.vectors.entries()) {
      if (record.documentId === docIdStr) {
        this.vectors.delete(id);
        deletedCount++;
      }
    }

    await this.persist();
    logger.rag('VECTOR_STORE', `Deleted ${deletedCount} vectors for document ${documentId}`);
    return deletedCount;
  }

  async search(queryVector, options = {}) {
    await this.init();
    const topK = options.topK || env.RAG_TOP_K || 5;
    const minScore = options.minScore !== undefined ? options.minScore : env.RAG_MIN_SCORE || 0.20;
    const filter = options.filter || {};

    const scored = [];

    for (const record of this.vectors.values()) {
      // Apply metadata filters if provided
      if (filter.documentId && record.documentId !== String(filter.documentId)) continue;
      if (filter.category && record.metadata?.category && record.metadata.category !== filter.category) continue;
      if (filter.department && record.metadata?.department && record.metadata.department !== filter.department) continue;
      if (filter.collegeName && filter.collegeName !== 'All' && filter.collegeName !== 'General / All Colleges') {
        const docCollege = record.metadata?.collegeName;
        if (
          docCollege &&
          docCollege !== 'General / All Colleges' &&
          docCollege !== 'All' &&
          docCollege.toLowerCase() !== filter.collegeName.toLowerCase()
        ) {
          continue;
        }
      }

      const score = this.cosineSimilarity(queryVector, record.vector);
      if (score >= minScore) {
        scored.push({
          ...record,
          score,
        });
      }
    }

    // Sort descending by similarity score
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topK);
  }

  async getStats() {
    await this.init();
    return {
      totalVectors: this.vectors.size,
      storeType: 'in-memory-persisted',
    };
  }
}

// Singleton Vector Store Instance
export const vectorStore = new InMemoryVectorStore();
