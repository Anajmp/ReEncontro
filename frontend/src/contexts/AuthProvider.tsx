// =====================================================================
// AuthProvider — guarda a sessão e fornece o AuthContext (ver AuthContext.tsx).
// =====================================================================
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi, type DadosRegistro, type ResultadoLogin } from '../lib/api';
import { AuthContext } from './AuthContext';
import type { Usuario } from './AuthContext';

const CHAVE_TOKEN = 'token';
const CHAVE_REFRESH = 'refreshToken';
const CHAVE_USUARIO = 'usuario';

function limparArmazenamento() {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_REFRESH);
  localStorage.removeItem(CHAVE_USUARIO);
}

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

interface SessaoSalva {
  token: string | null;
  usuario: Usuario | null;
  expirou: boolean;
}

// ---- Restaura a sessão ao carregar/recarregar a página ----
// A leitura do localStorage é síncrona, então a sessão já entra no estado
// inicial (sem um render intermediário "deslogado").
function lerSessaoSalva(): SessaoSalva {
  try {
    const tokenSalvo = localStorage.getItem(CHAVE_TOKEN);
    const usuarioSalvo = localStorage.getItem(CHAVE_USUARIO);
    const podeRenovar = !!localStorage.getItem(CHAVE_REFRESH);

    if (tokenSalvo && usuarioSalvo && tokenExpirado(tokenSalvo) && !podeRenovar) {
      // Token vencido e sem refresh token (sessão de antes da renovação
      // existir): avisa já na entrada em vez de deslogar no primeiro clique.
      // Com refresh token, a sessão segue e a API renova na próxima chamada.
      limparArmazenamento();
      return { token: null, usuario: null, expirou: true };
    }
    if (tokenSalvo && usuarioSalvo) {
      return { token: tokenSalvo, usuario: JSON.parse(usuarioSalvo) as Usuario, expirou: false };
    }
  } catch {
    // Dado corrompido no localStorage — limpa pra não travar a aplicação
    limparArmazenamento();
  }
  return { token: null, usuario: null, expirou: false };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessaoInicial] = useState(lerSessaoSalva);
  const [usuario, setUsuario] = useState<Usuario | null>(sessaoInicial.usuario);
  const [token, setToken] = useState<string | null>(sessaoInicial.token);
  // A restauração acontece no estado inicial, então nunca há espera.
  const carregando = false;
  const navigate = useNavigate();

  // Sessão antiga vencida ao abrir a página: avisa uma vez
  useEffect(() => {
    if (sessaoInicial.expirou) avisarSessaoExpirada();
  }, [sessaoInicial]);

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

  async function registrar(dados: DadosRegistro) {
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
