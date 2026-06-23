import { Request, Response } from 'express';
import { loginSchema } from '../validators/auth.validator.js';
import { login } from '../services/auth.service.js';
import { HTTP_STATUS } from '../constants/http-status.constants.js';

export async function loginController(req: Request, res: Response): Promise<void> {
  const body = loginSchema.parse(req.body);

  try {
    const result = await login(body.username, body.password);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (err) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: err instanceof Error ? err.message : 'Error de autenticación',
    });
  }
}
