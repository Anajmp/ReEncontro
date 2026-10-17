// =====================================================================
// AuthProvider — guarda a sessão e fornece o AuthContext (ver AuthContext.tsx).
// =====================================================================
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi, type DadosRegistro } from '../lib/api';
import { AuthContext } from './AuthContext';
import type { Usuario } from './AuthContext';

const CHAVE_TOKEN = 'token';
const CHAVE_USUARIO = 'usuario';

function limparArmazenamento() {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_USUARIO);
}

// ---- Restaura a sessão ao carregar/recarregar a página ----
// A leitura do localStorage é síncrona, então a sessão já entra no estado
// inicial (sem um render intermediário "deslogado").
function lerSessaoSalva(): { token: string; usuario: Usuario } | null {
  try {
    const tokenSalvo = localStorage.getItem(CHAVE_TOKEN);
    const usuarioSalvo = localStorage.getItem(CHAVE_USUARIO);

    if (tokenSalvo && usuarioSalvo) {
      return { token: tokenSalvo, usuario: JSON.parse(usuarioSalvo) as Usuario };
    }
  } catch {
    // Dado corrompido no localStorage — limpa pra não travar a aplicação
    limparArmazenamento();
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessaoInicial] = useState(lerSessaoSalva);
  const [usuario, setUsuario] = useState<Usuario | null>(sessaoInicial?.usuario ?? null);
  const [token, setToken] = useState<string | null>(sessaoInicial?.token ?? null);
  // A restauração acontece no estado inicial, então nunca há espera.
  const carregando = false;

  // ---- Se a API responder 401, a sessão caiu: derruba o usuário ----
  useEffect(() => {
    function aoExpirar() {
      setUsuario(null);
      setToken(null);
    }
    window.addEventListener('auth:expirado', aoExpirar);
    return () => window.removeEventListener('auth:expirado', aoExpirar);
  }, []);

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

  async function registrar(dados: DadosRegistro) {
    const resultado = await authApi.register(dados);
    return guardarSessao(resultado);
  }

  function logout() {
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
