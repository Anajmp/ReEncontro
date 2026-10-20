import { describe, it, expect } from "vitest";
import {
  listarItensSchema,
  listarFinalizadosSchema,
} from "../src/models/itemSchema.js";

describe("listarItensSchema", () => {
  it("aplica página 1, 24 itens e ordem recentes por padrão", () => {
    expect(listarItensSchema.parse({})).toEqual({
      ordem: "recentes",
      pagina: 1,
      limite: 24,
    });
  });

  it("converte os query params de texto", () => {
    const filtros = listarItensSchema.parse({
      q: "  mochila ",
      categoriaId: "3",
      pagina: "2",
      limite: "12",
      ordem: "nome",
    });
    expect(filtros).toMatchObject({
      q: "mochila",
      categoriaId: 3,
      pagina: 2,
      limite: 12,
      ordem: "nome",
    });
  });

  it("trata busca só com espaços como sem busca", () => {
    expect(listarItensSchema.parse({ q: "   " }).q).toBeUndefined();
  });

  it("rejeita limite acima de 100, página zero e ordem desconhecida", () => {
    expect(listarItensSchema.safeParse({ limite: "500" }).success).toBe(false);
    expect(listarItensSchema.safeParse({ pagina: "0" }).success).toBe(false);
    expect(listarItensSchema.safeParse({ ordem: "preco" }).success).toBe(false);
  });
});

describe("listarFinalizadosSchema", () => {
  it("usa entregue por padrão e aceita todos", () => {
    expect(listarFinalizadosSchema.parse({}).status).toBe("entregue");
    expect(listarFinalizadosSchema.parse({ status: "todos" }).status).toBe("todos");
  });

  it("rejeita status que não é de item finalizado", () => {
    expect(listarFinalizadosSchema.safeParse({ status: "disponivel" }).success).toBe(false);
  });
});
