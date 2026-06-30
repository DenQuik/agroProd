import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { createMarcaController, getMarcaController } from '../controllers/marca.controller.js';

const router = Router();

router.post('/:productorId/marca', authMiddleware, uploadSingle, createMarcaController);
router.get('/:productorId/marca', authMiddleware, getMarcaController);

export default router;
