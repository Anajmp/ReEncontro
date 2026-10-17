// =====================================================================
// refreshTokensRepository — tokens de renovação de sessão.
// Guardamos apenas o HASH do token (nunca o valor puro).
// =====================================================================
import { db } from "../config/database.js";

export const refreshTokensRepository = {
  // Cria um token válido por N dias
  async criar(userId, tokenHash, dias) {
    await db.execute(
      `INSERT INTO refresh_tokens (user_id, token_hash, expira_em)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
      [userId, tokenHash, dias],
    );
  },

  // Busca o token (mesmo revogado/expirado, para detectar reuso) e o
  // estado atual do usuário, que vai no novo access token
  async buscarPorHash(tokenHash) {
    const [rows] = await db.execute(
      `SELECT rt.id, rt.user_id, rt.revogado_em, (rt.expira_em > NOW()) AS dentro_validade,
              u.role, u.is_diretora, u.ativo
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = ?`,
      [tokenHash],
    );
    return rows[0] ?? null;
  },

  // Revoga um token específico. Devolve false se ele já estava revogado —
  // assim duas renovações simultâneas com o mesmo token não passam as duas.
  async revogar(id) {
    const [result] = await db.execute(
      `UPDATE refresh_tokens SET revogado_em = NOW(), ultimo_uso_em = NOW()
       WHERE id = ? AND revogado_em IS NULL`,
      [id],
    );
    return result.affectedRows > 0;
  },

  async revogarPorHash(tokenHash) {
    await db.execute(
      `UPDATE refresh_tokens SET revogado_em = NOW()
       WHERE token_hash = ? AND revogado_em IS NULL`,
      [tokenHash],
    );
  },

  // Derruba todas as sessões do usuário (troca de senha, reuso detectado)
  async revogarTodosDoUsuario(userId) {
    await db.execute(
      `UPDATE refresh_tokens SET revogado_em = NOW()
       WHERE user_id = ? AND revogado_em IS NULL`,
      [userId],
    );
  },
};
