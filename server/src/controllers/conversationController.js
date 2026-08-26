import * as conversationService from '../services/conversationService.js';

export async function createConversation(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { title } = req.body;
    const conversation = await conversationService.createConversation(userId, title);
    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
}

export async function getConversations(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const conversations = await conversationService.getUserConversations(userId);
    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    next(error);
  }
}

export async function getConversation(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const conversation = await conversationService.getConversationById(req.params.id, userId);
    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateConversation(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: 'Title is required.',
      });
    }

    const conversation = await conversationService.updateConversationTitle(req.params.id, userId, title);
    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteConversation(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const result = await conversationService.deleteConversation(req.params.id, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
