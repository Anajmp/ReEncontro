import { useId, type ElementType, type ReactNode } from 'react';

const VERMELHO = '#C8102E';
const RAIO_LENTE = 44;

/**
 * Desenho decorativo do banner: manchas rosadas, brilhos e a mesma lupa da
 * tela de carregamento (armação grossa, reflexo no vidro, cabo e sombra).
 * Dentro do vidro vai o ícone da página num chip, ou um conteúdo próprio
 * (`children`, em coordenadas relativas ao centro da lente).
 */
export function BannerIlustracao({ Icon, children }: { Icon?: ElementType; children?: ReactNode }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width="210" height="148" viewBox="0 0 210 148" fill="none" aria-hidden className="shrink-0">
      <defs>
        <filter id={`sombra-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#7F1D1D" floodOpacity="0.16" />
        </filter>
      </defs>
      <ellipse cx="105" cy="74" rx="94" ry="66" style={{ fill: 'var(--re-marca-clara)' }} fillOpacity="0.45" />
      <ellipse cx="112" cy="68" rx="58" ry="44" style={{ fill: 'var(--re-marca-clara)' }} fillOpacity="0.28" />
      <path d="M28 27 L30.8 18.5 L33.5 27 L42 29.8 L33.5 32.5 L30.8 41 L28 32.5 L19.5 29.8Z" fill={VERMELHO} fillOpacity="0.17" />
      <path d="M170 40 L172 35 L174 40 L179 42 L174 44 L172 49 L170 44 L165 42Z" fill={VERMELHO} fillOpacity="0.14" />
      <circle cx="46" cy="122" r="5.5" fill="#FCA5A5" fillOpacity="0.52" />
      <circle cx="174" cy="117" r="3.8" fill="#FCA5A5" fillOpacity="0.44" />

      <g transform="translate(96 66)">
        {/* Vidro e conteúdo */}
        <circle r={RAIO_LENTE - 3} style={{ fill: 'var(--re-superficie)' }} fillOpacity="0.92" />
        {children ?? (Icon && (
          <>
            <circle r="25" style={{ fill: 'var(--re-marca-clara)' }} />
            <Icon x={-15} y={-15} width={30} height={30} color={VERMELHO} strokeWidth={1.7} />
          </>
        ))}

        {/* Armação */}
        <g filter={`url(#sombra-${id})`}>
          <path d="M32 32 L62 62" stroke={VERMELHO} strokeWidth="10" strokeLinecap="round" />
          <circle r={RAIO_LENTE} fill="none" stroke={VERMELHO} strokeWidth="5" />
          <path d="M-29 -13 A32 32 0 0 1 -12 -30" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.9" />
        </g>
      </g>
    </svg>
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
    <div className="relative mb-5 overflow-hidden rounded-2xl border border-contorno bg-superficie shadow-sm sm:mb-8 sm:rounded-3xl">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(to left, color-mix(in srgb, var(--re-marca-clara) 40%, transparent) 0%, transparent 55%)' }}
      />
      <div className="relative flex items-center justify-between gap-6 px-5 py-5 sm:px-8 sm:py-7">
        <div className="min-w-0 flex-1">
          {selo && (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-marca-clara px-3 py-1 text-xs font-bold text-marca-texto sm:mb-4">
              <span className="size-1.5 animate-pulse rounded-full bg-[#C8102E]" aria-hidden />
              {selo}
            </div>
          )}
          <h1 className="mb-2 text-xl leading-tight font-extrabold text-tinta sm:text-2xl">{titulo}</h1>
          {children && <div className="max-w-md text-sm leading-relaxed text-tinta-suave">{children}</div>}
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
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-linha bg-superficie shadow-sm">
        <Icon className="size-7 text-tinta-apagada" strokeWidth={1.2} aria-hidden />
      </div>
      <h2 className="mb-1 text-base font-bold text-tinta">{titulo}</h2>
      {children && <p className="max-w-xs text-sm leading-relaxed text-tinta-suave">{children}</p>}
      {acao && <div className="mt-6">{acao}</div>}
    </div>
  );
}

/** Card branco padrão (mesmo do card de filtros da listagem). */
export const CARD = 'rounded-2xl border border-contorno bg-superficie p-4 shadow-sm sm:p-5';

/** Botão principal vermelho. */
export const BOTAO_PRIMARIO =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8102E] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#A50D26] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60';
