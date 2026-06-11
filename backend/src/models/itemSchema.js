// =====================================================================
// Validação dos dados de Item (Zod)
// O controller usa estes schemas para validar a entrada antes de
// passar pro service.
// =====================================================================
import { z } from 'zod';

// Schema para criar um item
export const criarItemSchema = z.object({
  descricao: z.string().min(3, 'Descrição muito curta').max(2000),
  categoriaId: z.coerce.number().int().positive('Categoria inválida'),
  localEncontrado: z.string().min(2).max(120),
  pontoColetaId: z.coerce.number().int().positive('Ponto de coleta inválido'),
  dataEncontrado: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use AAAA-MM-DD)'),
});

// Schema para filtros da listagem (query params)
export const listarItensSchema = z.object({
  categoriaId: z.coerce.number().int().positive().optional(),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
