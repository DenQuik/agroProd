import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '../../generated/prisma/client/runtime/library.js';
import { HTTP_STATUS } from '../constants/http-status.constants.js';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: 'Datos de entrada inválidos',
      detalles: err.issues.map((i) => ({
        campo: i.path.join('.'),
        mensaje: i.message,
      })),
    });
    return;
  }

  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const fields = Array.isArray(err.meta?.['target']) ? (err.meta?.['target'] as string[]).join(', ') : 'campo';
      res.status(HTTP_STATUS.CONFLICT).json({
        error: `Ya existe un registro con el mismo valor en: ${fields}`,
      });
      return;
    }

    res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: `Error de base de datos: ${err.message}`,
    });
    return;
  }

  const message = err instanceof Error ? err.message : 'Error interno del servidor';
  res.status(HTTP_STATUS.INTERNAL).json({ error: message });
}
