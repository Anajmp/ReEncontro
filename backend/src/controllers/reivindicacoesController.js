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

  // PATCH /api/reivindicacoes/:id/aprovar
  async aprovar(req, res, next) {
    try {
      const resultado = await reivindicacoesService.aprovar(
        Number(req.params.id),
        req.usuario.id,
      );
      res.json({ mensagem: "Reivindicação aprovada", ...resultado });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/reivindicacoes/:id/rejeitar
  async rejeitar(req, res, next) {
    try {
      const { motivo_rejeicao } = req.body;
      const resultado = await reivindicacoesService.rejeitar(
        Number(req.params.id),
        req.usuario.id,
        motivo_rejeicao,
      );
      res.json({ mensagem: "Reivindicação rejeitada", ...resultado });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/reivindicacoes/:id/entregar
  async confirmarEntrega(req, res, next) {
    try {
      const resultado = await reivindicacoesService.confirmarEntrega(
        Number(req.params.id),
        req.usuario.id,
      );
      res.json({ mensagem: "Entrega confirmada", ...resultado });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/reivindicacoes/:id/cancelar
  async cancelar(req, res, next) {
    try {
      const { motivo } = req.body;
      const resultado = await reivindicacoesService.cancelar(
        Number(req.params.id),
        req.usuario.id,
        motivo,
      );
      res.json({ mensagem: "Reivindicação cancelada", ...resultado });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/reivindicacoes/reverter/:itemId
  async reverterEntrega(req, res, next) {
    try {
      const resultado = await reivindicacoesService.reverterEntrega(
        Number(req.params.itemId),
        req.usuario.id,
      );
      res.json({ mensagem: "Entrega revertida", ...resultado });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/reivindicacoes/em-processo
  async listarEmProcesso(req, res, next) {
    try {
      const lista = await reivindicacoesService.listarEmProcesso();
      res.json(lista);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/reivindicacoes/minhas
  async listarMinhas(req, res, next) {
    try {
      // req.usuario.id vem do TOKEN (seguro, não dá pra forjar)
      const lista = await reivindicacoesService.listarMinhas(req.usuario.id);
      res.json(lista);
    } catch (err) {
      next(err);
    }
  },
};
