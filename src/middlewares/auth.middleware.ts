import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config.js';
import { HTTP_STATUS } from '../constants/http-status.constants.js';

interface TokenPayload {
  id: number;
  username: string;
  rol: string;
}

function isTokenPayload(value: unknown): value is TokenPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>)['id'] === 'number' &&
    typeof (value as Record<string, unknown>)['username'] === 'string' &&
    typeof (value as Record<string, unknown>)['rol'] === 'string'
  );
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Token de autenticación requerido' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);

    if (!isTokenPayload(decoded)) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Estructura de token inválida' });
      return;
    }

    req.usuario = { id: decoded.id, username: decoded.username, rol: decoded.rol };
    next();
  } catch {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Token inválido o expirado' });
  }
}
