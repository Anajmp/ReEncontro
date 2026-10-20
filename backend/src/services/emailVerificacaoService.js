// =====================================================================
// emailVerificacaoService — verificação de e-mail por código de 6 dígitos.
// Informativo: nenhuma parte do sistema depende do e-mail estar verificado.
// =====================================================================
import crypto from "crypto";
import { emailVerificacaoRepository } from "../repositories/emailVerificacaoRepository.js";
import { notificacoesRepository } from "../repositories/notificacoesRepository.js";
import { enviarEmail } from "../config/email.js";
import { emailTemplates } from "../utils/emailTemplates.js";
import { JWT_SECRET } from "../config/env.js";

export const VALIDADE_MINUTOS = 15;
export const MAX_TENTATIVAS = 5;

// HMAC em vez de hash puro: o código só tem 1 milhão de combinações, então
// um sha256 simples seria revertido na hora se o banco vazasse. Com a chave
// secreta, o hash não serve para nada sem o JWT_SECRET.
function hashCodigo(codigo) {
  return crypto.createHmac("sha256", JWT_SECRET).update(codigo).digest("hex");
}

// 000000–999999, com zeros à esquerda
function gerarCodigo() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

function codigoConfere(codigo, hashSalvo) {
  const a = Buffer.from(hashCodigo(codigo), "hex");
  const b = Buffer.from(hashSalvo, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function buscarUsuarioOuFalhar(userId) {
  const usuario = await emailVerificacaoRepository.buscarUsuario(userId);
  if (!usuario) throw { status: 404, mensagem: "Usuário não encontrado" };
  return usuario;
}

export const emailVerificacaoService = {
  async enviarCodigo(userId) {
    const usuario = await buscarUsuarioOuFalhar(userId);

    if (usuario.email_verificado_em) {
      return {
        ja_verificado: true,
        email_verificado_em: usuario.email_verificado_em,
        mensagem: "Seu e-mail já está verificado.",
      };
    }

    const codigo = gerarCodigo();
    await emailVerificacaoRepository.criarCodigo(userId, hashCodigo(codigo));

    const template = emailTemplates.codigoVerificacao({
      nome: usuario.nome,
      codigo,
    });

    let erroEnvio = null;
    try {
      await enviarEmail({
        para: usuario.email,
        assunto: template.assunto,
        html: template.html,
      });
    } catch (err) {
      erroEnvio = err.message;
      console.error("Falha ao enviar código de verificação:", err.message);
    }

    // O corpo registrado NÃO leva o código: guardá-lo aqui anularia o hash.
    await notificacoesRepository
      .registrar({
        userId,
        emailDestino: usuario.email,
        tipo: "verificacao_email",
        assunto: template.assunto,
        corpo: "Código de verificação de e-mail (conteúdo omitido por segurança).",
        enviada: !erroEnvio,
        erro: erroEnvio,
      })
      .catch((err) =>
        console.error("Falha ao registrar notificação:", err.message),
      );

    if (erroEnvio) {
      throw {
        status: 502,
        mensagem: "Não foi possível enviar o e-mail agora. Tente novamente em instantes.",
      };
    }

    return {
      ja_verificado: false,
      email: usuario.email,
      expira_em_segundos: VALIDADE_MINUTOS * 60,
      mensagem: `Enviamos um código de 6 dígitos para ${usuario.email}.`,
    };
  },

  async confirmarCodigo(userId, codigo) {
    const usuario = await buscarUsuarioOuFalhar(userId);

    if (usuario.email_verificado_em) {
      return {
        ja_verificado: true,
        email_verificado_em: usuario.email_verificado_em,
        mensagem: "Seu e-mail já está verificado.",
      };
    }

    const registro = await emailVerificacaoRepository.buscarUltimoCodigo(userId);

    if (registro?.usado_em && registro.tentativas >= MAX_TENTATIVAS) {
      throw {
        status: 400,
        mensagem: "Você errou o código muitas vezes. Peça um novo código.",
        extra: { codigo: "tentativas_esgotadas" },
      };
    }
    if (!registro || registro.usado_em) {
      throw {
        status: 400,
        mensagem: "Nenhum código ativo. Peça um novo código.",
        extra: { codigo: "sem_codigo" },
      };
    }
    if (registro.expirado) {
      throw {
        status: 400,
        mensagem: "Este código expirou. Peça um novo código.",
        extra: { codigo: "codigo_expirado" },
      };
    }

    if (!codigoConfere(codigo, registro.codigo_hash)) {
      const tentativas = await emailVerificacaoRepository.registrarTentativaErrada(
        registro.id,
        MAX_TENTATIVAS,
      );
      const restantes = Math.max(0, MAX_TENTATIVAS - tentativas);

      if (restantes === 0) {
        throw {
          status: 400,
          mensagem: "Você errou o código muitas vezes. Peça um novo código.",
          extra: { codigo: "tentativas_esgotadas", tentativas_restantes: 0 },
        };
      }
      throw {
        status: 400,
        mensagem: `Código incorreto. Você tem mais ${restantes} ${restantes === 1 ? "tentativa" : "tentativas"}.`,
        extra: { codigo: "codigo_incorreto", tentativas_restantes: restantes },
      };
    }

    const verificadoEm = await emailVerificacaoRepository.confirmar(
      registro.id,
      userId,
    );

    return {
      ja_verificado: false,
      email_verificado_em: verificadoEm,
      mensagem: "E-mail verificado com sucesso!",
    };
  },
};
