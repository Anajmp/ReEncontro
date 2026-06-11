// =====================================================================
// itensRepository — ÚNICA camada que escreve SQL.
// Toda query usa db.execute() com placeholders (?) — nunca concatenação.
// Use este arquivo como molde para os outros repositories.
// =====================================================================
import { db } from '../config/database.js';

export const itensRepository = {
  // Lista itens disponíveis (área pública), com filtros opcionais
  async findDisponiveis({ categoriaId, dataInicio, dataFim } = {}) {
    let sql = `
      SELECT
        i.id, i.descricao, i.local_encontrado, i.data_encontrado, i.status,
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
      sql += ' AND i.categoria_id = ?';
      params.push(categoriaId);
    }
    if (dataInicio) {
      sql += ' AND i.data_encontrado >= ?';
      params.push(dataInicio);
    }
    if (dataFim) {
      sql += ' AND i.data_encontrado <= ?';
      params.push(dataFim);
    }
    sql += ' ORDER BY i.data_encontrado DESC';

    const [rows] = await db.execute(sql, params);
    return rows;
  },

  // Detalhe de um item por ID (com todas as fotos)
  async findById(id) {
    const [itens] = await db.execute(
      `SELECT i.*, c.nome AS categoria_nome, pc.nome AS ponto_coleta_nome
       FROM itens i
       INNER JOIN categorias c     ON c.id  = i.categoria_id
       INNER JOIN pontos_coleta pc ON pc.id = i.ponto_coleta_id
       WHERE i.id = ?`,
      [id]
    );
    if (itens.length === 0) return null;

    const [fotos] = await db.execute(
      'SELECT id, url, is_capa, ordem FROM item_fotos WHERE item_id = ? ORDER BY ordem',
      [id]
    );

    return { ...itens[0], fotos };
  },

  // Cria um novo item e retorna o ID gerado
  async create({ descricao, categoriaId, localEncontrado, pontoColetaId,
                 dataEncontrado, cadastradoPorUserId }) {
    const [result] = await db.execute(
      `INSERT INTO itens
        (descricao, categoria_id, local_encontrado, ponto_coleta_id,
         data_encontrado, data_disponibilizacao, cadastrado_por_user_id)
       VALUES (?, ?, ?, ?, ?, CURDATE(), ?)`,
      [descricao, categoriaId, localEncontrado, pontoColetaId,
       dataEncontrado, cadastradoPorUserId]
    );
    return result.insertId;
  },

  // Salva uma foto vinculada a um item
  async addFoto({ itemId, url, cloudinaryPublicId, isCapa, ordem }) {
    await db.execute(
      `INSERT INTO item_fotos (item_id, url, cloudinary_public_id, is_capa, ordem)
       VALUES (?, ?, ?, ?, ?)`,
      [itemId, url, cloudinaryPublicId, isCapa, ordem]
    );
  },
};
