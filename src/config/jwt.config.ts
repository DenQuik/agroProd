import { env } from './env.config.js';

export const jwtConfig = {
  secret: env.JWT_SECRET,
  expiresIn: '8h',
} as const;
