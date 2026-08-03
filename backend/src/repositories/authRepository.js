// =====================================================================
// authRepository — queries SQL relacionadas à autenticação.
// Sempre db.execute() com placeholders (?), nunca concatenação.
// =====================================================================
import { db } from "../config/database.js";

export const authRepository = {
  // Busca um usuário pelo email (usado no login)
  async findByEmail(email) {
    const [rows] = await db.execute(
      `SELECT id, nome, email, senha_hash, role, is_diretora, ativo
       FROM users
       WHERE email = ?`,
      [email],
    );
    return rows[0] ?? null;
  },

  // Atualiza o registro de último login
  async updateUltimoLogin(userId) {
    await db.execute(`UPDATE users SET ultimo_login_em = NOW() WHERE id = ?`, [
      userId,
    ]);
  },

  // Verifica se um email já está cadastrado
  async emailExiste(email) {
    const [rows] = await db.execute(`SELECT id FROM users WHERE email = ?`, [
      email,
    ]);
    return rows.length > 0;
  },

  // Cria um responsável + seus alunos numa transação atômica
  async criarResponsavelComAlunos({
    nome,
    email,
    senhaHash,
    telefone,
    alunos,
  }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Cria o usuário responsável
      const [result] = await conn.execute(
        `INSERT INTO users (nome, email, senha_hash, telefone, role)
         VALUES (?, ?, ?, ?, 'responsavel')`,
        [nome, email, senhaHash, telefone ?? null],
      );
      const responsavelId = result.insertId;

      // 2. Cria cada aluno vinculado
      for (const aluno of alunos) {
        await conn.execute(
          `INSERT INTO alunos (responsavel_id, nome, sala, periodo, ano_letivo)
           VALUES (?, ?, ?, ?, ?)`,
          [
            responsavelId,
            aluno.nome,
            aluno.sala,
            aluno.periodo,
            aluno.ano_letivo,
          ],
        );
      }

      await conn.commit();
      return responsavelId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};
