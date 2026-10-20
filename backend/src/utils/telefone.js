// =====================================================================
// Validação e normalização de telefone brasileiro (RN-008: opcional).
// Usado pelos schemas Zod de cadastro, edição de perfil e reivindicação.
// =====================================================================
import { z } from "zod";

// DDDs oficiais em uso no Brasil (Anatel). Lista explícita de propósito:
// não basta ser um número de 2 dígitos (ex.: 20, 23, 25, 26, 29, 30... não existem).
export const DDDS_VALIDOS = new Set([
  // SP
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  // RJ e ES
  21, 22, 24, 27, 28,
  // MG
  31, 32, 33, 34, 35, 37, 38,
  // PR e SC
  41, 42, 43, 44, 45, 46, 47, 48, 49,
  // RS
  51, 53, 54, 55,
  // Centro-Oeste, TO, RO e AC
  61, 62, 63, 64, 65, 66, 67, 68, 69,
  // BA e SE
  71, 73, 74, 75, 77, 79,
  // Nordeste (PE, AL, PB, RN, CE, PI)
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  // Norte e MA
  91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

/** Remove a máscara: parênteses, hífen, ponto e espaços. */
export function normalizarTelefone(valor) {
  return String(valor ?? "").replace(/[\s().-]/g, "");
}

/**
 * Valida um telefone já com ou sem máscara.
 * @returns {{ valido: true } | { valido: false, mensagem: string }}
 */
export function validarTelefone(valor) {
  const digitos = normalizarTelefone(valor);

  if (!/^\d+$/.test(digitos)) {
    return { valido: false, mensagem: "Telefone deve conter apenas números" };
  }
  if (digitos.length !== 10 && digitos.length !== 11) {
    return {
      valido: false,
      mensagem: "Telefone deve ter DDD + número (10 ou 11 dígitos)",
    };
  }
  if (!DDDS_VALIDOS.has(Number(digitos.slice(0, 2)))) {
    return { valido: false, mensagem: "DDD inválido" };
  }
  if (digitos.length === 11 && digitos[2] !== "9") {
    return { valido: false, mensagem: "Celular deve começar com 9 após o DDD" };
  }
  if (/^(\d)\1+$/.test(digitos)) {
    return { valido: false, mensagem: "Telefone inválido" };
  }
  return { valido: true };
}

/**
 * Campo Zod de telefone opcional: vazio/ausente passa (vira undefined);
 * com valor, valida e devolve apenas os dígitos para gravar no banco.
 */
export const telefoneOpcional = z
  .string()
  .max(20, "Telefone muito longo")
  .nullish()
  .transform((v) => (v && v.trim() !== "" ? v : undefined))
  .superRefine((v, ctx) => {
    if (v === undefined) return;
    const resultado = validarTelefone(v);
    if (!resultado.valido) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: resultado.mensagem });
    }
  })
  .transform((v) => (v === undefined ? undefined : normalizarTelefone(v)));
