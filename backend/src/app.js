// =====================================================================
// Configuração da aplicação Express
// =====================================================================
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import * as Sentry from "@sentry/node";
import { CORS_ORIGINS } from "./config/env.js";
import { limiteGeral } from "./middlewares/rateLimitMiddleware.js";

dotenv.config();

const app = express();

// Middlewares globais
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1); // ANTES de tudo — o Render fica atrás de proxy
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use("/api", limiteGeral);

// Healthcheck (para monitoramento)
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Todas as rotas da API ficam sob /api
app.use("/api", routes);

Sentry.setupExpressErrorHandler(app);
// Tratamento central de erros (sempre por último)
app.use(errorMiddleware);

export default app;
