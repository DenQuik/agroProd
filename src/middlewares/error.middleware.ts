import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/app.error.js';
import { HTTP_STATUS } from '../constants/http-status.constants.js';

interface PrismaKnownError {
  code: string;
  message: string;
  meta?: Record<string, unknown>;
}

function isPrismaKnownError(err: unknown): err is PrismaKnownError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    'message' in err &&
    typeof (err as Record<string, unknown>)['code'] === 'string' &&
    (err as Record<string, unknown>)['code'] !== undefined
  );
}

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

  if (isPrismaKnownError(err)) {
    if (err.code === 'P2002') {
      const target = err.meta?.['target'];
      const fields = Array.isArray(target) ? (target as string[]).join(', ') : 'campo';
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

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  const message = err instanceof Error ? err.message : 'Error interno del servidor';
  res.status(HTTP_STATUS.INTERNAL).json({ error: message });
}
