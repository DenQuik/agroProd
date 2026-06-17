import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ruta de prueba para validar la salud del sistema y la conexión a la BD
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Intento simple de consulta para validar conexión a MySQL vía Prisma
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'OK',
      message: 'El servidor está corriendo y la base de datos está conectada correctamente.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error de conexión a la BD:', error);
    res.status(500).json({
      status: 'Error',
      message: 'El servidor está activo, pero no se pudo conectar a la base de datos.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🩺 Health check available at http://localhost:${PORT}/health`);
});
