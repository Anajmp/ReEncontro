import { referenciasRepository } from "../repositories/referenciasRepository.js";

export const referenciasController = {
  // GET /api/categorias
  async listarCategorias(req, res, next) {
    try {
      res.json(await referenciasRepository.listarCategorias());
    } catch (err) {
      next(err);
    }
  },

  // GET /api/pontos-coleta
  async listarPontosColeta(req, res, next) {
    try {
      res.json(await referenciasRepository.listarPontosColeta());
    } catch (err) {
      next(err);
    }
  },
};
