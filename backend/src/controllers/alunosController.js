// =====================================================================
// alunosController — camada HTTP dos alunos.
// =====================================================================
import { alunosService } from "../services/alunosService.js";
import { alunoSchema } from "../models/alunoSchema.js";

export const alunosController = {
  // GET /api/alunos/meus
  async listarMeus(req, res, next) {
    try {
      // req.usuario.id vem do TOKEN (seguro)
      const alunos = await alunosService.listarMeus(req.usuario.id);
      res.json(alunos);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/alunos
  async criar(req, res, next) {
    try {
      const dados = alunoSchema.parse(req.body);
      const resultado = await alunosService.criar(req.usuario.id, dados);
      res.status(201).json({ mensagem: "Aluno cadastrado", ...resultado });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/alunos/:id
  async atualizar(req, res, next) {
    try {
      const dados = alunoSchema.parse(req.body);
      const resultado = await alunosService.atualizar(
        Number(req.params.id),
        req.usuario.id,
        dados,
      );
      res.json({ mensagem: "Aluno atualizado", ...resultado });
    } catch (err) {
      next(err);
    }
  },
};
