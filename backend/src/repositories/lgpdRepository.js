// =====================================================================
// lgpdRepository — anonimização de dados pessoais (RN-008 / LGPD).
// Os registros históricos são preservados, mas os campos que
// identificam a pessoa são substituídos por valores genéricos.
// =====================================================================
import { db } from "../config/database.js";

const NOME_ANONIMO = "[Usuário excluído]";

export const lgpdRepository = {
  // Busca um responsável pelo e-mail (para a diretora localizar quem excluir)
  async buscarResponsavel(email) {
    const [rows] = await db.execute(
      `SELECT id, nome, email, ativo FROM users
       WHERE email = ? AND role = 'responsavel'`,
      [email],
    );
    return rows[0] ?? null;
  },

  // Anonimiza todos os dados pessoais do responsável, de forma atômica
  async anonimizar(userId) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const emailAnonimo = `excluido_${userId}@anonimizado.local`;

      // 1. Dados da conta
      await conn.execute(
        `UPDATE users
         SET nome = ?, email = ?, telefone = NULL,
             senha_hash = '', avatar_seed = NULL, ativo = 0
         WHERE id = ?`,
        [NOME_ANONIMO, emailAnonimo, userId],
      );

      // 2. Snapshot nas reivindicações (preserva o registro, remove a identificação)
      await conn.execute(
        `UPDATE reivindicacoes
         SET nome_requerente = ?, email_requerente = ?, telefone_requerente = NULL,
             nome_aluno = '[Aluno removido]'
         WHERE user_id = ?`,
        [NOME_ANONIMO, emailAnonimo, userId],
      );

      // 3. Alunos vinculados
      await conn.execute(
        `UPDATE alunos
         SET nome = '[Aluno removido]', ativo = 0
         WHERE responsavel_id = ?`,
        [userId],
      );

      // 4. Invalida tokens de redefinição pendentes
      await conn.execute(
        `UPDATE password_resets SET usado_em = NOW()
         WHERE user_id = ? AND usado_em IS NULL`,
        [userId],
      );

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};
