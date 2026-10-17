// =====================================================================
// AuthContext — estado global de autenticação da aplicação.
//
// Responsabilidades:
//  - Guardar o usuário logado e o token
//  - Restaurar a sessão automaticamente ao recarregar a página (F5)
//  - Fazer login / cadastro / logout
//  - Reagir quando a API avisa que o token expirou (evento 'auth:expirado')
//
// O componente <AuthProvider> fica em ./AuthProvider.tsx; aqui ficam só o
// contexto, o hook e os tipos (separados para não quebrar o fast refresh).
// =====================================================================
import { createContext, useContext } from 'react';
import type { DadosRegistro } from '../lib/api';

// Formato do usuário devolvido pelo backend no login/registro
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  role: string; // 'responsavel' | 'funcionaria'
  is_diretora?: boolean | number;
  avatar_seed?: string;
  cadastro_completo?: boolean;
  // null = não verificado; undefined = sessão antiga, ainda sem essa informação
  email_verificado_em?: string | null;
}

export interface AuthContextValue {
  usuario: Usuario | null;
  token: string | null;
  carregando: boolean; // true enquanto restaura a sessão do localStorage
  autenticado: boolean;
  login: (email: string, senha: string) => Promise<Usuario>;
  registrar: (dados: DadosRegistro) => Promise<Usuario>;
  salvarSessao: (resultado: { token: string; usuario: Usuario }) => Usuario;
  logout: () => void;
  atualizarUsuario: (parcial: Partial<Usuario>) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// Hook de acesso ao contexto — usado em qualquer tela
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth precisa ser usado dentro de <AuthProvider>');
  }
  return contexto;
}

// Utilitário: "Ana Julia Panizo" -> "AP" (para o avatar da sidebar)
export function iniciais(nome?: string) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}
