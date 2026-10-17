import { describe, it, expect } from "vitest";
import {
  normalizarTelefone,
  validarTelefone,
  telefoneOpcional,
} from "../src/utils/telefone.js";

describe("normalizarTelefone", () => {
  it("remove parênteses, hífen, ponto e espaços", () => {
    expect(normalizarTelefone("(19) 99876-5432")).toBe("19998765432");
    expect(normalizarTelefone("19.3456.7890")).toBe("1934567890");
  });
});

describe("validarTelefone", () => {
  it("aceita celular com 11 dígitos e 9 na terceira posição", () => {
    expect(validarTelefone("(19) 99876-5432").valido).toBe(true);
  });

  it("aceita fixo com 10 dígitos", () => {
    expect(validarTelefone("(19) 3456-7890").valido).toBe(true);
  });

  it("rejeita caracteres que não são máscara", () => {
    expect(validarTelefone("+55 19 99876-5432").valido).toBe(false);
    expect(validarTelefone("19abc765432").valido).toBe(false);
  });

  it("rejeita tamanho diferente de 10 ou 11", () => {
    expect(validarTelefone("199876543").valido).toBe(false);
    expect(validarTelefone("199987654321").valido).toBe(false);
  });

  it("rejeita celular de 11 dígitos sem 9 na terceira posição", () => {
    expect(validarTelefone("19887654321")).toEqual({
      valido: false,
      mensagem: "Celular deve começar com 9 após o DDD",
    });
  });

  it("rejeita DDD inexistente", () => {
    for (const ddd of ["00", "10", "20", "23", "25", "30", "36", "50", "52", "56", "70", "72", "76", "78", "80", "90"]) {
      expect(validarTelefone(`${ddd}987654321`).mensagem).toBe("DDD inválido");
    }
  });

  it("rejeita todos os dígitos repetidos", () => {
    expect(validarTelefone("11111111111").valido).toBe(false);
    expect(validarTelefone("99999999999").valido).toBe(false);
    expect(validarTelefone("2222222222").valido).toBe(false);
  });
});

describe("telefoneOpcional (Zod)", () => {
  it("deixa passar vazio, nulo ou ausente", () => {
    expect(telefoneOpcional.parse(undefined)).toBeUndefined();
    expect(telefoneOpcional.parse(null)).toBeUndefined();
    expect(telefoneOpcional.parse("")).toBeUndefined();
    expect(telefoneOpcional.parse("   ")).toBeUndefined();
  });

  it("normaliza para apenas dígitos", () => {
    expect(telefoneOpcional.parse("(19) 99876-5432")).toBe("19998765432");
  });

  it("devolve a mensagem de erro da validação", () => {
    const r = telefoneOpcional.safeParse("(20) 99876-5432");
    expect(r.success).toBe(false);
    expect(r.error.errors[0].message).toBe("DDD inválido");
  });
});
