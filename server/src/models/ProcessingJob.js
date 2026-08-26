import mongoose from 'mongoose';

const ProcessingJobSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Document',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'QUEUED',
    },
    stage: {
      type: String,
      enum: [
        'INITIALIZED',
        'EXTRACTING_TEXT',
        'CLEANING_TEXT',
        'CHUNKING',
        'GENERATING_EMBEDDINGS',
        'STORING_VECTORS',
        'FINALIZING',
        'COMPLETED',
        'FAILED',
      ],
      default: 'INITIALIZED',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalChunks: {
      type: Number,
      default: 0,
    },
    processedChunks: {
      type: Number,
      default: 0,
    },
    error: {
      type: String,
      default: null,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const ProcessingJob =
  mongoose.models.ProcessingJob || mongoose.model('ProcessingJob', ProcessingJobSchema);
