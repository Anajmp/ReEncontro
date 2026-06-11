// =====================================================================
// Configuração da aplicação Express
// =====================================================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

dotenv.config();

const app = express();

// Middlewares globais
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck (para monitoramento)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Todas as rotas da API ficam sob /api
app.use('/api', routes);

// Tratamento central de erros (sempre por último)
app.use(errorMiddleware);

export default app;
