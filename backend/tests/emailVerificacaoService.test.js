import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

const SEGREDO = "segredo-de-teste-com-mais-de-32-caracteres!!";

vi.mock("../src/config/env.js", () => ({ JWT_SECRET: SEGREDO }));
vi.mock("../src/config/email.js", () => ({ enviarEmail: vi.fn() }));
vi.mock("../src/repositories/notificacoesRepository.js", () => ({
  notificacoesRepository: { registrar: vi.fn().mockResolvedValue() },
}));
vi.mock("../src/repositories/emailVerificacaoRepository.js", () => ({
  emailVerificacaoRepository: {
    buscarUsuario: vi.fn(),
    criarCodigo: vi.fn(),
    buscarUltimoCodigo: vi.fn(),
    registrarTentativaErrada: vi.fn(),
    confirmar: vi.fn(),
  },
}));

const { emailVerificacaoService } = await import("../src/services/emailVerificacaoService.js");
const { emailVerificacaoRepository: repo } = await import("../src/repositories/emailVerificacaoRepository.js");
const { notificacoesRepository } = await import("../src/repositories/notificacoesRepository.js");
const { enviarEmail } = await import("../src/config/email.js");

const hmac = (c) => crypto.createHmac("sha256", SEGREDO).update(c).digest("hex");
const usuario = { id: 7, nome: "Ana", email: "ana@exemplo.com", email_verificado_em: null };

beforeEach(() => {
  vi.clearAllMocks();
  repo.buscarUsuario.mockResolvedValue({ ...usuario });
});

describe("enviarCodigo", () => {
  it("não envia nada se o e-mail já está verificado", async () => {
    repo.buscarUsuario.mockResolvedValue({ ...usuario, email_verificado_em: new Date() });
    const r = await emailVerificacaoService.enviarCodigo(7);
    expect(r.ja_verificado).toBe(true);
    expect(enviarEmail).not.toHaveBeenCalled();
    expect(repo.criarCodigo).not.toHaveBeenCalled();
  });

  it("guarda só o hash, envia o código de 6 dígitos e registra a notificação sem o código", async () => {
    enviarEmail.mockResolvedValue({});
    const r = await emailVerificacaoService.enviarCodigo(7);

    const html = enviarEmail.mock.calls[0][0].html;
    const codigo = html.match(/>\s*(\d{6})\s*</)[1];
    expect(repo.criarCodigo).toHaveBeenCalledWith(7, hmac(codigo));
    expect(html).toContain("15 minutos");
    expect(html).not.toMatch(/<a\s/);

    const notif = notificacoesRepository.registrar.mock.calls[0][0];
    expect(notif).toMatchObject({ tipo: "verificacao_email", enviada: true });
    expect(notif.corpo).not.toContain(codigo);
    expect(r).toMatchObject({ ja_verificado: false, expira_em_segundos: 900 });
  });

  it("responde 502 e registra a falha quando o Brevo recusa", async () => {
    enviarEmail.mockRejectedValue(new Error("Brevo respondeu 401"));
    await expect(emailVerificacaoService.enviarCodigo(7)).rejects.toMatchObject({ status: 502 });
    expect(notificacoesRepository.registrar.mock.calls[0][0]).toMatchObject({ enviada: false });
  });
});

describe("confirmarCodigo", () => {
  const ativo = (extra = {}) => ({ id: 1, codigo_hash: hmac("123456"), usado_em: null, tentativas: 0, expirado: 0, ...extra });

  it("confirma o código certo e devolve a data de verificação", async () => {
    repo.buscarUltimoCodigo.mockResolvedValue(ativo());
    repo.confirmar.mockResolvedValue("2026-10-17 10:00:00");
    const r = await emailVerificacaoService.confirmarCodigo(7, "123456");
    expect(repo.confirmar).toHaveBeenCalledWith(1, 7);
    expect(r.email_verificado_em).toBe("2026-10-17 10:00:00");
  });

  it("código errado informa as tentativas restantes", async () => {
    repo.buscarUltimoCodigo.mockResolvedValue(ativo());
    repo.registrarTentativaErrada.mockResolvedValue(1);
    await expect(emailVerificacaoService.confirmarCodigo(7, "000000")).rejects.toMatchObject({
      status: 400,
      extra: { codigo: "codigo_incorreto", tentativas_restantes: 4 },
    });
    expect(repo.confirmar).not.toHaveBeenCalled();
  });

  it("a 5ª tentativa errada queima o código", async () => {
    repo.buscarUltimoCodigo.mockResolvedValue(ativo({ tentativas: 4 }));
    repo.registrarTentativaErrada.mockResolvedValue(5);
    await expect(emailVerificacaoService.confirmarCodigo(7, "000000")).rejects.toMatchObject({
      extra: { codigo: "tentativas_esgotadas" },
    });
  });

  it("código já queimado continua recusado, mesmo se for o certo", async () => {
    repo.buscarUltimoCodigo.mockResolvedValue(ativo({ usado_em: new Date(), tentativas: 5 }));
    await expect(emailVerificacaoService.confirmarCodigo(7, "123456")).rejects.toMatchObject({
      extra: { codigo: "tentativas_esgotadas" },
    });
  });

  it("código expirado é recusado", async () => {
    repo.buscarUltimoCodigo.mockResolvedValue(ativo({ expirado: 1 }));
    await expect(emailVerificacaoService.confirmarCodigo(7, "123456")).rejects.toMatchObject({
      extra: { codigo: "codigo_expirado" },
    });
  });

  it("sem código emitido pede um novo", async () => {
    repo.buscarUltimoCodigo.mockResolvedValue(null);
    await expect(emailVerificacaoService.confirmarCodigo(7, "123456")).rejects.toMatchObject({
      extra: { codigo: "sem_codigo" },
    });
  });
});
