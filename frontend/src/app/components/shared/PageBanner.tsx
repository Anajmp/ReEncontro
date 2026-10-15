import type { ElementType, ReactNode } from 'react';

/** Desenho decorativo do banner: manchas rosadas, brilhos e o ícone da página num círculo. */
export function BannerIlustracao({ Icon }: { Icon: ElementType }) {
  return (
    <div className="relative h-[148px] w-[210px] shrink-0" aria-hidden>
      <svg width="210" height="148" viewBox="0 0 210 148" fill="none" className="absolute inset-0">
        <ellipse cx="105" cy="74" rx="94" ry="66" fill="#FEE2E2" fillOpacity="0.45" />
        <ellipse cx="112" cy="68" rx="58" ry="44" fill="#FEE2E2" fillOpacity="0.28" />
        <circle cx="105" cy="74" r="43" fill="white" fillOpacity="0.84" />
        <circle cx="105" cy="74" r="43" stroke="#C8102E" strokeWidth="2.4" fill="none" />
        <path d="M28 27 L30.8 18.5 L33.5 27 L42 29.8 L33.5 32.5 L30.8 41 L28 32.5 L19.5 29.8Z" fill="#C8102E" fillOpacity="0.17" />
        <path d="M170 40 L172 35 L174 40 L179 42 L174 44 L172 49 L170 44 L165 42Z" fill="#C8102E" fillOpacity="0.14" />
        <circle cx="46" cy="122" r="5.5" fill="#FCA5A5" fillOpacity="0.52" />
        <circle cx="174" cy="117" r="3.8" fill="#FCA5A5" fillOpacity="0.44" />
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#9CA3AF]">
        <Icon size={38} strokeWidth={1.5} />
      </div>
    </div>
  );
}

/**
 * Banner branco do topo das páginas (mesmo visual do "Encontrou algo que é seu?"
 * da listagem): selo, título, texto, ação opcional e ilustração à direita.
 */
export function PageBanner({
  selo,
  titulo,
  children,
  acao,
  ilustracao,
}: {
  selo?: ReactNode;
  titulo: ReactNode;
  children?: ReactNode;
  acao?: ReactNode;
  ilustracao?: ReactNode;
}) {
  return (
    <div className="relative mb-5 overflow-hidden rounded-2xl border border-black/[0.05] bg-white shadow-sm sm:mb-8 sm:rounded-3xl">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(to left, rgba(254,226,226,0.4) 0%, transparent 55%)' }}
      />
      <div className="relative flex items-center justify-between gap-6 px-5 py-5 sm:px-8 sm:py-7">
        <div className="min-w-0 flex-1">
          {selo && (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-3 py-1 text-xs font-bold text-[#C8102E] sm:mb-4">
              <span className="size-1.5 animate-pulse rounded-full bg-[#C8102E]" />
              {selo}
            </div>
          )}
          <h1 className="mb-2 text-xl leading-tight font-extrabold text-[#1C1917] sm:text-2xl">{titulo}</h1>
          {children && <div className="max-w-md text-sm leading-relaxed text-[#78716C]">{children}</div>}
          {acao && <div className="mt-4">{acao}</div>}
        </div>
        {ilustracao && <div className="hidden md:block">{ilustracao}</div>}
      </div>
    </div>
  );
}

/** Estado vazio no mesmo estilo do "Nenhum item encontrado" da listagem. */
export function EstadoVazio({
  Icon,
  titulo,
  children,
  acao,
}: {
  Icon: ElementType;
  titulo: string;
  children?: ReactNode;
  acao?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-[#E7E5E4] bg-white shadow-sm">
        <Icon className="size-7 text-[#D4CFC9]" strokeWidth={1.2} />
      </div>
      <p className="mb-1 text-base font-bold text-[#1C1917]">{titulo}</p>
      {children && <p className="max-w-xs text-sm leading-relaxed text-[#A8A29E]">{children}</p>}
      {acao && <div className="mt-6">{acao}</div>}
    </div>
  );
}

/** Classes dos chips (mesmo estilo das categorias da listagem). */
export function chipClasses(ativo: boolean) {
  return `shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-150 ${
    ativo
      ? 'bg-[#C8102E] text-white shadow-sm shadow-[#C8102E]/20'
      : 'border border-[#E7E5E4] bg-white text-[#57534E] hover:border-[#C8102E]/30 hover:text-[#C8102E]'
  }`;
}

/** Card branco padrão (mesmo do card de filtros da listagem). */
export const CARD = 'rounded-2xl border border-black/[0.05] bg-white p-4 shadow-sm sm:p-5';

/** Botão principal vermelho. */
export const BOTAO_PRIMARIO =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8102E] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#A50D26] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60';
