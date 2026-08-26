import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New College Inquiry',
      trim: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Conversation =
  mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
