// =====================================================================
// Agrega todas as rotas da API.
// Conforme cada módulo ficar pronto, importe e registre aqui.
// =====================================================================
import { Router } from "express";
import itensRoutes from "./itensRoutes.js";
import authRoutes from "./authRoutes.js";
// import reivindicacoesRoutes from './reivindicacoesRoutes.js';
// import usuariosRoutes from './usuariosRoutes.js';
// import relatoriosRoutes from './relatoriosRoutes.js';

import setupRoute from "./setupRoute.js";

const router = Router();

router.use("/itens", itensRoutes);
router.use("/auth", authRoutes);
router.use("/", setupRoute);
// router.use('/reivindicacoes', reivindicacoesRoutes);
// router.use('/usuarios', usuariosRoutes);
// router.use('/relatorios', relatoriosRoutes);

export default router;
