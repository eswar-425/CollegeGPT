import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { runSeed } from './seed/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Ensure uploads directory exists
const uploadsDir = env.UPLOAD_DIR || path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 1. Security & Core Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 2. Serve Static Uploads
app.use('/uploads', express.static(uploadsDir));

// 3. API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'CollegeGPT API Server',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// 4. Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// 5. Server Startup
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if running in development
    setTimeout(() => {
      runSeed(false).catch((e) => logger.warn(`Auto seed info: ${e.message}`));
    }, 1000);

    app.listen(env.PORT, () => {
      logger.success(`====================================================`);
      logger.success(`  🎓 CollegeGPT RAG Engine Running on Port ${env.PORT}`);
      logger.success(`  🌐 Health Check: http://localhost:${env.PORT}/api/health`);
      logger.success(`  🤖 AI Provider: ${env.LLM_PROVIDER} | Embeddings: ${env.EMBEDDING_PROVIDER}`);
      logger.success(`====================================================`);
    });
  } catch (error) {
    logger.error(`Fatal Server Error: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export default app;
