// =====================================================================
// Middleware de autenticação
// Valida o token JWT do header Authorization e injeta req.usuario.
// =====================================================================
import { verificarToken } from '../utils/tokens.js';

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = verificarToken(token);
    // disponibiliza os dados do usuário para os próximos middlewares/controllers
    req.usuario = payload; // { id, role, is_diretora }
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}
