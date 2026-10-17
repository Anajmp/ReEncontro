// =====================================================================
// emailVerificacaoController — endpoints de verificação de e-mail.
// O usuário sempre verifica o próprio e-mail (id vem do token).
// =====================================================================
import { emailVerificacaoService } from "../services/emailVerificacaoService.js";
import { confirmarCodigoSchema } from "../models/emailVerificacaoSchema.js";

export const emailVerificacaoController = {
  // POST /api/auth/enviar-codigo-verificacao
  async enviar(req, res, next) {
    try {
      const resultado = await emailVerificacaoService.enviarCodigo(req.usuario.id);
      res.json(resultado);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/confirmar-codigo-verificacao
  async confirmar(req, res, next) {
    try {
      const { codigo } = confirmarCodigoSchema.parse(req.body);
      const resultado = await emailVerificacaoService.confirmarCodigo(
        req.usuario.id,
        codigo,
      );
      res.json(resultado);
    } catch (err) {
      next(err);
    }
  },
};
