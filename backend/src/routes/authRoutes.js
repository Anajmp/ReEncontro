// =====================================================================
// Rotas de autenticação.
// =====================================================================
import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { passwordResetController } from "../controllers/passwordResetController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// POST /api/auth/esqueci-senha — público
router.post("/esqueci-senha", passwordResetController.solicitar);
// POST /api/auth/redefinir-senha — público (o token é a autenticação)
router.post("/redefinir-senha", passwordResetController.redefinir);
// POST /api/auth/login
router.post("/login", authController.login);
// POST /api/auth/register
router.post("/register", authController.registrar);
// POST /api/auth/google — público
router.post("/google", authController.loginGoogle);
// POST /api/auth/completar-cadastro — precisa estar logado
router.post(
  "/completar-cadastro",
  authMiddleware,
  authController.completarCadastro,
);

export default router;
