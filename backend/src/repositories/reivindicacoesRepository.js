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

  // Lista reivindicações em processo (aprovadas, aguardando retirada)
  async listarEmProcesso() {
    const [rows] = await db.execute(
      `SELECT
         r.id, r.item_id, r.nome_requerente, r.email_requerente,
         r.telefone_requerente, r.nome_aluno, r.sala_aluno, r.periodo_aluno,
         r.user_id, r.created_at, r.data_aprovacao,
         i.descricao AS item_descricao,
         (SELECT url FROM item_fotos WHERE item_id = i.id AND is_capa = TRUE LIMIT 1) AS item_foto
       FROM reivindicacoes r
       INNER JOIN itens i ON i.id = r.item_id
       WHERE r.status = 'aprovada'
       ORDER BY r.data_aprovacao ASC`,
    );
    return rows;
  },

  // Aprova uma reivindicação: reiv -> aprovada, item -> em_processo
  async aprovar(reivindicacaoId, funcionariaId) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Busca a reivindicação e trava a linha
      const [reivs] = await conn.execute(
        `SELECT id, item_id, status FROM reivindicacoes WHERE id = ? FOR UPDATE`,
        [reivindicacaoId],
      );
      if (reivs.length === 0) {
        throw { status: 404, mensagem: "Reivindicação não encontrada" };
      }
      if (reivs[0].status !== "pendente") {
        throw { status: 409, mensagem: "Esta reivindicação já foi processada" };
      }

      const itemId = reivs[0].item_id;

      // Aprova a reivindicação
      // Aprova a reivindicação
      await conn.execute(
        `UPDATE reivindicacoes
         SET status = 'aprovada', processado_por_user_id = ?, data_aprovacao = NOW()
         WHERE id = ?`,
        [funcionariaId, reivindicacaoId],
      );

      // Item vai para em_processo
      await conn.execute(
        `UPDATE itens SET status = 'em_processo' WHERE id = ?`,
        [itemId],
      );

      await conn.commit();
      return { reivindicacaoId, itemId };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // Rejeita uma reivindicação: reiv -> rejeitada (com motivo), item -> disponivel
  async rejeitar(reivindicacaoId, funcionariaId, motivo) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [reivs] = await conn.execute(
        `SELECT id, item_id, status FROM reivindicacoes WHERE id = ? FOR UPDATE`,
        [reivindicacaoId],
      );
      if (reivs.length === 0) {
        throw { status: 404, mensagem: "Reivindicação não encontrada" };
      }
      if (reivs[0].status !== "pendente") {
        throw { status: 409, mensagem: "Esta reivindicação já foi processada" };
      }

      const itemId = reivs[0].item_id;

      // Rejeita com o motivo
      await conn.execute(
        `UPDATE reivindicacoes
         SET status = 'rejeitada', processado_por_user_id = ?, motivo_rejeicao = ?
         WHERE id = ?`,
        [funcionariaId, motivo, reivindicacaoId],
      );

      // Item volta a ficar disponível
      await conn.execute(
        `UPDATE itens SET status = 'disponivel' WHERE id = ?`,
        [itemId],
      );

      await conn.commit();
      return { reivindicacaoId, itemId };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // Confirma entrega: reiv -> entregue, item -> entregue (registra finalização)
  async confirmarEntrega(reivindicacaoId, funcionariaId) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [reivs] = await conn.execute(
        `SELECT id, item_id, status FROM reivindicacoes WHERE id = ? FOR UPDATE`,
        [reivindicacaoId],
      );
      if (reivs.length === 0) {
        throw { status: 404, mensagem: "Reivindicação não encontrada" };
      }
      // Só pode entregar o que foi aprovado
      if (reivs[0].status !== "aprovada") {
        throw {
          status: 409,
          mensagem: "Só é possível entregar itens de reivindicações aprovadas",
        };
      }

      const itemId = reivs[0].item_id;

      // Reivindicação vira entregue
      await conn.execute(
        `UPDATE reivindicacoes SET status = 'entregue' WHERE id = ?`,
        [reivindicacaoId],
      );

      // Item vira entregue + registra finalização
      await conn.execute(
        `UPDATE itens
         SET status = 'entregue', finalizado_por_user_id = ?, finalizado_em = NOW()
         WHERE id = ?`,
        [funcionariaId, itemId],
      );

      await conn.commit();
      return { reivindicacaoId, itemId };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // Cancela uma reivindicação: reiv -> cancelada (com motivo), item -> disponivel
  async cancelar(reivindicacaoId, funcionariaId, motivo) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [reivs] = await conn.execute(
        `SELECT id, item_id, status FROM reivindicacoes WHERE id = ? FOR UPDATE`,
        [reivindicacaoId],
      );
      if (reivs.length === 0) {
        throw { status: 404, mensagem: "Reivindicação não encontrada" };
      }
      // Só cancela o que está pendente ou aprovado (em andamento)
      if (!["pendente", "aprovada"].includes(reivs[0].status)) {
        throw {
          status: 409,
          mensagem: "Esta reivindicação não pode ser cancelada",
        };
      }

      const itemId = reivs[0].item_id;

      await conn.execute(
        `UPDATE reivindicacoes
         SET status = 'cancelada', processado_por_user_id = ?, observacoes = ?
         WHERE id = ?`,
        [funcionariaId, motivo, reivindicacaoId],
      );

      await conn.execute(
        `UPDATE itens SET status = 'disponivel' WHERE id = ?`,
        [itemId],
      );

      await conn.commit();
      return { reivindicacaoId, itemId };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // Reverte uma entrega feita há menos de 24h (RN-015)
  async reverterEntrega(itemId, funcionariaId) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Busca o item e trava a linha
      const [itens] = await conn.execute(
        `SELECT id, status, finalizado_em FROM itens WHERE id = ? FOR UPDATE`,
        [itemId],
      );
      if (itens.length === 0) {
        throw { status: 404, mensagem: "Item não encontrado" };
      }
      if (itens[0].status !== "entregue") {
        throw { status: 409, mensagem: "Este item não está entregue" };
      }

      // Checa a janela de 24h
      const finalizadoEm = new Date(itens[0].finalizado_em);
      const agora = new Date();
      const horasPassadas = (agora - finalizadoEm) / (1000 * 60 * 60);
      if (horasPassadas > 24) {
        throw {
          status: 409,
          mensagem: "O prazo de 24h para reverter a entrega já expirou",
        };
      }

      // Item volta pra disponivel + registra a reversão
      await conn.execute(
        `UPDATE itens
         SET status = 'disponivel', revertido_em = NOW(), revertido_por_user_id = ?,
             finalizado_em = NULL, finalizado_por_user_id = NULL
         WHERE id = ?`,
        [funcionariaId, itemId],
      );

      // A reivindicação que estava 'entregue' volta a ser 'cancelada'
      await conn.execute(
        `UPDATE reivindicacoes
         SET status = 'cancelada', observacoes = 'Entrega revertida pela funcionária'
         WHERE item_id = ? AND status = 'entregue'`,
        [itemId],
      );

      await conn.commit();
      return { itemId };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // Lista as reivindicações de UM usuário específico (as dele apenas)
  async listarPorUsuario(userId) {
    const [rows] = await db.execute(
      `SELECT
         r.id, r.item_id, r.status, r.nome_aluno, r.sala_aluno, r.periodo_aluno,
         r.motivo_rejeicao, r.created_at, r.data_aprovacao,
         i.descricao AS item_descricao,
         (SELECT url FROM item_fotos WHERE item_id = i.id AND is_capa = TRUE LIMIT 1) AS item_foto
       FROM reivindicacoes r
       INNER JOIN itens i ON i.id = r.item_id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [userId],
    );
    return rows;
  },
};
