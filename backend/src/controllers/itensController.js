// =====================================================================
// itensController — camada HTTP.
// Lê a requisição, valida com o schema, chama o service e devolve a
// resposta. Erros são repassados ao errorMiddleware via next(err).
// =====================================================================
import { itensService } from '../services/itensService.js';
import { criarItemSchema, listarItensSchema } from '../models/itemSchema.js';

export const itensController = {
  // GET /api/itens
  async listar(req, res, next) {
    try {
      const filtros = listarItensSchema.parse(req.query);
      const itens = await itensService.listarDisponiveis(filtros);
      res.json(itens);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/itens/:id
  async detalhar(req, res, next) {
    try {
      const item = await itensService.buscarPorId(Number(req.params.id));
      res.json(item);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/itens  (requer autenticação + perfil funcionária + upload de fotos)
  async criar(req, res, next) {
    try {
      const dados = criarItemSchema.parse(req.body);
      const item = await itensService.criar(dados, req.files, req.usuario.id);
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  },
};
