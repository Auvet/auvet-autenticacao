import express from 'express';
import dotenv from 'dotenv';
import routes from './routes';
import prisma from './config/database';
import { setupSwagger } from './config/swagger';

dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 4000;

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

