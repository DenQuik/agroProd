import { Request, Response } from 'express';
import { z } from 'zod';
import { registrarMarca } from '../services/marca.service.js';
import { AppError } from '../errors/app.error.js';
import { HTTP_STATUS } from '../constants/http-status.constants.js';

const createMarcaBodySchema = z.object({
  productorId: z.coerce.number().int().positive('productorId debe ser un entero positivo'),
  codigo: z.string().trim().min(1, 'El código de marca es requerido'),
});

export async function createMarcaController(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Se requiere una imagen para registrar la marca');
  }

  const { productorId, codigo } = createMarcaBodySchema.parse(req.body);

  const marca = await registrarMarca(
    productorId,
    codigo,
    req.file.buffer,
    req.file.originalname,
  );

  res.status(HTTP_STATUS.CREATED).json(marca);
}
