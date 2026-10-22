import type { ElementType } from "react";
import { useLocation } from "react-router-dom";
import {
  GraduationCap,
  Home,
  LogIn,
  LogOut,
  Package,
  UserRound,
} from "lucide-react";
import type { Screen } from "../../App";
import { logout } from "../../../lib/auth";
import { useAuth } from "../../../contexts/AuthContext";
import { useLoginSplash } from "../LoginSplash";
import { UserAvatar } from "./UserAvatar";
import { BotaoTema } from "./BotaoTema";

const FONT = { fontFamily: "Plus Jakarta Sans, sans-serif" };

export function SiteLogo() {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <svg
        width="34"
        height="34"
        viewBox="0 0 34 34"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <circle
          cx="14"
          cy="14"
          r="9.5"
          stroke="#C8102E"
          strokeWidth="2.3"
          fill="none"
        />
        <path
          d="M21.5 21.5 L30 30"
          stroke="#C8102E"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
        <circle cx="8.5" cy="8.5" r="1.7" fill="#C8102E" fillOpacity="0.38" />
        <circle cx="20.5" cy="8" r="1.1" fill="#C8102E" fillOpacity="0.28" />
        <circle cx="22" cy="21" r="0.9" fill="#C8102E" fillOpacity="0.32" />
        <circle cx="7" cy="21" r="1.3" fill="#C8102E" fillOpacity="0.2" />
      </svg>
      <div className="min-w-0">
        <p
          className="truncate text-[1.15rem] font-bold tracking-tight text-tinta"
          style={FONT}
        >
          Re<span className="text-marca-texto">Encontro</span>
        </p>
        <p className="hidden truncate text-[11px] font-medium tracking-wide text-tinta-suave uppercase sm:block">
          SESI Nova Odessa
        </p>
      </div>
    </div>
  );
}

const ABAS_RESPONSAVEL: {
  id: Screen;
  label: string;
  Icon: ElementType;
  ativa: (path: string) => boolean;
}[] = [
  {
    id: "public-listing",
    label: "Início",
    Icon: Home,
    ativa: (p) => p === "/" || p.startsWith("/item"),
  },
  {
    id: "parent-dashboard",
    label: "Reivindicações",
    Icon: Package,
    ativa: (p) => p.startsWith("/responsavel/reivindicacoes"),
  },
  {
    id: "my-students",
    label: "Meus alunos",
    Icon: GraduationCap,
    ativa: (p) => p.startsWith("/responsavel/alunos"),
  },
  {
    id: "parent-profile",
    label: "Meu perfil",
    Icon: UserRound,
    ativa: (p) => p.startsWith("/responsavel/perfil"),
  },
];

/**
 * Abas de navegação exibidas para o responsável logado.
 * `inline`: dentro da linha do header (telas grandes), com altura cheia
 * para o sublinhado encostar na borda; senão, linha própria com as abas
 * dividindo a largura (no celular, ícone em cima e rótulo embaixo).
 */
function AbasResponsavel({
  navigate,
  inline = false,
}: {
  navigate: (s: Screen) => void;
  inline?: boolean;
}) {
  const { pathname } = useLocation();

  return (
    <nav
      className={
        inline
          ? "flex h-full items-stretch gap-1"
          : "mx-auto flex max-w-6xl px-1 sm:px-6"
      }
      aria-label="Navegação do responsável"
    >
      {ABAS_RESPONSAVEL.map(({ id, label, Icon, ativa }) => {
        const ativo = ativa(pathname);
        return (
          <button
            key={id}
            type="button"
            onClick={() => navigate(id)}
            aria-current={ativo ? "page" : undefined}
            className={`relative flex items-center font-semibold transition-colors ${
              inline
                ? "shrink-0 gap-2 px-3 text-sm"
                : "min-w-0 flex-1 flex-col justify-center gap-1 px-1 py-2 text-[11px] sm:flex-row sm:gap-2 sm:py-3 sm:text-sm"
            } ${ativo ? "text-marca-texto" : "text-tinta-suave hover:text-tinta"}`}
          >
            <Icon
              className="size-[18px] shrink-0"
              strokeWidth={ativo ? 2.2 : 1.7}
              fill={ativo && id === "public-listing" ? "currentColor" : "none"}
            />
            <span className="truncate">{label}</span>
            {ativo && (
              <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t-full bg-[#C8102E]" aria-hidden />
            )}
          </button>
        );
      })}
    </nav>
  );
}

/** Header público compartilhado (listagem e detalhe do item). */
export function SiteHeader({ navigate }: { navigate: (s: Screen) => void }) {
  // Vem do contexto (e não do localStorage) para o aviso de e-mail sumir
  // assim que a verificação termina, sem recarregar a página.
  const { usuario } = useAuth();
  const { playLoginTransition } = useLoginSplash();
  const ehResponsavel = usuario?.role === "responsavel";
  // null = não verificado. undefined (sessão antiga) não mostra aviso.
  const emailNaoVerificado = ehResponsavel && usuario?.email_verificado_em === null;

  return (
    <header className="sticky top-0 z-20 border-b border-linha bg-superficie">
      {/* Três colunas (1fr · auto · 1fr): as abas ficam no centro exato do header */}
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto] items-center gap-3 px-4 sm:px-8 lg:grid-cols-[1fr_auto_1fr]">
        <button
          type="button"
          onClick={() => navigate("public-listing")}
          className="min-w-0 justify-self-start rounded-lg text-left transition-opacity hover:opacity-80"
          aria-label="ReEncontro — ir para a listagem"
        >
          <SiteLogo />
        </button>

        <div className="hidden h-full lg:block">
          {ehResponsavel && <AbasResponsavel navigate={navigate} inline />}
        </div>

        {usuario ? (
          <div className="flex shrink-0 items-center gap-2 justify-self-end">
            <BotaoTema />
            <button
              type="button"
              onClick={() =>
                navigate(
                  usuario.role === "funcionaria"
                    ? "admin-dashboard"
                    : "parent-profile",
                )
              }
              aria-label={`${usuario.nome.split(" ")[0]} — seu perfil${
                emailNaoVerificado ? ". E-mail não verificado: verificar e-mail" : ""
              }`}
              title={emailNaoVerificado ? "Verificar e-mail" : undefined}
              className="flex items-center gap-2.5 rounded-full border border-linha bg-campo py-1 pr-1 pl-1 text-sm font-semibold text-tinta shadow-sm transition-all hover:border-[#C8102E]/30 hover:bg-superficie hover:shadow sm:pr-4"
            >
              <span className="relative shrink-0">
                <UserAvatar
                  usuario={usuario}
                  size={30}
                  className="ring-2 ring-superficie"
                />
                {emailNaoVerificado && (
                  // No celular o texto some; o ponto vermelho mantém o aviso visível
                  <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-[#C8102E] ring-2 ring-superficie sm:hidden" />
                )}
              </span>
              <span className="hidden min-w-0 flex-col items-start text-left leading-tight sm:flex">
                <span className="max-w-[180px] truncate">
                  {usuario.nome.split(" ")[0]}
                </span>
                <span
                  className={`flex items-center gap-1 text-[11px] font-medium ${
                    emailNaoVerificado ? "text-marca-texto" : "text-tinta-suave"
                  }`}
                >
                  <span className="max-w-[160px] truncate">{usuario.email}</span>
                  {emailNaoVerificado && (
                    <span className="shrink-0 font-bold underline underline-offset-2">
                      Verificar e-mail
                    </span>
                  )}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                // Recarrega já na listagem: nas áreas protegidas o reload cairia no login
                window.location.assign("/");
              }}
              className="flex size-9 items-center justify-center rounded-full text-tinta-suave transition-colors hover:bg-marca-clara hover:text-marca-texto"
              title="Sair"
              aria-label="Sair"
            >
              <LogOut className="size-4" strokeWidth={1.8} />
            </button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-1 justify-self-end">
            <BotaoTema />
            <button
              type="button"
              onClick={playLoginTransition}
              className="flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold text-tinta-suave transition-colors hover:bg-fundo hover:text-marca-texto"
            >
              <LogIn className="size-4" />
              Entrar
            </button>
          </div>
        )}
      </div>
      {ehResponsavel && (
        <div className="border-t border-fundo lg:hidden">
          <AbasResponsavel navigate={navigate} />
        </div>
      )}
    </header>
  );
}

/** Rodapé compartilhado das páginas com o SiteHeader. */
export function SiteFooter() {
  return (
    <footer className="mx-auto mt-12 flex w-full max-w-6xl flex-col items-center justify-between gap-1.5 border-t border-linha px-4 pt-5 pb-8 text-center text-xs text-tinta-suave sm:flex-row sm:px-8 sm:text-left">
      <span className="font-medium">
        ReEncontro — Sistema de Achados e Perdidos · SESI Nova Odessa
      </span>
      <span>Dúvidas? Procure a inspetora na recepção.</span>
    </footer>
  );
}
