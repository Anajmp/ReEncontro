// =====================================================================
// Helpers de autenticação no frontend.
// Lê/limpa os dados do usuário logado guardados no localStorage.
// =====================================================================
import { authApi } from './api';

export interface UsuarioLogado {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  role: string;
  is_diretora?: boolean;
  avatar_seed?: string;
  email_verificado_em?: string | null;
}

// Retorna o usuário logado, ou null se não houver
export function getUsuario(): UsuarioLogado | null {
  const raw = localStorage.getItem('usuario');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Diz se tem alguém logado
export function estaLogado(): boolean {
  return !!localStorage.getItem('token');
}

// Faz logout (revoga o refresh token no backend e limpa tudo)
export function logout() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) authApi.logout(refreshToken);
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('usuario');
}
