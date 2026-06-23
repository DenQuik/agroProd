import { Request, Response } from 'express';
import { getMunicipiosSchema, getParroquiasSchema } from '../validators/geografia.validator.js';
import {
  findEstados,
  findMunicipiosByEstado,
  findParroquiasByMunicipio,
} from '../services/geografia.service.js';
import { HTTP_STATUS } from '../constants/http-status.constants.js';

export async function getEstadosController(_req: Request, res: Response): Promise<void> {
  const estados = await findEstados();
  res.status(HTTP_STATUS.OK).json(estados);
}

export async function getMunicipiosController(req: Request, res: Response): Promise<void> {
  const { estadoId } = getMunicipiosSchema.parse(req.params);
  const municipios = await findMunicipiosByEstado(estadoId);
  res.status(HTTP_STATUS.OK).json(municipios);
}

export async function getParroquiasController(req: Request, res: Response): Promise<void> {
  const { municipioId } = getParroquiasSchema.parse(req.params);
  const parroquias = await findParroquiasByMunicipio(municipioId);
  res.status(HTTP_STATUS.OK).json(parroquias);
}
