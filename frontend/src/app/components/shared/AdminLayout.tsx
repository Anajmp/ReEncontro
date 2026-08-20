import { useEffect, useState, type ElementType, type ReactNode } from 'react';
import {
  LayoutDashboard, PlusCircle, Archive, Clock, RefreshCw,
  CheckCircle2, BarChart2, Users, LogOut, Menu, X,
} from 'lucide-react';
import type { Screen } from '../../App';
import { useAuth, iniciais } from '../../../contexts/AuthContext';
import { LupaMarca } from './LupaMarca';
import {
  ADMIN_FONT, AdminAvatar, PAGE_INFO,
} from './AdminChrome';

const NAV_ITEMS: {
  id: Screen;
  label: string;
  Icon: ElementType;
  adminOnly?: boolean;
}[] = [
  { id: 'admin-dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'register-item', label: 'Cadastrar Item', Icon: PlusCircle },
  { id: 'available-items', label: 'Itens Disponíveis', Icon: Archive },
  { id: 'pending-claims', label: 'Pendentes', Icon: Clock },
  { id: 'in-process', label: 'Em Processo', Icon: RefreshCw },
  { id: 'finalized', label: 'Finalizados', Icon: CheckCircle2 },
  { id: 'reports', label: 'Relatórios', Icon: BarChart2 },
  { id: 'staff-management', label: 'Gestão de Funcionárias', Icon: Users, adminOnly: true },
];

interface Props {
  children: ReactNode;
  current: Screen;
  navigate: (s: Screen) => void;
}

function AdminLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <LupaMarca size={32} />
      <div>
        <p className="text-[1rem] font-bold leading-tight tracking-tight text-[#1C1917]">
          Re<span className="text-[#C8102E]">Encontro</span>
        </p>
        <p className="-mt-0.5 text-[10px] font-medium leading-none text-[#78716C]">Painel Administrativo</p>
      </div>
    </div>
  );
}

function AdminHeader({
  current,
  onMenuClick,
  nome,
  email,
  initials,
}: {
  current: Screen;
  onMenuClick: () => void;
  nome: string;
  email: string;
  initials: string;
}) {
  const info = PAGE_INFO[current] ?? { title: 'Admin', subtitle: '' };
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[#E7E5E4] bg-white px-6 py-4">
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex size-8 items-center justify-center rounded-lg text-[#78716C] transition-colors hover:text-[#C8102E] lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu size={18} strokeWidth={1.8} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold leading-tight text-[#1C1917]">{info.title}</h1>
          {info.subtitle ? (
            <p className="hidden truncate text-xs text-[#78716C] sm:block">{info.subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="max-w-[160px] truncate text-sm font-semibold text-[#1C1917]">{nome}</p>
          <p className="max-w-[160px] truncate text-xs text-[#78716C]">{email}</p>
        </div>
        <AdminAvatar initials={initials} size={36} />
      </div>
    </header>
  );
}

export function AdminLayout({ children, current, navigate }: Props) {
  const { usuario, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDirectora = Boolean(usuario?.is_diretora);

  function fecharMenu() {
    setSidebarOpen(false);
  }

  function sair() {
    logout();
    fecharMenu();
    navigate('login');
  }

  function irPara(tela: Screen) {
    fecharMenu();
    navigate(tela);
  }

  useEffect(() => {
    if (!sidebarOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') fecharMenu();
    }
    document.addEventListener('keydown', onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = original;
    };
  }, [sidebarOpen]);

  useEffect(() => {
    fecharMenu();
  }, [current]);

  const userInitials = iniciais(usuario?.nome);

  return (
    <div className="min-h-screen bg-[#F5F3F0]" style={ADMIN_FONT}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={fecharMenu}
          aria-hidden
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-30 flex h-full w-[270px] flex-col border-r border-[#E7E5E4] bg-white transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between border-b border-[#E7E5E4] px-5 py-5">
          <AdminLogo />
          <button
            type="button"
            onClick={fecharMenu}
            className="flex size-7 items-center justify-center rounded-lg text-[#78716C] transition-colors hover:text-[#C8102E] lg:hidden"
            aria-label="Fechar menu"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {NAV_ITEMS.map(({ id, label, Icon, adminOnly }) => {
            if (adminOnly && !isDirectora) return null;
            const isActive = current === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => irPara(id)}
                className={`relative mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#FEE2E2] text-[#C8102E]'
                    : 'text-[#1C1917] hover:bg-[#F5F3F0]'
                }`}
              >
                <Icon
                  size={17}
                  strokeWidth={isActive ? 2 : 1.7}
                  className={isActive ? 'text-[#C8102E]' : 'text-[#78716C]'}
                />
                <span className="flex-1">{label}</span>
                {isActive && (
                  <div className="absolute top-1/2 right-0 h-6 w-1 -translate-y-1/2 rounded-l-full bg-[#C8102E]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[#E7E5E4] p-4">
          <div className="flex items-center gap-3">
            <AdminAvatar initials={userInitials} size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#1C1917]">{usuario?.nome ?? '—'}</p>
              <p className="truncate text-xs text-[#78716C]">{usuario?.email ?? ''}</p>
            </div>
            <button
              type="button"
              onClick={sair}
              className="flex size-8 items-center justify-center rounded-lg text-[#A8A29E] transition-all hover:bg-[#FEE2E2] hover:text-[#C8102E]"
              title="Sair"
            >
              <LogOut size={15} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:ml-[270px]">
        <AdminHeader
          current={current}
          onMenuClick={() => setSidebarOpen(true)}
          nome={usuario?.nome ?? '—'}
          email={usuario?.email ?? ''}
          initials={userInitials}
        />
        <main className="flex-1 overflow-auto p-5 sm:p-7">{children}</main>
      </div>
    </div>
  );
}
