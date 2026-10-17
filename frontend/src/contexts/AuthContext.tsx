// =====================================================================
// AuthContext — estado global de autenticação da aplicação.
//
// Responsabilidades:
//  - Guardar o usuário logado e o token
//  - Restaurar a sessão automaticamente ao recarregar a página (F5)
//  - Fazer login / cadastro / logout
//  - Reagir quando a API renova o token (evento 'auth:renovado') ou avisa
//    que a sessão acabou de vez (evento 'auth:expirado')
// =====================================================================
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '../lib/api';

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
}

// Resposta de login/cadastro/Google
interface ResultadoLogin {
  token: string;
  refreshToken?: string;
  usuario: Usuario;
}

interface AuthContextValue {
  usuario: Usuario | null;
  token: string | null;
  carregando: boolean; // true enquanto restaura a sessão do localStorage
  autenticado: boolean;
  login: (email: string, senha: string) => Promise<Usuario>;
  registrar: (dados: any) => Promise<Usuario>;
  salvarSessao: (resultado: ResultadoLogin) => Usuario;
  logout: () => void;
  atualizarUsuario: (parcial: Partial<Usuario>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const CHAVE_TOKEN = 'token';
const CHAVE_REFRESH = 'refreshToken';
const CHAVE_USUARIO = 'usuario';

// Lê o campo exp do JWT (sem validar assinatura) e diz se já venceu
function tokenExpirado(token: string) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(base64));
    return typeof exp === 'number' && exp * 1000 <= Date.now();
  } catch {
    return true; // token malformado: trata como vencido
  }
}

function avisarSessaoExpirada() {
  toast.info('Sua sessão expirou. Entre novamente para continuar.', {
    id: 'sessao-expirada', // evita toasts repetidos se várias chamadas falharem juntas
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  // ---- Restaura a sessão ao carregar/recarregar a página ----
  useEffect(() => {
    try {
      const tokenSalvo = localStorage.getItem(CHAVE_TOKEN);
      const usuarioSalvo = localStorage.getItem(CHAVE_USUARIO);

      const podeRenovar = !!localStorage.getItem(CHAVE_REFRESH);

      if (tokenSalvo && usuarioSalvo && tokenExpirado(tokenSalvo) && !podeRenovar) {
        // Token vencido e sem refresh token (sessão de antes da renovação
        // existir): avisa já na entrada em vez de deslogar no primeiro clique.
        // Com refresh token, a sessão segue e a API renova na próxima chamada.
        limparArmazenamento();
        avisarSessaoExpirada();
      } else if (tokenSalvo && usuarioSalvo) {
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

  // ---- A API renovou o access token: mantém o estado em dia ----
  // ---- A renovação falhou: a sessão caiu, avisa e manda pro login ----
  useEffect(() => {
    function aoRenovar() {
      setToken(localStorage.getItem(CHAVE_TOKEN));
    }
    function aoExpirar() {
      setUsuario(null);
      setToken(null);
      avisarSessaoExpirada();
      if (window.location.pathname !== '/login') {
        navigate('/login', { state: { de: window.location.pathname } });
      }
    }
    window.addEventListener('auth:renovado', aoRenovar);
    window.addEventListener('auth:expirado', aoExpirar);
    return () => {
      window.removeEventListener('auth:renovado', aoRenovar);
      window.removeEventListener('auth:expirado', aoExpirar);
    };
  }, [navigate]);

  function limparArmazenamento() {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_REFRESH);
    localStorage.removeItem(CHAVE_USUARIO);
  }

  // Salva a sessão (memória + localStorage) e devolve o usuário
  function guardarSessao(resultado: ResultadoLogin) {
    localStorage.setItem(CHAVE_TOKEN, resultado.token);
    if (resultado.refreshToken) {
      localStorage.setItem(CHAVE_REFRESH, resultado.refreshToken);
    }
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
    // Revoga o refresh token no backend (sem esperar a resposta)
    const refreshToken = localStorage.getItem(CHAVE_REFRESH);
    if (refreshToken) authApi.logout(refreshToken);
    limparArmazenamento();
    setUsuario(null);
    setToken(null);
  }

  // Atualiza campos do usuário (ex.: avatar_seed) sem novo login
  function atualizarUsuario(parcial: Partial<Usuario>) {
    setUsuario(atual => {
      if (!atual) return atual;
      const atualizado = { ...atual, ...parcial };
      localStorage.setItem(CHAVE_USUARIO, JSON.stringify(atualizado));
      return atualizado;
    });
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
        salvarSessao: guardarSessao,
        logout,
        atualizarUsuario,
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
