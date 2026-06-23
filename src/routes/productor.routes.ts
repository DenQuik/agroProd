import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  getProductoresController,
  getProductorByIdController,
  createProductorController,
  updateProductorController,
  deleteProductorController,
} from '../controllers/productor.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getProductoresController);
router.get('/:id', getProductorByIdController);
router.post('/', createProductorController);
router.put('/:id', updateProductorController);
router.delete('/:id', deleteProductorController);

export default router;
