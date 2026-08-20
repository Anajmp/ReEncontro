import { useEffect, useState, type ElementType, type ReactNode } from 'react';
import {
  FileText, GraduationCap, User, LogOut, ArrowLeft, Menu, X,
} from 'lucide-react';
import type { Screen } from '../../App';
import { useAuth, iniciais } from '../../../contexts/AuthContext';
import { LupaMarca } from './LupaMarca';
import { PARENT_FONT } from './ParentChrome';

const NAV_ITEMS: { id: Screen; label: string; Icon: ElementType }[] = [
  { id: 'parent-dashboard', label: 'Minhas Reivindicações', Icon: FileText },
  { id: 'my-students', label: 'Meus Alunos', Icon: GraduationCap },
  { id: 'parent-profile', label: 'Meu Perfil', Icon: User },
];

interface Props {
  children: ReactNode;
  current: Screen;
  navigate: (s: Screen) => void;
}

function ParentLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <LupaMarca size={30} />
      <div>
        <p className="text-[1rem] leading-tight font-bold tracking-tight text-[#1C1917]">
          Re<span className="text-[#C8102E]">Encontro</span>
        </p>
        <p className="mt-0.5 text-[10px] leading-none font-medium text-[#A8A29E]">Área do Responsável</p>
      </div>
    </div>
  );
}

function SidebarContent({
  current,
  navigate,
  onClose,
}: {
  current: Screen;
  navigate: (s: Screen) => void;
  onClose?: () => void;
}) {
  const { usuario, logout } = useAuth();

  function irPara(tela: Screen) {
    onClose?.();
    navigate(tela);
  }

  function sair() {
    logout();
    onClose?.();
    navigate('login');
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#E7E5E4] px-5 pt-6 pb-5">
        <div className="flex items-center justify-between gap-2">
          <ParentLogo />
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-lg text-[#78716C] transition-colors hover:text-[#C8102E] lg:hidden"
              aria-label="Fechar menu"
            >
              <X size={16} strokeWidth={1.8} />
            </button>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <button
          type="button"
          onClick={() => irPara('public-listing')}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#78716C] transition-all hover:bg-[#F5F3F0] hover:text-[#1C1917]"
        >
          <ArrowLeft size={18} strokeWidth={1.6} className="text-[#A8A29E] transition-colors group-hover:text-[#78716C]" />
          Itens Disponíveis
        </button>

        <div className="my-2 h-px bg-[#E7E5E4]" />

        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = current === id;
          return (
            <div key={id} className="relative">
              <button
                type="button"
                onClick={() => irPara(id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? 'bg-[#FEE2E2] text-[#C8102E]'
                    : 'text-[#1C1917] hover:bg-[#F5F3F0]'
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={1.6}
                  className={active ? 'text-[#C8102E]' : 'text-[#78716C]'}
                />
                {label}
              </button>
              {active && (
                <div className="absolute top-1/2 right-0 h-6 w-1 -translate-y-1/2 rounded-l-full bg-[#C8102E]" />
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-[#E7E5E4] px-4 py-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2]">
            <span className="text-xs font-extrabold text-[#C8102E]">{iniciais(usuario?.nome)}</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#1C1917]">{usuario?.nome ?? '—'}</p>
            <p className="truncate text-xs text-[#A8A29E]">{usuario?.email ?? ''}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={sair}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#78716C] transition-all hover:bg-[#FFF1F2] hover:text-[#C8102E]"
        >
          <LogOut size={15} strokeWidth={1.6} />
          Sair da conta
        </button>
      </div>
    </div>
  );
}

export function ParentLayout({ children, current, navigate }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setDrawerOpen(false);
    }
    document.addEventListener('keydown', onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = original;
    };
  }, [drawerOpen]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [current]);

  return (
    <div className="flex min-h-screen bg-[#F5F3F0]" style={PARENT_FONT}>
      <aside className="fixed top-0 left-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#E7E5E4] bg-white lg:flex">
        <SidebarContent current={current} navigate={navigate} />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <aside className="relative z-50 flex h-full w-72 flex-col bg-white shadow-xl">
            <SidebarContent
              current={current}
              navigate={navigate}
              onClose={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-[#E7E5E4] bg-white px-5 py-4 lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex size-9 items-center justify-center rounded-xl bg-[#F5F3F0] text-[#78716C]"
            aria-label="Abrir menu"
          >
            <Menu size={18} strokeWidth={1.8} />
          </button>
          <ParentLogo />
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-7 sm:px-8 lg:mx-0">
          {children}
        </main>
      </div>
    </div>
  );
}
