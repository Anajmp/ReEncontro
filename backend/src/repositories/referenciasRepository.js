// =====================================================================
// referenciasRepository — dados de referência (categorias e pontos de coleta).
// São listas usadas para preencher selects no frontend.
// =====================================================================
import { db } from "../config/database.js";

export const referenciasRepository = {
  async listarCategorias() {
    const [rows] = await db.execute(
      `SELECT id, nome FROM categorias WHERE ativo = 1 ORDER BY nome ASC`,
    );
    return rows;
  },

  async listarPontosColeta() {
    const [rows] = await db.execute(
      `SELECT id, nome FROM pontos_coleta WHERE ativo = 1 ORDER BY nome ASC`,
    );
    return rows;
  },
};
