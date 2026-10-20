// =====================================================================
// refreshTokenService — renovação de sessão com refresh token.
//
// O access token (JWT) dura pouco (JWT_EXPIRES_IN, 15 min). Quando ele
// vence, o frontend troca o refresh token por um par novo:
//  - o refresh token é opaco (aleatório) e só o hash fica no banco;
//  - a cada uso ele é revogado e substituído (rotação);
//  - se um token já revogado for apresentado de novo, alguém pode ter
//    copiado esse token: revogamos todas as sessões do usuário.
// =====================================================================
import crypto from "crypto";
import { refreshTokensRepository } from "../repositories/refreshTokensRepository.js";
import { gerarToken } from "../utils/tokens.js";

const VALIDADE_DIAS = 7;

const SESSAO_EXPIRADA = {
  status: 401,
  mensagem: "Sua sessão expirou. Faça login novamente.",
};

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const refreshTokenService = {
  // Gera um refresh token novo para o usuário e devolve o valor puro
  async emitir(userId) {
    const token = crypto.randomBytes(32).toString("hex");
    await refreshTokensRepository.criar(userId, hashToken(token), VALIDADE_DIAS);
    return token;
  },

  // Troca um refresh token válido por um novo access token + refresh token
  async renovar(refreshToken) {
    const registro = await refreshTokensRepository.buscarPorHash(
      hashToken(refreshToken),
    );
    if (!registro) throw SESSAO_EXPIRADA;

    // Token já usado/revogado sendo reapresentado: possível roubo
    if (registro.revogado_em) {
      await refreshTokensRepository.revogarTodosDoUsuario(registro.user_id);
      throw SESSAO_EXPIRADA;
    }

    if (!registro.dentro_validade || !registro.ativo) throw SESSAO_EXPIRADA;

    // Revoga o atual; se outra requisição chegou primeiro, também é reuso
    const revogou = await refreshTokensRepository.revogar(registro.id);
    if (!revogou) {
      await refreshTokensRepository.revogarTodosDoUsuario(registro.user_id);
      throw SESSAO_EXPIRADA;
    }

    const token = gerarToken({
      id: registro.user_id,
      role: registro.role,
      is_diretora: Boolean(registro.is_diretora),
    });
    const novoRefreshToken = await this.emitir(registro.user_id);

    return { token, refreshToken: novoRefreshToken };
  },

  // Logout: invalida só o token desta sessão
  async revogar(refreshToken) {
    await refreshTokensRepository.revogarPorHash(hashToken(refreshToken));
  },

  // Troca de senha: invalida as sessões de todos os dispositivos
  async revogarTodos(userId) {
    await refreshTokensRepository.revogarTodosDoUsuario(userId);
  },
};
