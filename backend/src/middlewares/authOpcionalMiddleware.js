// =====================================================================
// authOpcional — se houver token válido, popula req.usuario.
// Se não houver token, deixa passar como anônimo; se houver e for
// inválido/expirado, responde 401 (igual ao authMiddleware).
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
      // Token enviado mas vencido/inválido: responde 401 para o frontend
      // renovar a sessão e repetir. Seguir como anônimo faria a ação
      // (ex.: reivindicar com aluno cadastrado) sair sem o usuário.
      return res.status(401).json({ erro: "Token inválido ou expirado" });
    }
  }
  // sem token → segue como anônimo
  next();
}
