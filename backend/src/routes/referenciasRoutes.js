import { Router } from "express";
import { referenciasController } from "../controllers/referenciasController.js";

const router = Router();

router.get("/categorias", referenciasController.listarCategorias);
router.get("/pontos-coleta", referenciasController.listarPontosColeta);

export default router;
