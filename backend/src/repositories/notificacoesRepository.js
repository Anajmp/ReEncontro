// =====================================================================
// notificacoesRepository — registro dos e-mails enviados (RN-010).
// =====================================================================
import { db } from "../config/database.js";

export const notificacoesRepository = {
  // Registra um e-mail já processado, com o resultado do envio
  async registrar({ userId, emailDestino, tipo, assunto, corpo, enviada, erro }) {
    await db.execute(
      `INSERT INTO notificacoes
         (user_id, email_destino, tipo, assunto, corpo, status, tentativas, erro, enviada_em)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ${enviada ? "NOW()" : "NULL"})`,
      [
        userId ?? null,
        emailDestino,
        tipo,
        assunto,
        corpo,
        enviada ? "enviada" : "falhou",
        erro ?? null,
      ],
    );
  },
};
