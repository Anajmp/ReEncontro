import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';
import {
  LayoutDashboard, PlusCircle, Archive, Clock, RefreshCw,
  CheckCircle2, BarChart2, Users, LogOut, Menu, X, ShieldAlert, Globe, UserRound,
} from 'lucide-react';
import type { Screen } from '../../App';
import { useAuth } from '../../../contexts/AuthContext';
import { LupaMarca } from './LupaMarca';
import { ADMIN_FONT } from './estilos';
import { PAGE_INFO } from './paginasAdmin';
import { UserAvatar } from './UserAvatar';
import { BotaoTema } from './BotaoTema';
import { BannerIlustracao, PageBanner } from './PageBanner';
import { CONTEUDO_ID } from '../../../lib/acessibilidade';

type NavItem = { id: Screen; label: string; Icon: ElementType };
type NavSecao = { titulo?: string; itens: NavItem[] };

const SITE: NavSecao = {
  itens: [{ id: 'public-listing', label: 'Ver site público', Icon: Globe }],
};

const OPERACAO: NavSecao = {
  titulo: 'Operação',
  itens: [
    { id: 'admin-dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { id: 'register-item', label: 'Cadastrar Item', Icon: PlusCircle },
    { id: 'available-items', label: 'Itens Disponíveis', Icon: Archive },
    { id: 'pending-claims', label: 'Pendentes', Icon: Clock },
    { id: 'in-process', label: 'Em Processo', Icon: RefreshCw },
    { id: 'finalized', label: 'Finalizados', Icon: CheckCircle2 },
  ],
};

const GESTAO: NavSecao = {
  titulo: 'Gestão',
  itens: [
    { id: 'reports', label: 'Relatórios', Icon: BarChart2 },
    { id: 'staff-management', label: 'Gestão de Funcionárias', Icon: Users },
    { id: 'lgpd', label: 'Privacidade (LGPD)', Icon: ShieldAlert },
  ],
};

const PESSOAL: NavSecao = {
  titulo: 'Pessoal',
  itens: [{ id: 'admin-profile', label: 'Minha conta', Icon: UserRound }],
};

/** Cada perfil tem o seu sidebar: a diretora vê também as seções de gestão e pessoal. */
const PERFIS = {
  diretora: { rotulo: 'Diretora', painel: 'Painel da Diretora', secoes: [SITE, OPERACAO, GESTAO, PESSOAL] },
  inspetora: { rotulo: 'Inspetora', painel: 'Painel da Inspetora', secoes: [SITE, OPERACAO] },
} as const;

type Perfil = (typeof PERFIS)[keyof typeof PERFIS];

function iconeDaTela(tela: Screen): ElementType {
  for (const secao of [OPERACAO, GESTAO, PESSOAL]) {
    const item = secao.itens.find(i => i.id === tela);
    if (item) return item.Icon;
  }
  return LayoutDashboard;
}

interface Props {
  children: ReactNode;
  current: Screen;
  navigate: (s: Screen) => void;
}

function AdminLogo({ painel }: { painel: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <LupaMarca size={32} />
      <div>
        <p className="text-[1rem] leading-tight font-bold tracking-tight text-tinta">
          Re<span className="text-marca-texto">Encontro</span>
        </p>
        <p className="-mt-0.5 text-[10px] leading-none font-medium text-tinta-suave">{painel}</p>
      </div>
    </div>
  );
}

function SeloPerfil({ perfil, ehDiretora }: { perfil: Perfil; ehDiretora: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
        ehDiretora ? 'bg-marca-clara text-marca-texto' : 'bg-fundo text-tinta-media'
      }`}
    >
      {perfil.rotulo}
    </span>
  );
}

export function AdminLayout({ children, current, navigate }: Props) {
  const { usuario, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const botaoMenuRef = useRef<HTMLButtonElement>(null);
  const botaoFecharRef = useRef<HTMLButtonElement>(null);
  const ehDiretora = Boolean(usuario?.is_diretora);
  const perfil: Perfil = ehDiretora ? PERFIS.diretora : PERFIS.inspetora;
  const info = PAGE_INFO[current] ?? { title: 'Admin', subtitle: '' };

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
    // Teclado: o foco entra no menu ao abrir e volta ao botão ao fechar
    botaoFecharRef.current?.focus();
    const sidebar = sidebarRef.current;
    const botaoMenu = botaoMenuRef.current;
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = original;
      if (sidebar?.contains(document.activeElement)) botaoMenu?.focus();
    };
  }, [sidebarOpen]);

  // Fecha o menu quando a tela muda (ajuste durante o render, sem efeito)
  const [telaAnterior, setTelaAnterior] = useState(current);
  if (current !== telaAnterior) {
    setTelaAnterior(current);
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-fundo" style={ADMIN_FONT}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={fecharMenu}
          aria-hidden
        />
      )}

      <aside
        ref={sidebarRef}
        id="menu-admin"
        className={`fixed top-0 left-0 z-30 flex h-full w-[270px] flex-col border-r border-linha bg-superficie transition-[transform,visibility] duration-300 ease-in-out ${
          sidebarOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'
        } lg:visible lg:translate-x-0`}
        aria-label={perfil.painel}
      >
        <div className="flex h-16 items-center justify-between border-b border-linha px-5">
          <AdminLogo painel={perfil.painel} />
          <button
            ref={botaoFecharRef}
            type="button"
            onClick={fecharMenu}
            className="flex size-7 items-center justify-center rounded-lg text-tinta-suave transition-colors hover:text-marca-texto lg:hidden"
            aria-label="Fechar menu"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Menu principal">
          {perfil.secoes.map((secao, i) => (
            <div key={secao.titulo ?? i} className={i > 0 ? 'mt-4' : ''}>
              {secao.titulo && (
                <p className="mb-1.5 px-3 text-[10px] font-bold tracking-wider text-tinta-suave uppercase">
                  {secao.titulo}
                </p>
              )}
              {secao.itens.map(({ id, label, Icon }) => {
                const ativo = current === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => irPara(id)}
                    aria-current={ativo ? 'page' : undefined}
                    className={`relative mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-150 ${
                      ativo ? 'bg-marca-clara text-marca-texto' : 'text-tinta hover:bg-fundo'
                    }`}
                  >
                    <Icon
                      size={17}
                      strokeWidth={ativo ? 2 : 1.7}
                      className={ativo ? 'text-marca-texto' : 'text-tinta-suave'}
                    />
                    <span className="flex-1">{label}</span>
                    {ativo && (
                      <div className="absolute top-1/2 right-0 h-6 w-1 -translate-y-1/2 rounded-l-full bg-[#C8102E]" aria-hidden />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-linha p-4">
          <div className="flex items-center gap-3">
            <UserAvatar usuario={usuario} size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-tinta">{usuario?.nome ?? '—'}</p>
              <SeloPerfil perfil={perfil} ehDiretora={ehDiretora} />
            </div>
            <button
              type="button"
              onClick={sair}
              className="flex size-8 items-center justify-center rounded-lg text-tinta-suave transition-all hover:bg-marca-clara hover:text-marca-texto"
              title="Sair"
              aria-label="Sair"
            >
              <LogOut size={15} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-[270px]">
        <header className="sticky top-0 z-20 border-b border-linha bg-superficie">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                ref={botaoMenuRef}
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-expanded={sidebarOpen}
                aria-controls="menu-admin"
                className="flex size-9 items-center justify-center rounded-xl bg-fundo text-tinta-suave transition-colors hover:text-marca-texto lg:hidden"
                aria-label="Abrir menu"
              >
                <Menu size={18} strokeWidth={1.8} />
              </button>
              <p className="truncate text-sm text-tinta-suave">
                <span className="hidden sm:inline">{perfil.painel} · </span>
                <span className="font-semibold text-tinta">{info.title}</span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <BotaoTema />
              <div className="hidden text-right sm:block">
                <p className="max-w-[160px] truncate text-sm font-semibold text-tinta">{usuario?.nome ?? '—'}</p>
                <p className="max-w-[160px] truncate text-xs text-tinta-suave">{usuario?.email ?? ''}</p>
              </div>
              <UserAvatar usuario={usuario} size={36} />
            </div>
          </div>
        </header>

        <main id={CONTEUDO_ID} tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 overflow-x-hidden px-4 py-5 outline-none sm:px-8 sm:py-8">
          <PageBanner
            selo={perfil.painel}
            titulo={info.title}
            ilustracao={<BannerIlustracao Icon={iconeDaTela(current)} />}
          >
            {info.subtitle}
          </PageBanner>
          {children}
        </main>
      </div>
    </div>
  );
}
