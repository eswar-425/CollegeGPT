import { dbAdapter } from '../config/dbAdapter.js';

export async function createConversation(userId, title = 'New College Inquiry') {
  const conversation = await dbAdapter.conversations.create({
    userId,
    title,
    lastMessageAt: new Date(),
  });
  return conversation;
}

export async function getUserConversations(userId) {
  const conversations = await dbAdapter.conversations.find({ userId });
  return conversations;
}

export async function getConversationById(conversationId, userId) {
  const conversation = await dbAdapter.conversations.findOne({ _id: conversationId, userId });
  if (!conversation) {
    const error = new Error('Conversation not found or access denied.');
    error.code = 'CONVERSATION_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }
  return conversation;
}

export async function updateConversationTitle(conversationId, userId, title) {
  const conversation = await dbAdapter.conversations.findOneAndUpdate(
    { _id: conversationId, userId },
    { title: title.trim() }
  );

  if (!conversation) {
    const error = new Error('Conversation not found.');
    error.code = 'CONVERSATION_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }
  return conversation;
}

export async function deleteConversation(conversationId, userId) {
  const conversation = await dbAdapter.conversations.findOneAndDelete({ _id: conversationId, userId });
  if (!conversation) {
    const error = new Error('Conversation not found or access denied.');
    error.code = 'CONVERSATION_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  // Delete all messages and feedback associated with this conversation
  await dbAdapter.messages.deleteMany({ conversationId });
  await dbAdapter.feedback.deleteMany({ conversationId });

  return { success: true, message: 'Conversation deleted successfully.' };
}
