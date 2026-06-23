import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { createMarcaController } from '../controllers/marca.controller.js';

const router = Router();

router.post('/', authMiddleware, uploadSingle, createMarcaController);

export default router;
