// =====================================================================
// Geração e validação de tokens JWT
// =====================================================================
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.JWT_SECRET;

// Gera o access token (curta duração)
export function gerarToken(payload) {
  return jwt.sign(payload, SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
}

// Valida e decodifica um token. Lança erro se inválido/expirado.
export function verificarToken(token) {
  return jwt.verify(token, SECRET);
}
