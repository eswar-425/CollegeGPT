import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/dashboard', adminController.getDashboard);
router.get('/feedback', adminController.getFeedback);
router.get('/users', adminController.getUsers);

export default router;
