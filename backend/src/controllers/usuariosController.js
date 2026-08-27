// =====================================================================
// usuariosController — gestão de funcionárias (exclusivo da diretora).
// =====================================================================
import { usuariosService } from "../services/usuariosService.js";
import {
  criarFuncionariaSchema,
  editarFuncionariaSchema,
} from "../models/usuarioSchema.js";
import { usuariosRepository } from "../repositories/usuariosRepository.js";

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

  // PATCH /api/usuarios/avatar
  async atualizarAvatar(req, res, next) {
    try {
      const { avatar_seed } = req.body;
      if (
        !avatar_seed ||
        typeof avatar_seed !== "string" ||
        avatar_seed.length > 60
      ) {
        throw { status: 400, mensagem: "Avatar inválido" };
      }
      // req.usuario.id vem do token — cada um só altera o próprio avatar
      await usuariosRepository.atualizarAvatar(req.usuario.id, avatar_seed);
      res.json({ mensagem: "Avatar atualizado", avatar_seed });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/usuarios/senha
  async alterarSenha(req, res, next) {
    try {
      const { senhaAtual, novaSenha } = req.body;
      if (!senhaAtual || !novaSenha) {
        throw { status: 400, mensagem: "Informe a senha atual e a nova senha" };
      }
      // req.usuario.id vem do token — cada um só altera a própria senha
      const resultado = await usuariosService.alterarSenha(
        req.usuario.id,
        senhaAtual,
        novaSenha,
      );
      res.json(resultado);
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/usuarios/perfil
  async atualizarPerfil(req, res, next) {
    try {
      const { nome, email, telefone } = req.body;
      if (!nome || !email) {
        throw { status: 400, mensagem: "Nome e e-mail são obrigatórios" };
      }
      const resultado = await usuariosService.atualizarPerfil(req.usuario.id, {
        nome,
        email,
        telefone,
      });
      res.json(resultado);
    } catch (err) {
      next(err);
    }
  },
};
