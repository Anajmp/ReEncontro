// backend/src/middlewares/rateLimitMiddleware.js
// Limitação de requisições (RNF de segurança previsto no DRS).
//
// Requer: npm i express-rate-limit
// Requer também app.set('trust proxy', 1) no app.js — o Render fica atrás de
// um proxy reverso, e sem isso TODAS as requisições aparecem com o mesmo IP,
// fazendo o limite bloquear todos os usuários de uma vez.
//
// Atenção: na escola, pais, alunos e funcionárias no Wi-Fi saem pelo MESMO IP
// público (NAT). Por isso:
//   - quem está logado é contado pelo id do usuário, não pelo IP;
//   - login, recuperação de senha e reivindicação são contados por e-mail,
//     com um teto por IP bem mais alto só para conter varredura.

import rateLimit from 'express-rate-limit';
import { verificarToken } from '../utils/tokens.js';

const base = {
  standardHeaders: true,   // devolve RateLimit-* nos headers
  legacyHeaders: false,    // não devolve os X-RateLimit-* antigos
};

// Id do usuário do token, se houver um válido. Não bloqueia nada: quem
// decide se a rota exige login continua sendo o authMiddleware.
function usuarioDoToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  try {
    return verificarToken(header.split(' ')[1]).id ?? null;
  } catch {
    return null;
  }
}

function emailDoCorpo(req, campo = 'email') {
  const valor = req.body?.[campo];
  return typeof valor === 'string' ? valor.trim().toLowerCase() : '';
}

// Limite geral da API. Folgado de propósito: existe para conter varredura
// automatizada, não para atrapalhar o uso normal. Logado conta por usuário;
// anônimo conta por IP, com teto alto porque a escola inteira divide o IP.
export const limiteGeral = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: (req) => (usuarioDoToken(req) ? 600 : 3000),
  keyGenerator: (req) => {
    const userId = usuarioDoToken(req);
    return userId ? `u:${userId}` : `ip:${req.ip}`;
  },
  message: { erro: 'Muitas requisições. Aguarde alguns minutos e tente novamente.' },
});

// Login e cadastro. skipSuccessfulRequests faz o contador subir só quando a
// tentativa falha, então quem acerta a senha nunca é bloqueado — o limite
// atinge apenas quem está tentando adivinhar. Conta por IP + e-mail, para que
// um pai errando a senha não bloqueie o login das inspetoras.
export const limiteAuth = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `${req.ip}|${emailDoCorpo(req)}`,
  message: { erro: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
});

// Teto por IP para tentativas falhas com e-mails variados (varredura).
export const limiteAuthPorIp = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 100,
  skipSuccessfulRequests: true,
  message: { erro: 'Muitas tentativas de login a partir desta rede. Tente novamente em 15 minutos.' },
});

// Pedido de redefinição de senha. Cada requisição dispara um e-mail: sem
// limite, dá para encher a caixa de entrada de alguém e queimar a cota do
// Brevo. Conta por e-mail de destino.
export const limiteRecuperacaoSenha = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 3,
  keyGenerator: (req) => `email:${emailDoCorpo(req)}`,
  message: { erro: 'Limite de pedidos de redefinição atingido. Tente novamente em 1 hora.' },
});

// Teto por IP para pedidos de redefinição (vários e-mails diferentes).
export const limiteRecuperacaoSenhaPorIp = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 20,
  message: { erro: 'Limite de pedidos de redefinição atingido. Tente novamente em 1 hora.' },
});

// Envio da nova senha. Não dispara e-mail; o limite só impede testar tokens
// em massa. Separado do pedido para que errar a validação do formulário não
// consuma a cota de envio de e-mails.
export const limiteRedefinicaoSenha = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { erro: 'Muitas tentativas de redefinição. Tente novamente em 15 minutos.' },
});

// Código de verificação de e-mail. Mesmo motivo da recuperação de senha:
// cada requisição dispara um e-mail pelo Brevo. A rota exige login, então
// conta pelo usuário.
export const limiteVerificacaoEmail = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 3,
  keyGenerator: (req) => `u:${usuarioDoToken(req) ?? req.ip}`,
  message: { erro: 'Limite de envios do código atingido. Tente novamente em 1 hora.' },
});

// Reivindicações. É um formulário público (dá para enviar sem conta), então
// é o endpoint mais exposto a envio em massa. Conta por e-mail do requerente
// (ou usuário logado), com um teto por IP para quem varia o e-mail.
export const limiteReivindicacao = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  keyGenerator: (req) => {
    const userId = usuarioDoToken(req);
    return userId ? `u:${userId}` : `email:${emailDoCorpo(req, 'email_requerente')}`;
  },
  message: { erro: 'Limite de reivindicações por hora atingido. Procure a inspetoria da escola.' },
});

export const limiteReivindicacaoPorIp = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 40,
  message: { erro: 'Muitas reivindicações a partir desta rede. Procure a inspetoria da escola.' },
});
