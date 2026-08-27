import { Router } from "express";
import { lgpdController } from "../controllers/lgpdController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { apenasFuncionaria } from "../middlewares/roleMiddleware.js";

const router = Router();

router.get("/buscar", authMiddleware, apenasFuncionaria, lgpdController.buscar);
router.post(
  "/anonimizar",
  authMiddleware,
  apenasFuncionaria,
  lgpdController.anonimizar,
);

export default router;
