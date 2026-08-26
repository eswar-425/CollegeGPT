import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    sources: [
      {
        documentId: {
          type: mongoose.Schema.Types.Mixed,
        },
        documentName: {
          type: String,
          default: 'College Document',
        },
        page: {
          type: Number,
          default: 1,
        },
        category: {
          type: String,
          default: 'General',
        },
        department: {
          type: String,
          default: 'General',
        },
        snippet: {
          type: String,
          default: '',
        },
        score: {
          type: Number,
          default: 0,
        },
      },
    ],
    retrievalMetadata: {
      chunksRetrieved: {
        type: Number,
        default: 0,
      },
      retrievalScoreMin: Number,
      retrievalScoreMax: Number,
      provider: String,
      modelUsed: String,
      responseTimeMs: Number,
      fallbackUsed: {
        type: Boolean,
        default: false,
      },
      promptTokens: Number,
      completionTokens: Number,
    },
    feedback: {
      rating: {
        type: String,
        enum: ['helpful', 'not_helpful', null],
        default: null,
      },
      comment: {
        type: String,
        default: null,
      },
      submittedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
