// =====================================================================
// Validação dos dados de Item (Zod)
// O controller usa estes schemas para validar a entrada antes de
// passar pro service.
// =====================================================================
import { z } from "zod";

// Schema para criar um item
export const criarItemSchema = z.object({
  nome: z.string().min(2, "Nome muito curto").max(120),
  descricao: z.string().min(3, "Descrição muito curta").max(2000),
  categoriaId: z.coerce.number().int().positive("Categoria inválida"),
  localEncontrado: z.string().min(2).max(120),
  pontoColetaId: z.coerce.number().int().positive("Ponto de coleta inválido"),
  dataEncontrado: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use AAAA-MM-DD)"),
});

// Paginação comum às listagens: páginas de 24 itens por padrão, no máximo 100
const paginacao = {
  pagina: z.coerce.number().int().min(1).max(10000).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(24),
};

// Busca por palavra-chave; vazio vira "sem busca"
const busca = z
  .string()
  .trim()
  .max(100)
  .optional()
  .transform((v) => v || undefined);

// Schema para filtros da listagem (query params)
export const listarItensSchema = z.object({
  q: busca,
  categoriaId: z.coerce.number().int().positive().optional(),
  dataInicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  dataFim: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  ordem: z.enum(["recentes", "antigos", "nome"]).default("recentes"),
  ...paginacao,
});

// Schema para a listagem de finalizados (só funcionária)
export const listarFinalizadosSchema = z.object({
  status: z.enum(["entregue", "descartado", "todos"]).default("entregue"),
  q: busca,
  ...paginacao,
});

export const editarItemSchema = z.object({
  nome: z.string().min(2, "Nome muito curto").max(120),
  descricao: z.string().min(3, "Descrição muito curta").max(255),
  categoria_id: z.coerce.number().int().positive("Categoria inválida"),
  local_encontrado: z.string().min(2).max(255),
  ponto_coleta_id: z.coerce.number().int().positive("Ponto de coleta inválido"),
});
