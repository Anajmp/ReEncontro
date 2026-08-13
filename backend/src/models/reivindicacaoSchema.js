// =====================================================================
// Validação Zod da reivindicação.
// =====================================================================
import { z } from "zod";

export const criarReivindicacaoSchema = z.object({
  item_id: z.coerce.number().int().positive("Item inválido"),
  aluno_id: z.coerce.number().int().positive().optional(),
  nome_requerente: z.string().min(2, "Nome muito curto").max(120),
  email_requerente: z.string().email("E-mail inválido"),
  telefone_requerente: z.string().max(20).optional(),
  nome_aluno: z.string().min(2, "Nome do aluno muito curto").max(120),
  sala_aluno: z.string().min(1).max(20),
  periodo_aluno: z.enum(["integral", "manha", "tarde"]),
});
