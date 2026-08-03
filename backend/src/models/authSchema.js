// =====================================================================
// Validação Zod dos dados de autenticação.
// =====================================================================
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

// Schema de cada aluno
const alunoSchema = z.object({
  nome: z.string().min(2, "Nome do aluno muito curto").max(120),
  sala: z.string().min(1).max(20),
  periodo: z.enum(["integral", "manha", "tarde"]),
  ano_letivo: z.coerce.number().int().min(2020).max(2100),
});

// Schema do registro de responsável
export const registroSchema = z.object({
  nome: z.string().min(2, "Nome muito curto").max(120),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
  telefone: z.string().max(20).optional(),
  alunos: z.array(alunoSchema).min(1, "Cadastre ao menos um aluno"),
});
