import { dbAdapter } from '../config/dbAdapter.js';
import { executeRagPipeline } from '../rag/ragPipeline.js';
import { logger } from '../utils/logger.js';

export async function processChatMessage({ userId, conversationId, message, departmentFilter, categoryFilter, collegeName }) {
  if (!message || !message.trim()) {
    const error = new Error('Message content cannot be empty.');
    error.code = 'EMPTY_MESSAGE';
    error.statusCode = 400;
    throw error;
  }

  let conversation;

  // 1. Get or create conversation
  if (conversationId) {
    conversation = await dbAdapter.conversations.findOne({ _id: conversationId, userId });
    if (!conversation) {
      const error = new Error('Conversation not found.');
      error.code = 'CONVERSATION_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
  } else {
    // Generate initial title from first question
    const title = message.trim().slice(0, 45) + (message.trim().length > 45 ? '...' : '');
    conversation = await dbAdapter.conversations.create({
      userId,
      title,
      lastMessageAt: new Date(),
    });
  }

  const convId = conversation._id || conversation.id;

  // If conversation has default title, update it from first query
  if (conversation.title === 'New College Inquiry' || conversation.title === 'New Chat') {
    conversation.title = message.trim().slice(0, 45) + (message.trim().length > 45 ? '...' : '');
  }

  // 2. Save User Message
  const userMessageDoc = await dbAdapter.messages.create({
    conversationId: convId,
    userId,
    role: 'user',
    content: message.trim(),
  });

  // 3. Fetch recent history for multi-turn RAG context
  const allMessages = await dbAdapter.messages.find({ conversationId: convId });
  const recentMessages = allMessages.slice(-6);
  
  const history = recentMessages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // 4. Run RAG Retrieval & Answer Pipeline with collegeName filtering
  const filter = {};
  if (departmentFilter && departmentFilter !== 'All') filter.department = departmentFilter;
  if (categoryFilter && categoryFilter !== 'All') filter.category = categoryFilter;
  if (collegeName && collegeName !== 'All') filter.collegeName = collegeName;

  const ragResult = await executeRagPipeline(message.trim(), {
    history,
    filter,
  });

  // 5. Save Assistant Message
  const assistantMessageDoc = await dbAdapter.messages.create({
    conversationId: convId,
    userId,
    role: 'assistant',
    content: ragResult.answer,
    sources: ragResult.sources,
    retrievalMetadata: ragResult.retrieval,
  });

  // 6. Update conversation timestamp
  conversation.lastMessageAt = new Date();
  if (conversation.save) await conversation.save();

  return {
    conversationId: convId,
    conversationTitle: conversation.title,
    userMessage: userMessageDoc,
    message: assistantMessageDoc,
    sources: ragResult.sources,
    retrieval: ragResult.retrieval,
  };
}

export async function getConversationMessages(conversationId, userId) {
  const conversation = await dbAdapter.conversations.findOne({ _id: conversationId, userId });
  if (!conversation) {
    const error = new Error('Conversation not found.');
    error.code = 'CONVERSATION_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  const messages = await dbAdapter.messages.find({ conversationId });
  return messages;
}

export async function recordMessageFeedback(messageId, userId, { rating, comment = '' }) {
  const message = await dbAdapter.messages.findById(messageId);
  if (!message) {
    const error = new Error('Message not found.');
    error.code = 'MESSAGE_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  message.feedback = {
    rating: rating === 'helpful' ? 'helpful' : 'not_helpful',
    comment: comment.trim(),
    submittedAt: new Date(),
  };
  if (message.save) await message.save();

  // Also create/update Feedback record for dashboard querying
  const feedbackDoc = await dbAdapter.feedback.findOneAndUpdate(
    { messageId },
    {
      userId,
      messageId,
      conversationId: message.conversationId,
      rating: message.feedback.rating,
      comment: message.feedback.comment,
    },
    { upsert: true, new: true }
  );

  return feedbackDoc;
}
