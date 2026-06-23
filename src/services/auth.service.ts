import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';
import { jwtConfig } from '../config/jwt.config.js';

interface LoginResult {
  token: string;
  usuario: {
    id: number;
    username: string;
    nombre: string;
    rol: string;
  };
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const usuario = await prisma.usuario.findUnique({ where: { username } });

  if (!usuario) {
    throw new Error('Credenciales inválidas');
  }

  const passwordValido = await bcrypt.compare(password, usuario.password);

  if (!passwordValido) {
    throw new Error('Credenciales inválidas');
  }

  const payload = {
    id: usuario.id,
    username: usuario.username,
    rol: usuario.rol,
  };

  const token = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

  return {
    token,
    usuario: {
      id: usuario.id,
      username: usuario.username,
      nombre: usuario.nombre,
      rol: usuario.rol,
    },
  };
}
