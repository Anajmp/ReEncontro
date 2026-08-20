import { useEffect, useState, type ElementType, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LayoutDashboard, Package, Clock, AlertCircle, CheckCircle2, BarChart2, Users, PlusCircle, LogOut, ChevronRight } from 'lucide-react';
import type { Screen } from '../../App';
import { useAuth, iniciais } from '../../../contexts/AuthContext';
import Logo from '../../../assets/LogoInicial.png';

const navItems: { id: Screen; icon: ElementType; label: string }[] = [
  { id: 'admin-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'register-item', icon: PlusCircle, label: 'Cadastrar Item' },
  { id: 'available-items', icon: Package, label: 'Itens Disponíveis' },
  { id: 'pending-claims', icon: AlertCircle, label: 'Pendentes' },
  { id: 'in-process', icon: Clock, label: 'Em Processo' },
  { id: 'finalized', icon: CheckCircle2, label: 'Finalizados' },
  { id: 'reports', icon: BarChart2, label: 'Relatórios' },
  { id: 'staff-management', icon: Users, label: 'Gestão de Funcionárias' },
];

const easeOut = [0.22, 1, 0.36, 1] as const;

interface Props {
  children: ReactNode;
  current: Screen;
  navigate: (s: Screen) => void;
}

function Hamburger({ aberto }: { aberto: boolean }) {
  const bar = 'absolute left-1/2 top-1/2 h-[1.75px] w-[18px] -translate-x-1/2 rounded-full bg-gray-800';

  return (
    <span className="relative block size-5" aria-hidden>
      <span
        className={`${bar} transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]`}
        style={{ transform: aberto ? 'translate(-50%, -50%) rotate(45deg)' : 'translate(-50%, calc(-50% - 6px))' }}
      />
      <span
        className={`${bar} transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]`}
        style={{ opacity: aberto ? 0 : 1, transform: 'translate(-50%, -50%)', width: aberto ? 0 : 18 }}
      />
      <span
        className={`${bar} transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]`}
        style={{ transform: aberto ? 'translate(-50%, -50%) rotate(-45deg)' : 'translate(-50%, calc(-50% + 6px))' }}
      />
    </span>
  );
}

export function AdminLayout({ children, current, navigate }: Props) {
  const { usuario, logout } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);

  function fecharMenu() {
    setMenuAberto(false);
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
    if (!menuAberto) return;

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
  }, [menuAberto]);

  useEffect(() => {
    fecharMenu();
  }, [current]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F5F7]">
      <header className="sticky top-0 z-[60] h-16 shrink-0 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="flex h-full items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setMenuAberto(v => !v)}
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuAberto}
            aria-controls="admin-sidebar"
            className="inline-flex size-10 items-center justify-center rounded-lg text-gray-800 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8102E]/40"
          >
            <Hamburger aberto={menuAberto} />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <img src={Logo} alt="ReEncontro" className="h-10 w-auto shrink-0 object-contain sm:h-12" />
            <div className="hidden min-w-0 sm:block">
              <div className="truncate font-bold leading-tight text-gray-900">ReEncontro</div>
              <div className="text-[10px] leading-tight text-gray-400">Painel Administrativo</div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden text-right sm:block">
              <div className="max-w-[160px] truncate text-sm font-medium text-gray-900">{usuario?.nome ?? '—'}</div>
              <div className="max-w-[160px] truncate text-[11px] text-gray-400">{usuario?.email ?? ''}</div>
            </div>
            <div className="flex size-8 items-center justify-center rounded-full bg-[#C8102E]/10 text-xs font-semibold text-[#C8102E]">
              {iniciais(usuario?.nome)}
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuAberto && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-[2px]"
            onClick={fecharMenu}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuAberto && (
          <motion.aside
            key="sidebar"
            id="admin-sidebar"
            role="dialog"
            aria-modal="true"
            aria-label="Menu administrativo"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36, mass: 0.85 }}
            className="fixed top-16 bottom-0 left-0 z-50 flex w-[min(280px,86vw)] flex-col border-r border-gray-200 bg-white shadow-2xl"
          >
            <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
              {navItems.map((item, i) => {
                const Icon = item.icon;
                const isActive = current === item.id;
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    onClick={() => irPara(item.id)}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.035, duration: 0.32, ease: easeOut }}
                    className={`group flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-[#C8102E]/8 font-medium text-[#C8102E]'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`size-4 shrink-0 ${isActive ? 'text-[#C8102E]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && <ChevronRight className="size-3 text-[#C8102E]" />}
                  </motion.button>
                );
              })}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.3, ease: easeOut }}
              className="border-t border-gray-100 p-4"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#C8102E]/10 text-xs font-semibold text-[#C8102E]">
                  {iniciais(usuario?.nome)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-900">{usuario?.nome ?? '—'}</div>
                  <div className="truncate text-[11px] text-gray-400">{usuario?.email ?? ''}</div>
                </div>
                <button
                  type="button"
                  onClick={sair}
                  className="text-gray-300 transition-colors hover:text-[#C8102E]"
                  title="Sair"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="min-w-0 flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
