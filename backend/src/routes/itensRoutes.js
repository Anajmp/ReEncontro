// =====================================================================
// Rotas de itens
// Públicas: listar e detalhar.
// Restritas (funcionária): criar (com upload de fotos).
// =====================================================================
import { Router } from "express";
import { itensController } from "../controllers/itensController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authOpcional } from "../middlewares/authOpcionalMiddleware.js";
import { apenasFuncionaria } from "../middlewares/roleMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = Router();

// Públicas
router.get("/", itensController.listar);
// GET /api/itens/finalizados — só funcionária
router.get(
  "/finalizados",
  authMiddleware,
  apenasFuncionaria,
  itensController.listarFinalizados,
);
// Público; com token de funcionária devolve também os campos internos
router.get("/:id", authOpcional, itensController.detalhar);
// PATCH /api/itens/:id/descartar — só funcionária
router.patch(
  "/:id/descartar",
  authMiddleware,
  apenasFuncionaria,
  itensController.descartar,
);
// Restrita: só funcionária autenticada, com upload de até 5 fotos
router.post(
  "/",
  authMiddleware,
  apenasFuncionaria,
  upload.array("fotos", 5),
  itensController.criar,
);

// PATCH /api/itens/:id — editar (só funcionária)
router.patch("/:id", authMiddleware, apenasFuncionaria, itensController.editar);

export default router;
