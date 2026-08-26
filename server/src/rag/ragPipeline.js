import { extractTextFromFile } from './textExtractor.js';
import { cleanPages } from './textCleaner.js';
import { chunkPages } from './chunker.js';
import { generateBatchEmbeddings } from './embeddingService.js';
import { vectorStore } from './vectorService.js';
import { retrieveRelevantChunks } from './retriever.js';
import { buildContext } from './contextBuilder.js';
import { buildRagPrompt } from '../ai/promptBuilder.js';
import { generateAnswer } from '../ai/llmService.js';
import { dbAdapter } from '../config/dbAdapter.js';
import { logger } from '../utils/logger.js';

/**
 * Executes full Document Ingestion Pipeline:
 * Upload -> Extract -> Clean -> Chunk -> Embed -> Store Vectors -> Mark Ready
 */
export async function processDocumentIngestion(documentId, filePath, fileType, metadata = {}) {
  logger.rag('PIPELINE', `Starting ingestion for document ${documentId}`);

  let job = null;
  try {
    job = await dbAdapter.processingJobs.findOne({ documentId });
    if (!job) {
      job = await dbAdapter.processingJobs.create({
        documentId,
        status: 'PROCESSING',
        stage: 'EXTRACTING_TEXT',
        progress: 10,
      });
    } else {
      job.status = 'PROCESSING';
      job.stage = 'EXTRACTING_TEXT';
      job.progress = 10;
      if (job.save) await job.save();
    }
  } catch (err) {}

  try {
    // 1. Text Extraction
    const rawPages = await extractTextFromFile(filePath, fileType);
    if (job) {
      job.stage = 'CLEANING_TEXT';
      job.progress = 25;
      if (job.save) await job.save();
    }

    // 2. Text Cleaning
    const cleanedPages = cleanPages(rawPages);
    if (job) {
      job.stage = 'CHUNKING';
      job.progress = 40;
      if (job.save) await job.save();
    }

    // 3. Chunking
    const chunks = chunkPages(cleanedPages);
    if (chunks.length === 0) {
      throw new Error('No readable text content extracted from document.');
    }
    if (job) {
      job.stage = 'GENERATING_EMBEDDINGS';
      job.totalChunks = chunks.length;
      job.progress = 55;
      if (job.save) await job.save();
    }

    // 4. Generate Embeddings
    const embeddedChunks = await generateBatchEmbeddings(chunks);
    if (job) {
      job.stage = 'STORING_VECTORS';
      job.progress = 75;
      if (job.save) await job.save();
    }

    // 5. Store in Database and Vector Database
    await dbAdapter.documentChunks.deleteMany({ documentId });
    await vectorStore.deleteDocumentVectors(documentId);

    const vectorRecords = [];
    const chunkDocs = [];

    for (const chunk of embeddedChunks) {
      const vectorId = `${documentId}_chunk_${chunk.chunkIndex}`;
      vectorRecords.push({
        id: vectorId,
        vector: chunk.embedding,
        documentId: String(documentId),
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        pageNumber: chunk.pageNumber,
        metadata: {
          documentName: metadata.name || 'Document',
          category: metadata.category || 'General',
          department: metadata.department || 'General',
          collegeName: metadata.collegeName || 'General / All Colleges',
          academicYear: metadata.academicYear || '2026-2027',
        },
      });

      chunkDocs.push({
        documentId,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        pageNumber: chunk.pageNumber,
        tokenCount: chunk.tokenCount,
        vectorId,
        metadata: {
          documentName: metadata.name,
          category: metadata.category,
          department: metadata.department,
          collegeName: metadata.collegeName || 'General / All Colleges',
          academicYear: metadata.academicYear,
        },
      });
    }

    // Store in Vector DB
    await vectorStore.insertVectors(vectorRecords);

    // Save to DB store
    await dbAdapter.documentChunks.insertMany(chunkDocs);

    // 6. Update Document Status
    await dbAdapter.documents.findByIdAndUpdate(documentId, {
      status: 'READY',
      chunkCount: chunks.length,
      errorMessage: null,
    });

    if (job) {
      job.status = 'COMPLETED';
      job.stage = 'COMPLETED';
      job.processedChunks = chunks.length;
      job.progress = 100;
      job.completedAt = new Date();
      if (job.save) await job.save();
    }

    logger.success(`Document ${documentId} successfully indexed (${chunks.length} chunks)`);
    return { success: true, chunkCount: chunks.length };
  } catch (error) {
    logger.error(`Document processing failed for ${documentId}: ${error.message}`);
    await dbAdapter.documents.findByIdAndUpdate(documentId, {
      status: 'FAILED',
      errorMessage: error.message,
    });

    if (job) {
      job.status = 'FAILED';
      job.stage = 'FAILED';
      job.error = error.message;
      if (job.save) await job.save();
    }

    throw error;
  }
}

/**
 * Executes full RAG Query Pipeline:
 * Question -> Retrieval -> Context Construction -> LLM -> Grounded Answer + Citations
 */
export async function executeRagPipeline(question, options = {}) {
  const { history = [], filter = {} } = options;

  // 1. Retrieve relevant chunks
  const retrievedChunks = await retrieveRelevantChunks(question, { filter });

  // 2. Build context
  const { contextText, sources } = buildContext(retrievedChunks);

  // 3. If zero context found, return safe fallback directly
  if (retrievedChunks.length === 0) {
    return {
      answer: "I couldn't find enough reliable information about that in the college knowledge base. Please check with the college administration or upload the relevant document.",
      sources: [],
      retrieval: {
        chunksRetrieved: 0,
        retrievalScoreMax: 0,
        fallbackUsed: true,
      },
    };
  }

  // 4. Construct prompt
  const { systemPrompt, userPrompt } = buildRagPrompt({
    question,
    contextText,
    history,
  });

  // 5. Generate LLM grounded answer
  const llmResult = await generateAnswer({
    systemPrompt,
    userPrompt,
    question,
    retrievedChunks,
  });

  return {
    answer: llmResult.answer,
    sources,
    retrieval: {
      chunksRetrieved: retrievedChunks.length,
      retrievalScoreMin: retrievedChunks[retrievedChunks.length - 1]?.score || 0,
      retrievalScoreMax: retrievedChunks[0]?.score || 0,
      provider: llmResult.provider,
      modelUsed: llmResult.model,
      responseTimeMs: llmResult.responseTimeMs,
      fallbackUsed: llmResult.fallbackUsed,
    },
  };
}
