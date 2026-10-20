// =====================================================================
// itensRepository — ÚNICA camada que escreve SQL.
// Toda query usa db.execute() com placeholders (?) — nunca concatenação.
// Use este arquivo como molde para os outros repositories.
// =====================================================================
import { db } from "../config/database.js";

export const itensRepository = {
  // Lista itens disponíveis (área pública), com filtros opcionais
  async findDisponiveis({ categoriaId, dataInicio, dataFim } = {}) {
    let sql = `
      SELECT
        i.id, i.nome, i.descricao, i.local_encontrado, i.data_encontrado, i.data_disponibilizacao, i.status,
        c.nome AS categoria,
        pc.nome AS ponto_coleta,
        (SELECT url FROM item_fotos
         WHERE item_id = i.id AND is_capa = TRUE LIMIT 1) AS foto_capa
      FROM itens i
      INNER JOIN categorias c     ON c.id  = i.categoria_id
      INNER JOIN pontos_coleta pc ON pc.id = i.ponto_coleta_id
      WHERE i.status = 'disponivel'
    `;
    const params = [];

    if (categoriaId) {
      sql += " AND i.categoria_id = ?";
      params.push(categoriaId);
    }
    if (dataInicio) {
      sql += " AND i.data_encontrado >= ?";
      params.push(dataInicio);
    }
    if (dataFim) {
      sql += " AND i.data_encontrado <= ?";
      params.push(dataFim);
    }
    sql += " ORDER BY i.data_encontrado DESC";

    const [rows] = await db.execute(sql, params);
    return rows;
  },

  // Detalhe de um item por ID (com todas as fotos).
  // A rota é pública: anotações internas, motivo de descarte e quem
  // cadastrou/finalizou só saem para funcionária (incluirInternos).
  async findById(id, { incluirInternos = false } = {}) {
    const colunasInternas = incluirInternos
      ? `, i.observacoes_internas, i.motivo_descarte, i.cadastrado_por_user_id,
         i.finalizado_por_user_id, i.finalizado_em, i.revertido_em,
         i.revertido_por_user_id, i.updated_at`
      : "";
    const [itens] = await db.execute(
      `SELECT i.id, i.nome, i.descricao, i.categoria_id, i.local_encontrado,
              i.ponto_coleta_id, i.data_encontrado, i.data_disponibilizacao,
              i.status, i.created_at ${colunasInternas},
              c.nome AS categoria_nome, pc.nome AS ponto_coleta_nome
       FROM itens i
       INNER JOIN categorias c     ON c.id  = i.categoria_id
       INNER JOIN pontos_coleta pc ON pc.id = i.ponto_coleta_id
       WHERE i.id = ?`,
      [id],
    );
    if (itens.length === 0) return null;

    const [fotos] = await db.execute(
      "SELECT id, url, is_capa, ordem FROM item_fotos WHERE item_id = ? ORDER BY ordem",
      [id],
    );

    return { ...itens[0], fotos };
  },

  // Cria um novo item e retorna o ID gerado
  async create({
    nome,
    descricao,
    categoriaId,
    localEncontrado,
    pontoColetaId,
    dataEncontrado,
    cadastradoPorUserId,
  }) {
    const [result] = await db.execute(
      `INSERT INTO itens
        (nome, descricao, categoria_id, local_encontrado, ponto_coleta_id,
         data_encontrado, data_disponibilizacao, cadastrado_por_user_id)
       VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
      [
        nome,
        descricao,
        categoriaId,
        localEncontrado,
        pontoColetaId,
        dataEncontrado,
        cadastradoPorUserId,
      ],
    );
    return result.insertId;
  },

  // Salva uma foto vinculada a um item
  async addFoto({ itemId, url, cloudinaryPublicId, isCapa, ordem }) {
    await db.execute(
      `INSERT INTO item_fotos (item_id, url, cloudinary_public_id, is_capa, ordem)
       VALUES (?, ?, ?, ?, ?)`,
      [itemId, url, cloudinaryPublicId, isCapa, ordem],
    );
  },

  // Descarta um item (soft delete): status -> descartado.
  // Se o item estava 'pendente', a reivindicação ativa é rejeitada na mesma
  // transação, para não ficar uma reivindicação pendente de item descartado.
  async descartar(id, funcionariaId, motivo) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [itens] = await conn.execute(
        `SELECT id, status, descricao FROM itens WHERE id = ? FOR UPDATE`,
        [id],
      );
      if (itens.length === 0) {
        throw { status: 404, mensagem: "Item não encontrado" };
      }
      if (!["disponivel", "pendente"].includes(itens[0].status)) {
        throw {
          status: 409,
          mensagem: "Item não pode ser descartado (já está em processo ou finalizado)",
        };
      }

      const [reivs] = await conn.execute(
        `SELECT id, nome_requerente, email_requerente
         FROM reivindicacoes
         WHERE item_id = ? AND status = 'pendente'
         FOR UPDATE`,
        [id],
      );

      if (reivs.length > 0) {
        await conn.execute(
          `UPDATE reivindicacoes
           SET status = 'rejeitada', processado_por_user_id = ?, processado_em = NOW(),
               motivo_rejeicao = ?
           WHERE item_id = ? AND status = 'pendente'`,
          [funcionariaId, `Item descartado: ${motivo}`, id],
        );
      }

      await conn.execute(
        `UPDATE itens
         SET status = 'descartado', motivo_descarte = ?,
             finalizado_por_user_id = ?, finalizado_em = NOW()
         WHERE id = ?`,
        [motivo, funcionariaId, id],
      );

      await conn.commit();
      return {
        descricaoItem: itens[0].descricao,
        reivindicacoesRejeitadas: reivs.map((r) => ({
          id: r.id,
          nomeRequerente: r.nome_requerente,
          emailRequerente: r.email_requerente,
        })),
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // Atualiza os dados de texto de um item
  async update(id, { nome, descricao, categoriaId, localEncontrado, pontoColetaId }) {
    const [result] = await db.execute(
      `UPDATE itens
       SET nome = ?, descricao = ?, categoria_id = ?, local_encontrado = ?, ponto_coleta_id = ?
       WHERE id = ? AND status IN ('disponivel', 'pendente')`,
      [nome, descricao, categoriaId, localEncontrado, pontoColetaId, id],
    );
    return result.affectedRows > 0;
  },

  // Lista itens finalizados (entregues ou descartados), com quem finalizou
  async findFinalizados(status) {
    const [rows] = await db.execute(
      `SELECT
         i.id, i.nome, i.descricao, i.local_encontrado, i.data_encontrado,
         i.status, i.finalizado_em, i.motivo_descarte,
         c.nome AS categoria,
         p.nome AS ponto_coleta,
         u.nome AS finalizado_por,
         (SELECT url FROM item_fotos WHERE item_id = i.id AND is_capa = TRUE LIMIT 1) AS foto_capa
       FROM itens i
       LEFT JOIN categorias c ON c.id = i.categoria_id
       LEFT JOIN pontos_coleta p ON p.id = i.ponto_coleta_id
       LEFT JOIN users u ON u.id = i.finalizado_por_user_id
       WHERE i.status = ?
       ORDER BY i.finalizado_em DESC`,
      [status],
    );
    return rows;
  },
};
