// =====================================================================
// Rotas de gestão de funcionárias — EXCLUSIVO da diretora (RF-017).
// =====================================================================
import { Router } from "express";
import { usuariosController } from "../controllers/usuariosController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { apenasDiretora } from "../middlewares/roleMiddleware.js";

const router = Router();

router.get(
  "/funcionarias",
  authMiddleware,
  apenasDiretora,
  usuariosController.listar,
);
router.post(
  "/funcionarias",
  authMiddleware,
  apenasDiretora,
  usuariosController.criar,
);
router.patch(
  "/funcionarias/:id",
  authMiddleware,
  apenasDiretora,
  usuariosController.atualizar,
);
router.patch(
  "/funcionarias/:id/status",
  authMiddleware,
  apenasDiretora,
  usuariosController.alterarStatus,
);

export default router;
