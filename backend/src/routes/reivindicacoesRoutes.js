// =====================================================================
// Rotas de reivindicações.
// Criar é público (permite anônimo), mas aproveita o token se houver.
// =====================================================================
import { Router } from "express";
import { reivindicacoesController } from "../controllers/reivindicacoesController.js";
import { authOpcional } from "../middlewares/authOpcionalMiddleware.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { apenasFuncionaria } from "../middlewares/roleMiddleware.js";

const router = Router();

// POST /api/reivindicacoes — público, com auth opcional
router.post("/", authOpcional, reivindicacoesController.criar);
// GET /api/reivindicacoes/pendentes — só funcionária
router.get(
  "/pendentes",
  authMiddleware,
  apenasFuncionaria,
  reivindicacoesController.listarPendentes,
);

export default router;
