// =====================================================================
// passwordResetRepository — tokens de redefinição de senha.
// Guardamos apenas o HASH do token (nunca o valor puro).
// =====================================================================
import { db } from "../config/database.js";

export const passwordResetRepository = {
  // Busca um usuário ativo pelo e-mail
  async buscarUsuarioPorEmail(email) {
    const [rows] = await db.execute(
      `SELECT id, nome, email FROM users WHERE email = ? AND ativo = 1`,
      [email],
    );
    return rows[0] ?? null;
  },

  // Cria um token com validade de 1 hora
  async criarToken(userId, tokenHash) {
    await db.execute(
      `INSERT INTO password_resets (user_id, token_hash, expira_em)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))`,
      [userId, tokenHash],
    );
  },

  // Busca um token válido: não usado e não expirado
  async buscarTokenValido(tokenHash) {
    const [rows] = await db.execute(
      `SELECT id, user_id FROM password_resets
       WHERE token_hash = ? AND usado_em IS NULL AND expira_em > NOW()`,
      [tokenHash],
    );
    return rows[0] ?? null;
  },

  // Troca a senha e invalida o token, de forma atômica
  async redefinirSenha(resetId, userId, novaSenhaHash) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      await conn.execute(`UPDATE users SET senha_hash = ? WHERE id = ?`, [
        novaSenhaHash,
        userId,
      ]);

      // Marca este token como usado
      await conn.execute(
        `UPDATE password_resets SET usado_em = NOW() WHERE id = ?`,
        [resetId],
      );

      // Invalida quaisquer outros tokens pendentes do mesmo usuário
      await conn.execute(
        `UPDATE password_resets SET usado_em = NOW()
         WHERE user_id = ? AND usado_em IS NULL`,
        [userId],
      );

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};
