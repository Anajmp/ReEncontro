// backend/src/config/env.js
// Centraliza a leitura e a validação das variáveis de ambiente.
// Importado no topo do server.js: se algo estiver errado, o processo nem sobe,
// em vez de subir e falhar silenciosamente em produção (ex.: FRONTEND_URL = "*",
// que gerou links de redefinição de senha quebrados).

import 'dotenv/config';

const erros = [];

function obrigatoria(nome, { validar, mensagem } = {}) {
  const valor = process.env[nome];

  if (valor === undefined || valor.trim() === '') {
    erros.push(`${nome} não está definida.`);
    return '';
  }

  if (validar && !validar(valor)) {
    erros.push(`${nome} = "${valor}" — ${mensagem}`);
    return valor;
  }

  return valor;
}

function opcional(nome, padrao = '') {
  const valor = process.env[nome];
  return valor === undefined || valor.trim() === '' ? padrao : valor;
}

function ehUrlHttp(valor) {
  try {
    const url = new URL(valor);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// --- Aplicação -------------------------------------------------------------

export const NODE_ENV = opcional('NODE_ENV', 'development');
export const EH_PRODUCAO = NODE_ENV === 'production';
export const PORT = Number(opcional('PORT', '3000'));

// URL do frontend. Usada para montar os links enviados por e-mail.
// A barra final é removida para não gerar "https://site.com//redefinir-senha".
export const FRONTEND_URL = obrigatoria('FRONTEND_URL', {
  validar: ehUrlHttp,
  mensagem: 'precisa ser uma URL completa (ex.: https://re-encontro.vercel.app). '
    + 'Os links enviados por e-mail são montados a partir dela.',
}).replace(/\/+$/, '');

// Origens autorizadas no CORS, separadas por vírgula.
// Diferente da FRONTEND_URL: aqui pode haver mais de uma (produção + local).
export const CORS_ORIGINS = opcional('CORS_ORIGINS')
  .split(',')
  .map(origem => origem.trim().replace(/\/+$/, ''))
  .filter(Boolean);

if (CORS_ORIGINS.length === 0) {
  erros.push('CORS_ORIGINS não está definida. Ex.: '
    + 'CORS_ORIGINS=https://re-encontro.vercel.app,http://localhost:5173');
}

if (CORS_ORIGINS.includes('*')) {
  erros.push('CORS_ORIGINS contém "*". Liste as origens explicitamente — '
    + 'o curinga permite que qualquer site chame a API em nome do usuário.');
}

// --- Banco de dados --------------------------------------------------------

export const DB_HOST = obrigatoria('DB_HOST');
export const DB_PORT = Number(opcional('DB_PORT', '3306'));
export const DB_USER = obrigatoria('DB_USER');
export const DB_PASSWORD = obrigatoria('DB_PASSWORD');
export const DB_NAME = obrigatoria('DB_NAME');

// --- Autenticação ----------------------------------------------------------

export const JWT_SECRET = obrigatoria('JWT_SECRET', {
  validar: valor => valor.length >= 32,
  mensagem: 'precisa ter pelo menos 32 caracteres. Gere com: '
    + 'node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"',
});

export const GOOGLE_CLIENT_ID = opcional('GOOGLE_CLIENT_ID');

// --- E-mail (Brevo) --------------------------------------------------------

// A chave do Brevo já chegou quebrada por um caractere cirílico colado junto.
// A validação abaixo rejeita qualquer caractere fora do ASCII imprimível,
// que é o que o header HTTP aceita.
export const BREVO_API_KEY = obrigatoria('BREVO_API_KEY', {
  validar: valor => /^[\x21-\x7E]+$/.test(valor),
  mensagem: 'contém caractere inválido (provavelmente copiado de um site com '
    + 'letra cirílica ou espaço invisível). Digite a chave manualmente.',
});

export const BREVO_FROM_EMAIL = obrigatoria('BREVO_FROM_EMAIL', {
  validar: valor => valor.includes('@'),
  mensagem: 'precisa ser um e-mail válido e verificado no painel do Brevo.',
});

export const BREVO_FROM_NAME = opcional('BREVO_FROM_NAME', 'ReEncontro');

// --- Upload de fotos (Cloudinary) ------------------------------------------

export const CLOUDINARY_CLOUD_NAME = obrigatoria('CLOUDINARY_CLOUD_NAME');
export const CLOUDINARY_API_KEY = obrigatoria('CLOUDINARY_API_KEY');
export const CLOUDINARY_API_SECRET = obrigatoria('CLOUDINARY_API_SECRET');

// --- Monitoramento ---------------------------------------------------------

export const SENTRY_DSN = opcional('SENTRY_DSN');

// --- Resultado da validação ------------------------------------------------

if (erros.length > 0) {
  const lista = erros.map(e => `  • ${e}`).join('\n');
  throw new Error(
    `\n\n[ReEncontro] Configuração inválida — o servidor não foi iniciado.\n\n${lista}\n\n`
    + 'Corrija o arquivo .env (local) ou as Environment Variables do Render (produção).\n'
  );
}

if (!EH_PRODUCAO) {
  console.log(`[env] ${NODE_ENV} · frontend: ${FRONTEND_URL} · CORS: ${CORS_ORIGINS.join(', ')}`);
}
