// =====================================================================
// alunosRepository — queries SQL dos alunos vinculados ao responsável.
// Toda query filtra por responsavel_id (isolamento entre contas).
// =====================================================================
import { db } from "../config/database.js";

export const alunosRepository = {
  // Lista os alunos ATIVOS de um responsável
  async listarPorResponsavel(responsavelId) {
    const [rows] = await db.execute(
      `SELECT id, nome, sala, periodo, ano_letivo, created_at
       FROM alunos
       WHERE responsavel_id = ? AND ativo = 1
       ORDER BY nome ASC`,
      [responsavelId],
    );
    return rows;
  },

  // Cria um aluno vinculado ao responsável
  async criar(responsavelId, { nome, sala, periodo, anoLetivo }) {
    const [result] = await db.execute(
      `INSERT INTO alunos (responsavel_id, nome, sala, periodo, ano_letivo)
       VALUES (?, ?, ?, ?, ?)`,
      [responsavelId, nome, sala, periodo, anoLetivo],
    );
    return result.insertId;
  },

  // Edita um aluno — só se ele pertencer ao responsável logado
  async atualizar(alunoId, responsavelId, { nome, sala, periodo, anoLetivo }) {
    const [result] = await db.execute(
      `UPDATE alunos
       SET nome = ?, sala = ?, periodo = ?, ano_letivo = ?
       WHERE id = ? AND responsavel_id = ? AND ativo = 1`,
      [nome, sala, periodo, anoLetivo, alunoId, responsavelId],
    );
    return result.affectedRows > 0;
  },
};
