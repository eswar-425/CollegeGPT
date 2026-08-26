import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/collegegpt',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'collegegpt_fallback_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // AI & LLM
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'gemini',
  LLM_API_KEY: process.env.LLM_API_KEY || process.env.GEMINI_API_KEY || '',
  LLM_MODEL: process.env.LLM_MODEL || 'gemini-1.5-flash',

  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',

  // Embeddings
  EMBEDDING_PROVIDER: process.env.EMBEDDING_PROVIDER || 'local',
  EMBEDDING_API_KEY: process.env.EMBEDDING_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '',
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || 'text-embedding-004',

  // Vector DB
  VECTOR_STORE_TYPE: process.env.VECTOR_STORE_TYPE || 'memory',
  PINECONE_API_KEY: process.env.PINECONE_API_KEY || '',
  PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT || '',
  PINECONE_INDEX: process.env.PINECONE_INDEX || 'collegegpt',
  QDRANT_URL: process.env.QDRANT_URL || '',
  QDRANT_API_KEY: process.env.QDRANT_API_KEY || '',

  // RAG Parameters
  RAG_TOP_K: parseInt(process.env.RAG_TOP_K || '5', 10),
  RAG_MIN_SCORE: parseFloat(process.env.RAG_MIN_SCORE || '0.20'),
  CHUNK_SIZE: parseInt(process.env.CHUNK_SIZE || '1000', 10),
  CHUNK_OVERLAP: parseInt(process.env.CHUNK_OVERLAP || '150', 10),

  // File Upload
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '25', 10),
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads')
};
