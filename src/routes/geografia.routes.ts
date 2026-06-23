import { Router } from 'express';
import {
  getEstadosController,
  getMunicipiosController,
  getParroquiasController,
} from '../controllers/geografia.controller.js';

const router = Router();

router.get('/estados', getEstadosController);
router.get('/estados/:estadoId/municipios', getMunicipiosController);
router.get('/municipios/:municipioId/parroquias', getParroquiasController);

export default router;
