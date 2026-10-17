import { z } from "zod";
import { telefoneOpcional } from "../utils/telefone.js";

// Edição do próprio perfil (PATCH /api/usuarios/perfil)
export const perfilSchema = z.object({
  nome: z.string().trim().min(2, "Nome muito curto").max(120),
  email: z.string().trim().email("E-mail inválido"),
  telefone: telefoneOpcional,
});

export const criarFuncionariaSchema = z.object({
  nome: z.string().min(2, "Nome muito curto").max(120),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
  telefone: z.string().max(20).optional(),
  is_diretora: z.boolean().optional(),
});

export const editarFuncionariaSchema = z.object({
  nome: z.string().min(2).max(120),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().max(20).optional(),
  is_diretora: z.boolean().optional(),
});
