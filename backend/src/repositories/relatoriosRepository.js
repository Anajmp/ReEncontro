// =====================================================================
// relatoriosRepository — consultas agregadas para os relatórios.
// =====================================================================
import { db } from "../config/database.js";

export const relatoriosRepository = {
  // Números gerais do período (cadastrados, entregues, descartados)
  async resumo(dias) {
    const [rows] = await db.execute(
      `SELECT
         COUNT(*) AS total_cadastrados,
         SUM(CASE WHEN status = 'entregue'   THEN 1 ELSE 0 END) AS total_entregues,
         SUM(CASE WHEN status = 'descartado' THEN 1 ELSE 0 END) AS total_descartados
       FROM itens
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [dias],
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

  // Evolução mês a mês: encontrados, devolvidos e descartados
  async porMes(dias) {
    const [rows] = await db.execute(
      `SELECT
         DATE_FORMAT(created_at, '%Y-%m') AS mes,
         COUNT(*) AS encontrados,
         SUM(CASE WHEN status = 'entregue'   THEN 1 ELSE 0 END) AS devolvidos,
         SUM(CASE WHEN status = 'descartado' THEN 1 ELSE 0 END) AS descartados
       FROM itens
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY mes ASC`,
      [dias],
    );
    return rows;
  },
};
