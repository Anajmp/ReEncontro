// =====================================================================
// reivindicacoesController — camada HTTP das reivindicações.
// =====================================================================
import { reivindicacoesService } from "../services/reivindicacoesService.js";
import { criarReivindicacaoSchema } from "../models/reivindicacaoSchema.js";

export const reivindicacoesController = {
  // POST /api/reivindicacoes
  async criar(req, res, next) {
    try {
      const dados = criarReivindicacaoSchema.parse(req.body);
      // req.usuario existe se a pessoa estiver logada; senão é undefined (anônimo)
      const resultado = await reivindicacoesService.criar(dados, req.usuario);
      res.status(201).json(resultado);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/reivindicacoes/pendentes
  async listarPendentes(req, res, next) {
    try {
      const pendentes = await reivindicacoesService.listarPendentes();
      res.json(pendentes);
    } catch (err) {
      next(err);
    }
  },
};
