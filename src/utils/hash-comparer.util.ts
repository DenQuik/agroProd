import sharp from 'sharp';

export function calcularDistanciaHamming(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) {
    throw new Error(
      `Los hashes deben tener igual longitud: ${hash1.length} vs ${hash2.length}`,
    );
  }
  let distancia = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distancia++;
  }
  return distancia;
}

export async function generarPHashDesdeBuffer(buffer: Buffer): Promise<string> {
  const data = await sharp(buffer)
    .resize(8, 8, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer();

  const pixeles = Array.from(data as Uint8Array);
  const promedio = pixeles.reduce((acc, val) => acc + val, 0) / pixeles.length;

  return pixeles.map((pixel) => (pixel >= promedio ? '1' : '0')).join('');
}
