import express from 'express';
import * as chatController from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', chatController.sendMessage);
router.get('/:conversationId/messages', chatController.getMessages);
router.post('/:messageId/feedback', chatController.submitFeedback);

export default router;
