import fs from 'fs/promises';
import path from 'path';
import { dbAdapter } from '../config/dbAdapter.js';
import { processDocumentIngestion } from '../rag/ragPipeline.js';
import { vectorStore } from '../rag/vectorService.js';
import { logger } from '../utils/logger.js';

export async function uploadAndProcessDocument(file, body, userId) {
  if (!file) {
    const error = new Error('No document file was uploaded.');
    error.code = 'NO_FILE_UPLOADED';
    error.statusCode = 400;
    throw error;
  }

  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const documentName = body.name || file.originalname.replace(/\.[^/.]+$/, '');

  // 1. Create Document in DB with status PROCESSING
  const document = await dbAdapter.documents.create({
    name: documentName.trim(),
    originalName: file.originalname,
    fileUrl: `/uploads/${file.filename}`,
    fileType: ext,
    fileSize: file.size,
    category: body.category || 'General',
    department: body.department || 'General / College-wide',
    collegeName: body.collegeName ? body.collegeName.trim() : 'General / All Colleges',
    academicYear: body.academicYear || '2026-2027',
    status: 'PROCESSING',
    uploadedBy: userId,
  });

  const docId = document._id || document.id;

  // 2. Initialize processing job
  await dbAdapter.processingJobs.create({
    documentId: docId,
    status: 'PROCESSING',
    stage: 'EXTRACTING_TEXT',
    progress: 5,
  });

  // 3. Process ingestion asynchronously
  processDocumentIngestion(docId, file.path, ext, {
    name: document.name,
    category: document.category,
    department: document.department,
    collegeName: document.collegeName,
    academicYear: document.academicYear,
  }).catch((err) => {
    logger.error(`Background ingestion error: ${err.message}`);
  });

  return document;
}

export async function listDocuments({ search, category, department, status, page = 1, limit = 50 }) {
  const documents = await dbAdapter.documents.find({
    search,
    category,
    department,
    status,
  });

  const total = await dbAdapter.documents.countDocuments();

  return {
    documents,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      limit: Number(limit),
    },
  };
}

export async function getDocumentById(documentId) {
  const document = await dbAdapter.documents.findById(documentId);
  if (!document) {
    const error = new Error('Document not found.');
    error.code = 'DOCUMENT_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  const chunks = await dbAdapter.documentChunks.find({ documentId });
  const job = await dbAdapter.processingJobs.findOne({ documentId });

  return {
    document,
    chunks,
    processingJob: job,
  };
}

export async function reprocessDocument(documentId) {
  const document = await dbAdapter.documents.findById(documentId);
  if (!document) {
    const error = new Error('Document not found.');
    error.code = 'DOCUMENT_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  await dbAdapter.documents.findByIdAndUpdate(documentId, {
    status: 'PROCESSING',
    errorMessage: null,
  });

  const filePath = path.resolve(process.cwd(), `.${document.fileUrl}`);

  processDocumentIngestion(documentId, filePath, document.fileType, {
    name: document.name,
    category: document.category,
    department: document.department,
    collegeName: document.collegeName,
    academicYear: document.academicYear,
  }).catch((err) => {
    logger.error(`Reprocessing failed: ${err.message}`);
  });

  return { success: true, message: 'Document reprocessing initiated.' };
}

export async function deleteDocument(documentId) {
  const document = await dbAdapter.documents.findById(documentId);
  if (!document) {
    const error = new Error('Document not found.');
    error.code = 'DOCUMENT_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  // 1. Remove vectors from vector store
  await vectorStore.deleteDocumentVectors(documentId);

  // 2. Remove document chunks from Mongo/local store
  await dbAdapter.documentChunks.deleteMany({ documentId });

  // 3. Remove processing jobs
  await dbAdapter.processingJobs.deleteMany({ documentId });

  // 4. Try removing physical file
  try {
    const filePath = path.resolve(process.cwd(), `.${document.fileUrl}`);
    await fs.unlink(filePath);
  } catch (err) {}

  // 5. Delete document record
  await dbAdapter.documents.findByIdAndDelete(documentId);

  return { success: true, message: 'Document and all its vector embeddings deleted successfully.' };
}

export async function getDocumentStatus(documentId) {
  const job = await dbAdapter.processingJobs.findOne({ documentId });
  const document = await dbAdapter.documents.findById(documentId);
  
  return {
    status: document ? document.status : 'UNKNOWN',
    job: job || null,
  };
}
