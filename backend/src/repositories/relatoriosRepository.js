// =====================================================================
// relatoriosRepository — consultas agregadas para os relatórios e o dashboard.
// Toda query usa db.execute() com placeholders (?) — nunca concatenação.
// =====================================================================
import { db } from "../config/database.js";

export const relatoriosRepository = {
  // ===================== RELATÓRIOS =====================

  // Números gerais do período: itens cadastrados no período e itens
  // finalizados (entregues/descartados) no período.
  async resumo(dias) {
    const [rows] = await db.execute(
      `SELECT
         (SELECT COUNT(*) FROM itens
           WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)) AS total_cadastrados,
         (SELECT COUNT(*) FROM itens
           WHERE status = 'entregue'
             AND finalizado_em >= DATE_SUB(NOW(), INTERVAL ? DAY)) AS total_entregues,
         (SELECT COUNT(*) FROM itens
           WHERE status = 'descartado'
             AND finalizado_em >= DATE_SUB(NOW(), INTERVAL ? DAY)) AS total_descartados`,
      [dias, dias, dias],
    );
    return rows[0];
  },

  // Distribuição atual por status (todos os itens, não só do período)
  async porStatus() {
    const [rows] = await db.execute(
      `SELECT status, COUNT(*) AS total
       FROM itens
       GROUP BY status`,
    );
    return rows;
  },

  // Itens cadastrados por mês, a partir de N dias atrás
  async encontradosPorMes(dias) {
    const [rows] = await db.execute(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS mes, COUNT(*) AS total
       FROM itens
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY mes`,
      [dias],
    );
    return rows;
  },

  // Itens finalizados (entregues e descartados) por mês, pela data de finalização
  async finalizadosPorMes(dias) {
    const [rows] = await db.execute(
      `SELECT
         DATE_FORMAT(finalizado_em, '%Y-%m') AS mes,
         SUM(CASE WHEN status = 'entregue'   THEN 1 ELSE 0 END) AS entregues,
         SUM(CASE WHEN status = 'descartado' THEN 1 ELSE 0 END) AS descartados
       FROM itens
       WHERE finalizado_em IS NOT NULL
         AND finalizado_em >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY mes`,
      [dias],
    );
    return rows;
  },

  // Itens cadastrados no período, agrupados por categoria
  async porCategoriaNoPeriodo(dias) {
    const [rows] = await db.execute(
      `SELECT c.nome AS categoria, COUNT(*) AS total
       FROM itens i
       INNER JOIN categorias c ON c.id = i.categoria_id
       WHERE i.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY c.nome
       ORDER BY total DESC`,
      [dias],
    );
    return rows;
  },

  // ===================== DASHBOARD =====================

  // Contadores dos cards do dashboard
  async contadoresDashboard() {
    const [rows] = await db.execute(
      `SELECT
         (SELECT COUNT(*) FROM itens WHERE status = 'disponivel') AS itens_disponiveis,
         (SELECT COUNT(*) FROM itens
           WHERE status = 'disponivel'
             AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY))   AS disponiveis_semana,
         (SELECT COUNT(*) FROM reivindicacoes WHERE status = 'pendente') AS pendentes,
         (SELECT COUNT(*) FROM reivindicacoes
           WHERE status = 'pendente' AND DATE(created_at) = CURDATE()) AS pendentes_hoje,
         (SELECT COUNT(*) FROM reivindicacoes WHERE status = 'aprovada') AS em_processo,
         (SELECT COUNT(*) FROM reivindicacoes
           WHERE status = 'aprovada'
             AND data_aprovacao <= DATE_SUB(NOW(), INTERVAL 5 DAY)) AS em_processo_prazo,
         (SELECT COUNT(*) FROM itens
           WHERE status = 'entregue'
             AND finalizado_em >= DATE_FORMAT(CURDATE(), '%Y-%m-01')) AS entregues_mes,
         (SELECT COUNT(*) FROM itens
           WHERE status = 'entregue'
             AND finalizado_em >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01')
             AND finalizado_em <  DATE_FORMAT(CURDATE(), '%Y-%m-01')) AS entregues_mes_anterior`,
    );
    return rows[0];
  },

  // Itens ainda no fluxo (não entregues nem descartados), por categoria
  async categoriasAtuais() {
    const [rows] = await db.execute(
      `SELECT c.nome AS categoria, COUNT(*) AS total
       FROM itens i
       INNER JOIN categorias c ON c.id = i.categoria_id
       WHERE i.status IN ('disponivel', 'pendente', 'em_processo')
       GROUP BY c.nome
       ORDER BY total DESC`,
    );
    return rows;
  },

  // Últimas reivindicações em aberto (pendentes ou aprovadas)
  async reivindicacoesRecentes(limite) {
    const [rows] = await db.execute(
      `SELECT
         r.id, r.status, r.created_at,
         r.nome_requerente, r.nome_aluno, r.sala_aluno,
         COALESCE(i.nome, i.descricao) AS item_nome,
         (SELECT url FROM item_fotos
          WHERE item_id = i.id AND is_capa = TRUE LIMIT 1) AS item_foto
       FROM reivindicacoes r
       INNER JOIN itens i ON i.id = r.item_id
       WHERE r.status IN ('pendente', 'aprovada')
       ORDER BY r.created_at DESC
       LIMIT ${Number(limite)}`,
    );
    return rows;
  },
};
