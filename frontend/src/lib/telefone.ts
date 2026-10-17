// =====================================================================
// Máscara e validação de telefone — mesmas regras de
// backend/src/utils/telefone.js (o backend continua sendo quem decide).
// =====================================================================

const DDDS_VALIDOS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24, 27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55,
  61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79,
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

/** Aplica a máscara enquanto a pessoa digita: (19) 99876-5432 ou (19) 3456-7890. */
export function mascararTelefone(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Devolve a mensagem de erro, ou null se estiver ok. Vazio é válido (campo opcional). */
export function validarTelefone(valor: string | null | undefined): string | null {
  const bruto = (valor ?? '').trim();
  if (bruto === '') return null;

  const d = bruto.replace(/[\s().-]/g, '');
  if (!/^\d+$/.test(d)) return 'Telefone deve conter apenas números';
  if (d.length !== 10 && d.length !== 11) return 'Telefone deve ter DDD + número (10 ou 11 dígitos)';
  if (!DDDS_VALIDOS.has(Number(d.slice(0, 2)))) return 'DDD inválido';
  if (d.length === 11 && d[2] !== '9') return 'Celular deve começar com 9 após o DDD';
  if (/^(\d)\1+$/.test(d)) return 'Telefone inválido';
  return null;
}
