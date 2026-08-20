// =====================================================================
// Rotas de alunos — todas exigem usuário autenticado.
// Cada responsável só acessa os próprios alunos.
// =====================================================================
import { Router } from "express";
import { alunosController } from "../controllers/alunosController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// GET /api/alunos/meus
router.get("/meus", authMiddleware, alunosController.listarMeus);

// POST /api/alunos
router.post("/", authMiddleware, alunosController.criar);

// PATCH /api/alunos/:id
router.patch("/:id", authMiddleware, alunosController.atualizar);

export default router;
