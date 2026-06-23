import { prisma } from '../../lib/prisma.js';
import { AppError } from '../errors/app.error.js';
import type { CreateProductorInput, UpdateProductorInput } from '../validators/productor.validator.js';

export async function getAllProductores() {
  return prisma.productor.findMany({
    select: {
      id: true,
      cedulaRif: true,
      nombre: true,
      apellido: true,
      telefono: true,
      activo: true,
      createdAt: true,
      _count: { select: { predios: true } },
      marca: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProductorById(id: number) {
  const productor = await prisma.productor.findUnique({
    where: { id },
    include: {
      predios: {
        include: {
          parroquia: {
            include: {
              municipio: {
                include: { estado: true },
              },
            },
          },
        },
      },
      marca: true,
    },
  });

  if (!productor) {
    throw new AppError(404, `Productor con id ${id} no encontrado`);
  }

  return productor;
}

export async function createProductor(data: CreateProductorInput) {
  return prisma.productor.create({ data });
}

export async function updateProductor(id: number, data: UpdateProductorInput) {
  await getProductorById(id);
  return prisma.productor.update({ where: { id }, data });
}

export async function deleteProductor(id: number) {
  await getProductorById(id);
  return prisma.productor.update({
    where: { id },
    data: { activo: false },
  });
}
