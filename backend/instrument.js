// =====================================================================
// Inicialização do Sentry (monitoramento de erros em produção).
// Carregado antes de qualquer outro módulo, via flag --import.
// =====================================================================
import * as Sentry from "@sentry/node";
import dotenv from "dotenv";

dotenv.config();

// Só ativa se o DSN estiver configurado — em desenvolvimento local
// sem a variável, o Sentry simplesmente não envia nada.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    // Amostragem de performance: 10% em produção para não estourar a cota
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  });
  console.log("Sentry inicializado.");
}
