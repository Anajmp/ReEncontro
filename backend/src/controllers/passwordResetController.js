// =====================================================================
// passwordResetController — endpoints de redefinição de senha.
// =====================================================================
import { passwordResetService } from "../services/passwordResetService.js";
import {
  solicitarResetSchema,
  redefinirSenhaSchema,
} from "../models/passwordResetSchema.js";

export const passwordResetController = {
  // POST /api/auth/esqueci-senha
  async solicitar(req, res, next) {
    try {
      const { email } = solicitarResetSchema.parse(req.body);
      const resultado = await passwordResetService.solicitar(email);
      res.json(resultado);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/redefinir-senha
  async redefinir(req, res, next) {
    try {
      const { token, novaSenha } = redefinirSenhaSchema.parse(req.body);
      const resultado = await passwordResetService.redefinir(token, novaSenha);
      res.json(resultado);
    } catch (err) {
      next(err);
    }
  },
};
