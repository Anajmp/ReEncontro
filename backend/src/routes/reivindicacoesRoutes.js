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

// PATCH /api/reivindicacoes/:id/aprovar — só funcionária
router.patch(
  "/:id/aprovar",
  authMiddleware,
  apenasFuncionaria,
  reivindicacoesController.aprovar,
);

// PATCH /api/reivindicacoes/:id/rejeitar — só funcionária
router.patch(
  "/:id/rejeitar",
  authMiddleware,
  apenasFuncionaria,
  reivindicacoesController.rejeitar,
);

// PATCH /api/reivindicacoes/:id/entregar — só funcionária
router.patch(
  "/:id/entregar",
  authMiddleware,
  apenasFuncionaria,
  reivindicacoesController.confirmarEntrega,
);

// PATCH /api/reivindicacoes/:id/cancelar — só funcionária
router.patch(
  "/:id/cancelar",
  authMiddleware,
  apenasFuncionaria,
  reivindicacoesController.cancelar,
);

// PATCH /api/reivindicacoes/reverter/:itemId — só funcionária
router.patch(
  "/reverter/:itemId",
  authMiddleware,
  apenasFuncionaria,
  reivindicacoesController.reverterEntrega,
);

// GET /api/reivindicacoes/em-processo — só funcionária
router.get(
  "/em-processo",
  authMiddleware,
  apenasFuncionaria,
  reivindicacoesController.listarEmProcesso,
);

// GET /api/reivindicacoes/minhas — qualquer usuário logado vê as próprias
router.get("/minhas", authMiddleware, reivindicacoesController.listarMinhas);
export default router;
