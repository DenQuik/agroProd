import { Request, Response } from 'express';
import {
  createProductorSchema,
  updateProductorSchema,
  idParamSchema,
} from '../validators/productor.validator.js';
import {
  getAllProductores,
  getProductorById,
  createProductor,
  updateProductor,
  deleteProductor,
} from '../services/productor.service.js';
import { HTTP_STATUS } from '../constants/http-status.constants.js';

export async function getProductoresController(_req: Request, res: Response): Promise<void> {
  const productores = await getAllProductores();
  res.status(HTTP_STATUS.OK).json(productores);
}

export async function getProductorByIdController(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const productor = await getProductorById(id);
  res.status(HTTP_STATUS.OK).json(productor);
}

export async function createProductorController(req: Request, res: Response): Promise<void> {
  const data = createProductorSchema.parse(req.body);
  const productor = await createProductor(data);
  res.status(HTTP_STATUS.CREATED).json(productor);
}

export async function updateProductorController(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const data = updateProductorSchema.parse(req.body);
  const productor = await updateProductor(id, data);
  res.status(HTTP_STATUS.OK).json(productor);
}

export async function deleteProductorController(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params);
  const productor = await deleteProductor(id);
  res.status(HTTP_STATUS.OK).json({ mensaje: 'Productor desactivado correctamente', productor });
}
