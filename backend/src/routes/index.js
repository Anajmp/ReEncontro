// =====================================================================
// Agrega todas as rotas da API.
// Conforme cada módulo ficar pronto, importe e registre aqui.
// =====================================================================
import { Router } from 'express';
import itensRoutes from './itensRoutes.js';
import setupRoute from './setupRoute.js';
// import authRoutes from './authRoutes.js';
// import reivindicacoesRoutes from './reivindicacoesRoutes.js';
// import usuariosRoutes from './usuariosRoutes.js';
// import relatoriosRoutes from './relatoriosRoutes.js';

const router = Router();

router.use('/itens', itensRoutes);
router.use('/', setupRoute);
// router.use('/auth', authRoutes);
// router.use('/reivindicacoes', reivindicacoesRoutes);
// router.use('/usuarios', usuariosRoutes);
// router.use('/relatorios', relatoriosRoutes);

export default router;
