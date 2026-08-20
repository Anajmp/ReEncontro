// =====================================================================
// usuariosController — gestão de funcionárias (exclusivo da diretora).
// =====================================================================
import { usuariosService } from "../services/usuariosService.js";
import {
  criarFuncionariaSchema,
  editarFuncionariaSchema,
} from "../models/usuarioSchema.js";

export const usuariosController = {
  // GET /api/usuarios/funcionarias
  async listar(req, res, next) {
    try {
      res.json(await usuariosService.listarFuncionarias());
    } catch (err) {
      next(err);
    }
  },

  // POST /api/usuarios/funcionarias
  async criar(req, res, next) {
    try {
      const dados = criarFuncionariaSchema.parse(req.body);
      const resultado = await usuariosService.criarFuncionaria(dados);
      res
        .status(201)
        .json({ mensagem: "Funcionária cadastrada", ...resultado });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/usuarios/funcionarias/:id
  async atualizar(req, res, next) {
    try {
      const dados = editarFuncionariaSchema.parse(req.body);
      const resultado = await usuariosService.atualizarFuncionaria(
        Number(req.params.id),
        dados,
      );
      res.json({ mensagem: "Funcionária atualizada", ...resultado });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/usuarios/funcionarias/:id/status
  async alterarStatus(req, res, next) {
    try {
      const { ativo } = req.body;
      const resultado = await usuariosService.alterarStatus(
        Number(req.params.id),
        Boolean(ativo),
        req.usuario.id, // quem está fazendo (pra proteção de auto-desativação)
      );
      res.json({
        mensagem: ativo ? "Conta ativada" : "Conta desativada",
        ...resultado,
      });
    } catch (err) {
      next(err);
    }
  },
};
