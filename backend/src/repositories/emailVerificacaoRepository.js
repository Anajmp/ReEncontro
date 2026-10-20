// =====================================================================
// emailVerificacaoRepository — códigos de verificação de e-mail.
// Guardamos apenas o HASH do código (nunca o valor puro).
// =====================================================================
import { db } from "../config/database.js";

export const emailVerificacaoRepository = {
  // Dados do usuário necessários para o fluxo
  async buscarUsuario(userId) {
    const [rows] = await db.execute(
      `SELECT id, nome, email, email_verificado_em FROM users WHERE id = ?`,
      [userId],
    );
    return rows[0] ?? null;
  },

  // Invalida os códigos pendentes e cria um novo, válido por 15 minutos
  async criarCodigo(userId, codigoHash) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      await conn.execute(
        `UPDATE email_verificacoes SET usado_em = NOW()
         WHERE user_id = ? AND usado_em IS NULL`,
        [userId],
      );

      await conn.execute(
        `INSERT INTO email_verificacoes (user_id, codigo_hash, expira_em)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`,
        [userId, codigoHash],
      );

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // Último código emitido para o usuário (ativo ou não), para dar a
  // mensagem certa: expirado, tentativas esgotadas ou substituído.
  async buscarUltimoCodigo(userId) {
    const [rows] = await db.execute(
      `SELECT id, codigo_hash, usado_em, tentativas,
              (expira_em <= NOW()) AS expirado
       FROM email_verificacoes
       WHERE user_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [userId],
    );
    return rows[0] ?? null;
  },

  // Soma uma tentativa errada; ao chegar no máximo, queima o código.
  // usado_em vem ANTES de tentativas no SET: o MySQL avalia da esquerda
  // para a direita, então aqui "tentativas" ainda é o valor antigo.
  async registrarTentativaErrada(codigoId, maxTentativas) {
    await db.execute(
      `UPDATE email_verificacoes
       SET usado_em = IF(tentativas + 1 >= ?, NOW(), NULL),
           tentativas = tentativas + 1
       WHERE id = ? AND usado_em IS NULL`,
      [maxTentativas, codigoId],
    );
    const [rows] = await db.execute(
      `SELECT tentativas FROM email_verificacoes WHERE id = ?`,
      [codigoId],
    );
    return rows[0]?.tentativas ?? maxTentativas;
  },

  // Marca o código como usado e o e-mail como verificado, de forma atômica
  async confirmar(codigoId, userId) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      await conn.execute(
        `UPDATE email_verificacoes SET usado_em = NOW()
         WHERE user_id = ? AND usado_em IS NULL`,
        [userId],
      );

      await conn.execute(
        `UPDATE users SET email_verificado_em = NOW() WHERE id = ?`,
        [userId],
      );

      const [rows] = await conn.execute(
        `SELECT email_verificado_em FROM users WHERE id = ?`,
        [userId],
      );

      await conn.commit();
      return rows[0]?.email_verificado_em ?? null;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};
