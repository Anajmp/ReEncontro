// =====================================================================
// reivindicacoesRepository — SQL das reivindicações.
// O método criar usa transação + SELECT FOR UPDATE (controle de concorrência).
// =====================================================================
import { db } from "../config/database.js";

export const reivindicacoesRepository = {
  // Cria uma reivindicação de forma atômica e segura contra concorrência.
  async criar({
    itemId,
    userId,
    alunoId,
    nomeRequerente,
    emailRequerente,
    telefoneRequerente,
    nomeAluno,
    salaAluno,
    periodoAluno,
  }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 1. TRAVA a linha do item (FOR UPDATE) e confere o status atual.
      //    Se outra pessoa estiver reivindicando ao mesmo tempo, ela espera aqui.
      const [itens] = await conn.execute(
        `SELECT id, status FROM itens WHERE id = ? FOR UPDATE`,
        [itemId],
      );

      if (itens.length === 0) {
        throw { status: 404, mensagem: "Item não encontrado" };
      }
      if (itens[0].status !== "disponivel") {
        throw {
          status: 409,
          mensagem: "Este item não está mais disponível para reivindicação",
        };
      }

      // 2. Cria a reivindicação (com snapshot dos dados - RN-018)
      const [result] = await conn.execute(
        `INSERT INTO reivindicacoes
          (item_id, user_id, aluno_id, nome_requerente, email_requerente,
           telefone_requerente, nome_aluno, sala_aluno, periodo_aluno, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente')`,
        [
          itemId,
          userId ?? null,
          alunoId ?? null,
          nomeRequerente,
          emailRequerente,
          telefoneRequerente ?? null,
          nomeAluno,
          salaAluno,
          periodoAluno,
        ],
      );

      // 3. Muda o status do item para 'pendente'
      await conn.execute(`UPDATE itens SET status = 'pendente' WHERE id = ?`, [
        itemId,
      ]);

      await conn.commit();
      return result.insertId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // Lista reivindicações pendentes, com dados do item
  async listarPendentes() {
    const [rows] = await db.execute(
      `SELECT
         r.id, r.item_id, r.nome_requerente, r.email_requerente,
         r.telefone_requerente, r.nome_aluno, r.sala_aluno, r.periodo_aluno,
         r.user_id, r.created_at,
         i.descricao AS item_descricao,
         (SELECT url FROM item_fotos WHERE item_id = i.id AND is_capa = TRUE LIMIT 1) AS item_foto
       FROM reivindicacoes r
       INNER JOIN itens i ON i.id = r.item_id
       WHERE r.status = 'pendente'
       ORDER BY r.created_at ASC`,
    );
    return rows;
  },

  async listarPendentes() {
    return reivindicacoesRepository.listarPendentes();
  },
};
