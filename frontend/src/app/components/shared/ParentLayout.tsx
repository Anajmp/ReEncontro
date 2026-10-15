import type { ReactNode } from 'react';
import type { Screen } from '../../App';
import { PARENT_FONT } from './ParentChrome';
import { SiteFooter, SiteHeader } from './SiteHeader';

interface Props {
  children: ReactNode;
  current: Screen;
  navigate: (s: Screen) => void;
}

/**
 * Área do responsável: mesmo header (com as abas) e rodapé da listagem
 * pública — só o conteúdo muda entre Meus pedidos, Meus alunos e Meu perfil.
 */
export function ParentLayout({ children, navigate }: Props) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#F5F3F0]" style={PARENT_FONT}>
      <SiteHeader navigate={navigate} />

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-8 sm:py-8">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
