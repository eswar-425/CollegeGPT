import express from 'express';
import * as documentController from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', documentController.getDocuments);
router.post('/', requireAdmin, upload.single('file'), documentController.uploadDocument);
router.get('/:id', documentController.getDocument);
router.delete('/:id', requireAdmin, documentController.deleteDocument);
router.post('/:id/reprocess', requireAdmin, documentController.reprocessDocument);
router.get('/:id/status', documentController.getDocumentStatus);

export default router;
