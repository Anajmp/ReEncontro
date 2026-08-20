import { z } from "zod";

export const alunoSchema = z.object({
  nome: z.string().min(2, "Nome muito curto").max(120),
  sala: z.string().min(1, "Informe a sala").max(20),
  periodo: z.enum(["integral", "manha", "tarde"]),
  ano_letivo: z.coerce.number().int().min(2020).max(2100),
});
