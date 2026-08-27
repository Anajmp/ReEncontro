import { z } from "zod";

export const solicitarResetSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const redefinirSenhaSchema = z.object({
  token: z.string().min(10, "Token inválido"),
  novaSenha: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});
