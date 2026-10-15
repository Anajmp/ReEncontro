// =====================================================================
// Ponto de entrada — sobe o servidor
// =====================================================================
import "./config/env.js";
import app from "./app.js";
import { testConnection } from "./config/database.js";

const PORT = process.env.PORT || 3000;

async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV}`);
  });
}

start();
