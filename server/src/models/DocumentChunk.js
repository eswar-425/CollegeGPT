import mongoose from 'mongoose';

const DocumentChunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Document',
      required: true,
      index: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    pageNumber: {
      type: Number,
      default: 1,
    },
    tokenCount: {
      type: Number,
      default: 0,
    },
    vectorId: {
      type: String,
      index: true,
    },
    metadata: {
      documentName: String,
      category: String,
      department: String,
      collegeName: String,
      academicYear: String,
    },
  },
  {
    timestamps: true,
  }
);

DocumentChunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });

export const DocumentChunk =
  mongoose.models.DocumentChunk || mongoose.model('DocumentChunk', DocumentChunkSchema);
