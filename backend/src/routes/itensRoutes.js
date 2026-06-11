// =====================================================================
// Rotas de itens
// Públicas: listar e detalhar.
// Restritas (funcionária): criar (com upload de fotos).
// =====================================================================
import { Router } from 'express';
import { itensController } from '../controllers/itensController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { apenasFuncionaria } from '../middlewares/roleMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = Router();

// Públicas
router.get('/', itensController.listar);
router.get('/:id', itensController.detalhar);

// Restrita: só funcionária autenticada, com upload de até 5 fotos
router.post(
  '/',
  authMiddleware,
  apenasFuncionaria,
  upload.array('fotos', 5),
  itensController.criar
);

export default router;
