import type { ElementType } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, LogIn, LogOut, Package, UserRound } from 'lucide-react';
import type { Screen } from '../../App';
import { getUsuario, logout } from '../../../lib/auth';
import { useLoginSplash } from '../LoginSplash';
import { UserAvatar } from './UserAvatar';

const FONT = { fontFamily: 'Plus Jakarta Sans, sans-serif' };

export function SiteLogo() {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden className="shrink-0">
        <circle cx="14" cy="14" r="9.5" stroke="#C8102E" strokeWidth="2.3" fill="none" />
        <path d="M21.5 21.5 L30 30" stroke="#C8102E" strokeWidth="2.3" strokeLinecap="round" />
        <circle cx="8.5" cy="8.5" r="1.7" fill="#C8102E" fillOpacity="0.38" />
        <circle cx="20.5" cy="8" r="1.1" fill="#C8102E" fillOpacity="0.28" />
        <circle cx="22" cy="21" r="0.9" fill="#C8102E" fillOpacity="0.32" />
        <circle cx="7" cy="21" r="1.3" fill="#C8102E" fillOpacity="0.2" />
      </svg>
      <div className="min-w-0">
        <p className="truncate text-[1.15rem] font-bold tracking-tight text-[#1C1917]" style={FONT}>
          Re<span className="text-[#C8102E]">Encontro</span>
        </p>
        <p className="hidden truncate text-[11px] font-medium tracking-wide text-[#A8A29E] uppercase sm:block">
          SESI Nova Odessa
        </p>
      </div>
    </div>
  );
}

const ABAS_RESPONSAVEL: { id: Screen; label: string; Icon: ElementType; ativa: (path: string) => boolean }[] = [
  { id: 'public-listing', label: 'Início', Icon: Home, ativa: p => p === '/' || p.startsWith('/item') },
  { id: 'parent-dashboard', label: 'Meus pedidos', Icon: Package, ativa: p => p.startsWith('/responsavel/reivindicacoes') || p.startsWith('/responsavel/alunos') },
  { id: 'parent-profile', label: 'Meu perfil', Icon: UserRound, ativa: p => p.startsWith('/responsavel/perfil') },
];

/**
 * Abas de navegação exibidas para o responsável logado.
 * `inline`: dentro da linha do header (telas médias+), com altura cheia
 * para o sublinhado encostar na borda; senão, linha própria (celular).
 */
function AbasResponsavel({ navigate, inline = false }: { navigate: (s: Screen) => void; inline?: boolean }) {
  const { pathname } = useLocation();

  return (
    <nav
      className={inline
        ? 'flex h-full items-stretch gap-1'
        : 'mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 scrollbar-hide sm:px-6'}
      aria-label="Navegação do responsável"
    >
      {ABAS_RESPONSAVEL.map(({ id, label, Icon, ativa }) => {
        const ativo = ativa(pathname);
        return (
          <button
            key={id}
            type="button"
            onClick={() => navigate(id)}
            aria-current={ativo ? 'page' : undefined}
            className={`relative flex shrink-0 items-center gap-2 px-3 text-sm font-semibold transition-colors ${inline ? '' : 'py-3'} ${
              ativo ? 'text-[#C8102E]' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Icon className="size-[18px]" strokeWidth={ativo ? 2.2 : 1.7} fill={ativo && id === 'public-listing' ? 'currentColor' : 'none'} />
            {label}
            {ativo && <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t-full bg-[#C8102E]" />}
          </button>
        );
      })}
    </nav>
  );
}

/** Header público compartilhado (listagem e detalhe do item). */
export function SiteHeader({ navigate }: { navigate: (s: Screen) => void }) {
  const usuario = getUsuario();
  const { playLoginTransition } = useLoginSplash();
  const ehResponsavel = usuario?.role === 'responsavel';

  return (
    <header className="sticky top-0 z-20 border-b border-[#E7E5E4] bg-white">
      {/* Três colunas (1fr · auto · 1fr): as abas ficam no centro exato do header */}
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto] items-center gap-3 px-5 sm:px-8 md:grid-cols-[1fr_auto_1fr]">
        <button
          type="button"
          onClick={() => navigate('public-listing')}
          className="min-w-0 justify-self-start text-left transition-opacity hover:opacity-80"
          aria-label="Ir para a listagem"
        >
          <SiteLogo />
        </button>

        <div className="hidden h-full md:block">
          {ehResponsavel && <AbasResponsavel navigate={navigate} inline />}
        </div>

        {usuario ? (
          <div className="flex shrink-0 items-center gap-2 justify-self-end">
            <button
              type="button"
              onClick={() => navigate(usuario.role === 'funcionaria' ? 'admin-dashboard' : 'parent-dashboard')}
              className="flex items-center gap-2.5 rounded-full border border-[#E7E5E4] bg-[#FAFAF8] py-1 pr-3.5 pl-1 text-sm font-semibold text-[#1C1917] shadow-sm transition-all hover:border-[#C8102E]/30 hover:bg-white hover:shadow"
            >
              <UserAvatar
                usuario={usuario}
                size={30}
                className="ring-2 ring-white"
              />
              <span className="hidden max-w-[120px] truncate sm:inline">{usuario.nome.split(' ')[0]}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                window.location.reload();
              }}
              className="flex size-9 items-center justify-center rounded-full text-[#A8A29E] transition-colors hover:bg-[#FEE2E2] hover:text-[#C8102E]"
              title="Sair"
              aria-label="Sair"
            >
              <LogOut className="size-4" strokeWidth={1.8} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={playLoginTransition}
            className="flex items-center gap-2 justify-self-end rounded-full px-3.5 py-2 text-sm font-semibold text-[#78716C] transition-colors hover:bg-[#F5F3F0] hover:text-[#C8102E]"
          >
            <LogIn className="size-4" />
            Entrar
          </button>
        )}
      </div>
      {ehResponsavel && (
        <div className="border-t border-[#F5F3F0] md:hidden">
          <AbasResponsavel navigate={navigate} />
        </div>
      )}
    </header>
  );
}
