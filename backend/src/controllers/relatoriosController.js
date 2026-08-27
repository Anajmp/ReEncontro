import { relatoriosService } from "../services/relatoriosService.js";

export const relatoriosController = {
  // GET /api/relatorios?dias=30
  async gerar(req, res, next) {
    try {
      const dados = await relatoriosService.gerar(req.query.dias);
      res.json(dados);
    } catch (err) {
      next(err);
    }
  },
};
