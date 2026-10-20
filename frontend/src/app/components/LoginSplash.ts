// =====================================================================
// Contexto e hook da transição "entrar pela lupa" (Login / Cadastro).
// O componente <LoginSplashProvider> fica em ./LoginSplashProvider.tsx;
// separados para não quebrar o fast refresh do Vite.
// =====================================================================
import { createContext, useContext, type MouseEvent as ReactMouseEvent } from 'react';

export type Origem = ReactMouseEvent<HTMLElement> | null | undefined;

interface LoginSplashContextValue {
  /** Aceita o evento de clique para a lupa sair do próprio botão. */
  playLoginTransition: (e?: Origem) => void;
  playCadastroTransition: (e?: Origem) => void;
}

export const LoginSplashContext = createContext<LoginSplashContextValue | null>(null);

export function useLoginSplash() {
  const ctx = useContext(LoginSplashContext);
  if (!ctx) {
    throw new Error('useLoginSplash precisa estar dentro de LoginSplashProvider');
  }
  return ctx;
}
