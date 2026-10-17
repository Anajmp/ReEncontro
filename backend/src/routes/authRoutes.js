// =====================================================================
// Rotas de autenticação.
// =====================================================================
import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { passwordResetController } from "../controllers/passwordResetController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  limiteAuth,
  limiteRecuperacaoSenha,
} from "../middlewares/rateLimitMiddleware.js";

const router = Router();

// POST /api/auth/esqueci-senha — público
router.post("/esqueci-senha", passwordResetController.solicitar);
router.post(
  "/esqueci-senha",
  limiteRecuperacaoSenha,
  passwordResetController.solicitar,
);
// POST /api/auth/redefinir-senha — público (o token é a autenticação)
router.post(
  "/redefinir-senha",
  limiteRecuperacaoSenha,
  passwordResetController.redefinir,
);
// POST /api/auth/login
router.post("/login", limiteAuth, authController.login);
// POST /api/auth/register
router.post("/registrar", limiteAuth, authController.registrar);
// POST /api/auth/refresh — público (o refresh token é a autenticação)
router.post("/refresh", limiteAuth, authController.refresh);
// POST /api/auth/logout — público (o access token pode já ter vencido)
router.post("/logout", authController.logout);
// POST /api/auth/google — público
router.post("/google", authController.loginGoogle);
// POST /api/auth/completar-cadastro — precisa estar logado
router.post(
  "/completar-cadastro",
  authMiddleware,
  authController.completarCadastro,
);

export default router;
