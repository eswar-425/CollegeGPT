import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true,
    },
    messageId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Message',
      required: true,
      index: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Conversation',
      required: true,
    },
    rating: {
      type: String,
      enum: ['helpful', 'not_helpful'],
      required: true,
    },
    comment: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
