// =====================================================================
// Rotas de autenticação.
// =====================================================================
import { Router } from "express";
import { authController } from "../controllers/authController.js";

const router = Router();

// POST /api/auth/login
router.post("/login", authController.login);
// POST /api/auth/register
router.post("/register", authController.registrar);

export default router;
