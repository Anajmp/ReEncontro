import { Router } from "express";
import { lgpdController } from "../controllers/lgpdController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { apenasDiretora } from "../middlewares/roleMiddleware.js";

const router = Router();

// LGPD (busca e anonimização de dados pessoais) — exclusivo da diretora
router.get("/buscar", authMiddleware, apenasDiretora, lgpdController.buscar);
router.post(
  "/anonimizar",
  authMiddleware,
  apenasDiretora,
  lgpdController.anonimizar,
);

export default router;
