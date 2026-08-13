// =====================================================================
// authOpcional — se houver token válido, popula req.usuario.
// Se não houver (ou for inválido), deixa passar como anônimo.
// Use em rotas públicas que se beneficiam de saber quem é o usuário.
// =====================================================================
import { verificarToken } from "../utils/tokens.js";

export function authOpcional(req, res, next) {
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer ")) {
    try {
      const payload = verificarToken(header.split(" ")[1]);
      req.usuario = payload; // logado
    } catch {
      // token inválido → segue como anônimo (não bloqueia)
    }
  }
  // sem token → segue como anônimo
  next();
}
