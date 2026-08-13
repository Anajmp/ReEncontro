// =====================================================================
// Helpers de autenticação no frontend.
// Lê/limpa os dados do usuário logado guardados no localStorage.
// =====================================================================

export interface UsuarioLogado {
  id: number;
  nome: string;
  email: string;
  role: string;
  is_diretora?: boolean;
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

// Faz logout (limpa tudo)
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}