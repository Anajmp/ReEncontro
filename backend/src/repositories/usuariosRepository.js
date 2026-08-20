// =====================================================================
// usuariosRepository — gestão de contas de funcionárias.
// Apenas a diretora acessa estas operações.
// =====================================================================
import { db } from "../config/database.js";

export const usuariosRepository = {
  // Lista todas as funcionárias (inspetoras e diretoras)
  async listarFuncionarias() {
    const [rows] = await db.execute(
      `SELECT id, nome, email, telefone, is_diretora, ativo, ultimo_login_em, created_at
       FROM users
       WHERE role = 'funcionaria'
       ORDER BY nome ASC`,
    );
    return rows;
  },

  async emailExiste(email) {
    const [rows] = await db.execute(`SELECT id FROM users WHERE email = ?`, [
      email,
    ]);
    return rows.length > 0;
  },

  // Cria uma funcionária
  async criarFuncionaria({ nome, email, senhaHash, telefone, isDiretora }) {
    const [result] = await db.execute(
      `INSERT INTO users (nome, email, senha_hash, telefone, role, is_diretora)
       VALUES (?, ?, ?, ?, 'funcionaria', ?)`,
      [nome, email, senhaHash, telefone ?? null, isDiretora ? 1 : 0],
    );
    return result.insertId;
  },

  // Edita dados da funcionária (sem mexer na senha)
  async atualizarFuncionaria(id, { nome, email, telefone, isDiretora }) {
    const [result] = await db.execute(
      `UPDATE users
       SET nome = ?, email = ?, telefone = ?, is_diretora = ?
       WHERE id = ? AND role = 'funcionaria'`,
      [nome, email, telefone ?? null, isDiretora ? 1 : 0, id],
    );
    return result.affectedRows > 0;
  },

  // Ativa ou desativa a conta
  async alterarStatus(id, ativo) {
    const [result] = await db.execute(
      `UPDATE users SET ativo = ? WHERE id = ? AND role = 'funcionaria'`,
      [ativo ? 1 : 0, id],
    );
    return result.affectedRows > 0;
  },
};
