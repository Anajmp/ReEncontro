// =====================================================================
// Fuso horário nas consultas SQL.
//
// O MySQL (Aiven) roda em UTC e os DATETIME são gravados com NOW() em UTC.
// Para operações de calendário (dia de hoje, agrupar por mês) é preciso
// converter para o horário de Brasília; senão, das 21h à meia-noite o
// banco já considera que é o dia seguinte. O Brasil não tem mais horário
// de verão, então o deslocamento é fixo em -03:00.
// =====================================================================

/** Expressão SQL que converte uma coluna/valor DATETIME de UTC para Brasília. */
export const emHorarioBrasilia = (expressao) => `CONVERT_TZ(${expressao}, '+00:00', '-03:00')`;

/** Data de hoje em Brasília (substitui CURDATE(), que devolve o dia em UTC). */
export const HOJE_BRASILIA = `DATE(${emHorarioBrasilia('NOW()')})`;
