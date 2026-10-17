// =====================================================================
// Validação Zod da confirmação de e-mail.
// =====================================================================
import { z } from "zod";

export const confirmarCodigoSchema = z.object({
  codigo: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "O código deve ter 6 dígitos numéricos"),
});
