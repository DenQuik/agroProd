import express from 'express';
import cors from 'cors';
import { prisma } from '../lib/prisma.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'OK',
      message: 'Conectado a MySQL vía adapter',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error de conexión:', error);
    res.status(500).json({
      status: 'Error',
      message: 'No se pudo conectar a la base de datos',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/health`);
});