import path from 'node:path';
import fs from 'node:fs';
import sharp from 'sharp';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../errors/app.error.js';
import { HTTP_STATUS } from '../constants/http-status.constants.js';
import {
  generarPHashDesdeBuffer,
  calcularDistanciaHamming,
} from '../utils/hash-comparer.util.js';

const STORAGE_DIR = 'storage/marcas';
const HAMMING_THRESHOLD = 6;

export async function registrarMarca(
  productorId: number,
  codigo: string,
  fileBuffer: Buffer,
  _originalName: string,
) {
  // 1. Verificar que el productor existe
  const productor = await prisma.productor.findUnique({ where: { id: productorId } });
  if (!productor) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, `Productor con id ${productorId} no encontrado`);
  }

  // 2. Verificar que no tenga ya una marca registrada
  const marcaExistente = await prisma.marca.findUnique({ where: { productorId } });
  if (marcaExistente) {
    throw new AppError(HTTP_STATUS.CONFLICT, 'Este productor ya tiene una marca registrada');
  }

  // 3. Generar pHash binario de 64 bits
  const pHash = await generarPHashDesdeBuffer(fileBuffer);

  // 4. Comparar con hashes de todas las marcas existentes
  const marcasActivas = await prisma.marca.findMany({
    select: { id: true, hashImagen: true },
  });

  for (const marca of marcasActivas) {
    const distancia = calcularDistanciaHamming(pHash, marca.hashImagen);
    if (distancia <= HAMMING_THRESHOLD) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        'La marca cargada es visualmente idéntica o muy similar a una marca ya registrada',
      );
    }
  }

  // 5. Procesar y guardar imagen en disco
  await fs.promises.mkdir(STORAGE_DIR, { recursive: true });
  const filename = `${pHash}.webp`;
  const filepath = path.join(STORAGE_DIR, filename);

  await sharp(fileBuffer)
    .resize(400, 400, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(filepath);

  // 6. Persistir en base de datos
  return prisma.marca.create({
    data: {
      codigo,
      rutaImagen: filepath,
      hashImagen: pHash,
      productorId,
    },
  });
}

export async function getMarcaByProductorId(productorId: number) {
  const marca = await prisma.marca.findUnique({ where: { productorId } });
  if (!marca) {
    throw new AppError(404, `No se encontró marca para el productor ${productorId}`);
  }
  return marca;
}
