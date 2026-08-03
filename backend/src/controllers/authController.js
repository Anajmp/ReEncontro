// =====================================================================
// authController — camada HTTP da autenticação.
// =====================================================================
import { authService } from "../services/authService.js";
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
};
