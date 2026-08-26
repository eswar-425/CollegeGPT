import * as chatService from '../services/chatService.js';

export async function sendMessage(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { conversationId, message, departmentFilter, categoryFilter } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: 'Message field is required.',
      });
    }

    const collegeName = req.user.collegeName || 'General College';

    const result = await chatService.processChatMessage({
      userId,
      conversationId,
      message,
      departmentFilter,
      categoryFilter,
      collegeName,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMessages(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const messages = await chatService.getConversationMessages(req.params.conversationId, userId);
    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
}

export async function submitFeedback(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { rating, comment } = req.body;

    if (!rating || !['helpful', 'not_helpful'].includes(rating)) {
      return res.status(400).json({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: 'Rating must be either helpful or not_helpful.',
      });
    }

    const feedback = await chatService.recordMessageFeedback(req.params.messageId, userId, {
      rating,
      comment,
    });

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully.',
      feedback,
    });
  } catch (error) {
    next(error);
  }
}
