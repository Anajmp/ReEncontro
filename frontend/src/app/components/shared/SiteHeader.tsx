import { LogIn, LogOut } from 'lucide-react';
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

/** Header público compartilhado (listagem e detalhe do item). */
export function SiteHeader({ navigate }: { navigate: (s: Screen) => void }) {
  const usuario = getUsuario();
  const { playLoginTransition } = useLoginSplash();

  return (
    <header className="sticky top-0 z-20 border-b border-[#E7E5E4] bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
        <button
          type="button"
          onClick={() => navigate('public-listing')}
          className="min-w-0 text-left transition-opacity hover:opacity-80"
          aria-label="Ir para a listagem"
        >
          <SiteLogo />
        </button>

        {usuario ? (
          <div className="flex shrink-0 items-center gap-2">
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
            className="flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold text-[#78716C] transition-colors hover:bg-[#F5F3F0] hover:text-[#C8102E]"
          >
            <LogIn className="size-4" />
            Entrar
          </button>
        )}
      </div>
    </header>
  );
}
