import { Router } from "express";
import { relatoriosController } from "../controllers/relatoriosController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { apenasDiretora, apenasFuncionaria } from "../middlewares/roleMiddleware.js";

const router = Router();

// Relatórios completos são exclusivos da diretora; o resumo do dashboard vale para todas
router.get("/", authMiddleware, apenasDiretora, relatoriosController.gerar);
router.get("/dashboard", authMiddleware, apenasFuncionaria, relatoriosController.dashboard);

export default router;
