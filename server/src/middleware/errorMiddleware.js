import { logger } from '../utils/logger.js';

export function notFound(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

export function errorHandler(err, req, res, next) {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected server error occurred.';

  // Handle Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    errorCode = 'FILE_TOO_LARGE';
    message = 'File exceeds the maximum allowed upload size (25MB).';
  }

  // Handle Multer file type error
  if (err.message === 'INVALID_FILE_TYPE' || err.code === 'INVALID_FILE_TYPE') {
    statusCode = 400;
    errorCode = 'INVALID_FILE_TYPE';
    message = 'Unsupported file format. Please upload a PDF, DOCX, TXT, or MD document.';
  }

  logger.error(`[${req.method} ${req.url}] ${errorCode}: ${message}`);

  res.status(statusCode).json({
    success: false,
    errorCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}
