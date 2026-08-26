import express from 'express';
import { env } from '../config/env.js';
import { getDbStatus } from '../config/db.js';
import { vectorStore } from '../rag/vectorService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const dbStatus = getDbStatus();
  const vectorStats = await vectorStore.getStats();

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'CollegeGPT RAG Engine',
    database: dbStatus,
    vectorStore: {
      type: env.VECTOR_STORE_TYPE,
      totalVectors: vectorStats.totalVectors,
    },
    ai: {
      llmProvider: env.LLM_PROVIDER,
      llmModel: env.LLM_MODEL,
      embeddingProvider: env.EMBEDDING_PROVIDER,
      hasGeminiKey: !!env.LLM_API_KEY,
      hasOpenAIKey: !!env.OPENAI_API_KEY,
    },
    ragConfig: {
      topK: env.RAG_TOP_K,
      minScore: env.RAG_MIN_SCORE,
      chunkSize: env.CHUNK_SIZE,
      chunkOverlap: env.CHUNK_OVERLAP,
    },
  });
});

export default router;
