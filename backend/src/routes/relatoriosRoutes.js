import { Router } from "express";
import { relatoriosController } from "../controllers/relatoriosController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { apenasFuncionaria } from "../middlewares/roleMiddleware.js";

const router = Router();

router.get("/", authMiddleware, apenasFuncionaria, relatoriosController.gerar);

export default router;
