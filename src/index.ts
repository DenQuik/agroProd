import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from '../lib/prisma.js';
import authRoutes from './routes/auth.routes.js';
import geografiaRoutes from './routes/geografia.routes.js';
import productorRoutes from './routes/productor.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';


const app = express();
const PORT = process.env['PORT'] ?? 3000;

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'OK',
      message: 'Conectado a MySQL vía adapter',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'No se pudo conectar a la base de datos',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/geografia', geografiaRoutes);
app.use('/api/productores', productorRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/health`);
});