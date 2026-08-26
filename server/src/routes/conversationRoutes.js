import express from 'express';
import * as conversationController from '../controllers/conversationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', conversationController.createConversation);
router.get('/', conversationController.getConversations);
router.get('/:id', conversationController.getConversation);
router.put('/:id', conversationController.updateConversation);
router.delete('/:id', conversationController.deleteConversation);

export default router;
