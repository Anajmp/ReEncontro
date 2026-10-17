// backend/src/middlewares/rateLimitMiddleware.js
// Limitação de requisições por IP (RNF de segurança previsto no DRS).
//
// Requer: npm i express-rate-limit
// Requer também app.set('trust proxy', 1) no app.js — o Render fica atrás de
// um proxy reverso, e sem isso TODAS as requisições aparecem com o mesmo IP,
// fazendo o limite bloquear todos os usuários de uma vez.

import rateLimit from 'express-rate-limit';

const base = {
  standardHeaders: true,   // devolve RateLimit-* nos headers
  legacyHeaders: false,    // não devolve os X-RateLimit-* antigos
};

// Limite geral da API. Folgado de propósito: existe para conter varredura
// automatizada, não para atrapalhar o uso normal.
export const limiteGeral = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { erro: 'Muitas requisições. Aguarde alguns minutos e tente novamente.' },
});

// Login e cadastro. skipSuccessfulRequests faz o contador subir só quando a
// tentativa falha, então quem acerta a senha nunca é bloqueado — o limite
// atinge apenas quem está tentando adivinhar.
export const limiteAuth = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: { erro: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
});

// Recuperação de senha. Mais apertado porque cada requisição dispara um e-mail:
// sem limite, dá para usar o endpoint para encher a caixa de entrada de alguém
// e ainda queimar a cota do Brevo.
export const limiteRecuperacaoSenha = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { erro: 'Limite de pedidos de redefinição atingido. Tente novamente em 1 hora.' },
});

// Código de verificação de e-mail. Mesmo motivo da recuperação de senha:
// cada requisição dispara um e-mail pelo Brevo.
export const limiteVerificacaoEmail = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { erro: 'Limite de envios do código atingido. Tente novamente em 1 hora.' },
});

// Reivindicações. É um formulário público (dá para enviar sem conta), então
// é o endpoint mais exposto a envio em massa.
export const limiteReivindicacao = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { erro: 'Limite de reivindicações por hora atingido. Procure a inspetoria da escola.' },
});
