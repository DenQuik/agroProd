import { prisma } from '../../lib/prisma.js';

export async function findEstados(): Promise<{ id: number; nombre: string }[]> {
  return prisma.estado.findMany({
    select: { id: true, nombre: true },
    orderBy: { nombre: 'asc' },
  });
}

export async function findMunicipiosByEstado(
  estadoId: number,
): Promise<{ id: number; nombre: string; estadoId: number }[]> {
  return prisma.municipio.findMany({
    where: { estadoId },
    select: { id: true, nombre: true, estadoId: true },
    orderBy: { nombre: 'asc' },
  });
}

export async function findParroquiasByMunicipio(
  municipioId: number,
): Promise<{ id: number; nombre: string; municipioId: number }[]> {
  return prisma.parroquia.findMany({
    where: { municipioId },
    select: { id: true, nombre: true, municipioId: true },
    orderBy: { nombre: 'asc' },
  });
}
