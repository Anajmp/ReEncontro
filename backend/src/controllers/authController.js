// =====================================================================
// authController — camada HTTP da autenticação.
// =====================================================================
import { authService } from "../services/authService.js";
import { googleAuthService } from "../services/googleAuthService.js";
import { completarCadastroService } from "../services/completarCadastroService.js";
import { loginSchema, registroSchema } from "../models/authSchema.js";

export const authController = {
  // POST /api/auth/login
  async login(req, res, next) {
    try {
      // Valida os dados de entrada com Zod
      const { email, senha } = loginSchema.parse(req.body);

      // Chama o service
      const resultado = await authService.login(email, senha);

      // Devolve o token e os dados do usuário
      res.json(resultado);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/register
  async registrar(req, res, next) {
    try {
      const dados = registroSchema.parse(req.body);
      const resultado = await authService.registrar(dados);
      res.status(201).json(resultado);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/google
  async loginGoogle(req, res, next) {
    try {
      const { credential } = req.body;
      if (!credential) {
        throw { status: 400, mensagem: "Credencial do Google não informada" };
      }
      const resultado = await googleAuthService.entrar(credential);
      res.json(resultado);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/completar-cadastro
  async completarCadastro(req, res, next) {
    try {
      const { aluno_nome, aluno_sala, aluno_periodo } = req.body;
      if (!aluno_nome || !aluno_sala || !aluno_periodo) {
        throw { status: 400, mensagem: "Informe os dados do aluno" };
      }
      const resultado = await completarCadastroService.completar(
        req.usuario.id,
        req.body,
      );
      res.json(resultado);
    } catch (err) {
      next(err);
    }
  },
};
