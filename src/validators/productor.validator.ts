import { z } from 'zod';
import { CEDULA_RIF_REGEX, TELEFONO_REGEX } from '../constants/regex.constants.js';

export const createProductorSchema = z.object({
  cedulaRif: z.string().regex(CEDULA_RIF_REGEX, 'Formato inválido. Ej: V-12345678-1'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  telefono: z.string().regex(TELEFONO_REGEX, 'Formato inválido. Ej: 0414-1234567'),
});

export const updateProductorSchema = createProductorSchema.partial();

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('El id debe ser un entero positivo'),
});

export type CreateProductorInput = z.infer<typeof createProductorSchema>;
export type UpdateProductorInput = z.infer<typeof updateProductorSchema>;
