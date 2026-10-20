// =====================================================================
// Rotas de autenticação.
// =====================================================================
import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { passwordResetController } from "../controllers/passwordResetController.js";
import { emailVerificacaoController } from "../controllers/emailVerificacaoController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  limiteAuth,
  limiteAuthPorIp,
  limiteRecuperacaoSenha,
  limiteRecuperacaoSenhaPorIp,
  limiteRedefinicaoSenha,
  limiteVerificacaoEmail,
} from "../middlewares/rateLimitMiddleware.js";

const router = Router();

// POST /api/auth/esqueci-senha — público
router.post(
  "/esqueci-senha",
  limiteRecuperacaoSenhaPorIp,
  limiteRecuperacaoSenha,
  passwordResetController.solicitar,
);
// POST /api/auth/redefinir-senha — público (o token é a autenticação)
router.post(
  "/redefinir-senha",
  limiteRedefinicaoSenha,
  passwordResetController.redefinir,
);
// POST /api/auth/login
router.post("/login", limiteAuthPorIp, limiteAuth, authController.login);
// POST /api/auth/register
router.post("/registrar", limiteAuthPorIp, limiteAuth, authController.registrar);
// POST /api/auth/google — público
router.post("/google", authController.loginGoogle);
// POST /api/auth/completar-cadastro — precisa estar logado
router.post(
  "/completar-cadastro",
  authMiddleware,
  authController.completarCadastro,
);
// POST /api/auth/enviar-codigo-verificacao — logado, verifica o próprio e-mail
router.post(
  "/enviar-codigo-verificacao",
  authMiddleware,
  limiteVerificacaoEmail,
  emailVerificacaoController.enviar,
);
// POST /api/auth/confirmar-codigo-verificacao — logado
router.post(
  "/confirmar-codigo-verificacao",
  authMiddleware,
  emailVerificacaoController.confirmar,
);

export default router;
