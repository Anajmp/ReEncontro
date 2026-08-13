// =====================================================================
// AuthContext — estado global de autenticação da aplicação.
//
// Responsabilidades:
//  - Guardar o usuário logado e o token
//  - Restaurar a sessão automaticamente ao recarregar a página (F5)
//  - Fazer login / cadastro / logout
//  - Reagir quando a API avisa que o token expirou (evento 'auth:expirado')
// =====================================================================
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../lib/api';

// Formato do usuário devolvido pelo backend no login/registro
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: string; // 'responsavel' | 'funcionaria'
  is_diretora?: boolean | number;
}

interface AuthContextValue {
  usuario: Usuario | null;
  token: string | null;
  carregando: boolean; // true enquanto restaura a sessão do localStorage
  autenticado: boolean;
  login: (email: string, senha: string) => Promise<Usuario>;
  registrar: (dados: any) => Promise<Usuario>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const CHAVE_TOKEN = 'token';
const CHAVE_USUARIO = 'usuario';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  // ---- Restaura a sessão ao carregar/recarregar a página ----
  useEffect(() => {
    try {
      const tokenSalvo = localStorage.getItem(CHAVE_TOKEN);
      const usuarioSalvo = localStorage.getItem(CHAVE_USUARIO);

      if (tokenSalvo && usuarioSalvo) {
        setToken(tokenSalvo);
        setUsuario(JSON.parse(usuarioSalvo) as Usuario);
      }
    } catch {
      // Dado corrompido no localStorage — limpa pra não travar a aplicação
      limparArmazenamento();
    } finally {
      setCarregando(false);
    }
  }, []);

  // ---- Se a API responder 401, a sessão caiu: derruba o usuário ----
  useEffect(() => {
    function aoExpirar() {
      setUsuario(null);
      setToken(null);
    }
    window.addEventListener('auth:expirado', aoExpirar);
    return () => window.removeEventListener('auth:expirado', aoExpirar);
  }, []);

  function limparArmazenamento() {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_USUARIO);
  }

  // Salva a sessão (memória + localStorage) e devolve o usuário
  function guardarSessao(resultado: { token: string; usuario: Usuario }) {
    localStorage.setItem(CHAVE_TOKEN, resultado.token);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(resultado.usuario));
    setToken(resultado.token);
    setUsuario(resultado.usuario);
    return resultado.usuario;
  }

  async function login(email: string, senha: string) {
    const resultado = await authApi.login(email, senha);
    return guardarSessao(resultado);
  }

  async function registrar(dados: any) {
    const resultado = await authApi.register(dados);
    return guardarSessao(resultado);
  }

  function logout() {
    limparArmazenamento();
    setUsuario(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        carregando,
        autenticado: !!usuario,
        login,
        registrar,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

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
