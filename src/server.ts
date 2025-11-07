import express from 'express';
import dotenv from 'dotenv';
import routes from './routes';
import prisma from './config/database';
import { setupSwagger } from './config/swagger';

dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 4000;
const corsEnv = process.env['CORS_ORIGINS'] || process.env['CORS_ORIGIN'];
const allowedOrigins = (corsEnv || 'http://localhost:5173,https://auvet-frontendd.vercel.app')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());

setupSwagger(app);

app.use('/api', routes);

app.get('/health', async(_req, res) => {
  try {
    await prisma.$connect();
    res.json({ status: 'OK', database: 'Connected', service: 'Auvet Authentication' });
  } catch (error) {
    console.error('Erro na conexão com o banco:', error);
    res.status(500).json({ status: 'ERROR', database: 'Disconnected' });
  }
});

async function startServer(): Promise<void> {
  try {
    await prisma.$connect();
    app.listen(PORT, () => {
      console.log(`Authentication Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
}

startServer();

