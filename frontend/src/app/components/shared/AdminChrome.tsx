import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../ui/utils';
import { Skeleton } from '../ui/skeleton';
import { ADMIN_FONT } from './estilos';
import { getCatConfig } from './categorias';

export const adminPanelClass = 'rounded-2xl border border-contorno bg-superficie shadow-sm';

export const adminInputClass =
  'h-11 rounded-xl border border-linha bg-superficie px-4 text-sm text-tinta placeholder:text-tinta-suave focus:border-[#C8102E] focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20';

export const adminSearchInputClass =
  'h-11 rounded-xl border border-linha bg-superficie pl-10 pr-4 text-sm text-tinta placeholder:text-tinta-suave focus:border-[#C8102E] focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20';

export const adminSelectClass =
  'h-11 rounded-xl border-linha bg-superficie text-tinta shadow-none focus-visible:border-[#C8102E] focus-visible:ring-[#C8102E]/20';

export const adminBtnPrimary =
  'rounded-xl bg-[#C8102E] font-bold text-white hover:bg-[#A50D26] active:scale-[0.98]';

export const adminBtnOutline =
  'rounded-xl border border-linha bg-superficie font-semibold text-tinta-suave hover:bg-fundo hover:text-tinta';

export function CategoryBadge({ category, className }: { category: string; className?: string }) {
  const cfg = getCatConfig(category);
  const Icon = cfg.Icon;
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', className)}
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <Icon size={11} strokeWidth={1.6} />
      {category}
    </span>
  );
}

export function CategoryIconBox({ category, size = 14 }: { category: string; size?: number }) {
  const cfg = getCatConfig(category);
  const Icon = cfg.Icon;
  return (
    <div
      className="flex size-8 shrink-0 items-center justify-center rounded-lg"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <Icon size={size} strokeWidth={1.6} />
    </div>
  );
}

export function AdminAvatar({ initials, size = 36 }: { initials: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-marca-clara font-bold text-marca-texto"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  context,
  icon,
  iconBg,
  valueColor,
  trend,
}: {
  label: string;
  value: string | number;
  context: string;
  icon: ReactNode;
  iconBg: string;
  valueColor: string;
  trend?: 'up' | 'down' | null;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-contorno bg-superficie p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm font-semibold leading-tight text-tinta-suave">{label}</p>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: iconBg }}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-4xl font-extrabold leading-none" style={{ color: valueColor }}>{value}</p>
        <div className="mt-1.5 flex items-center gap-1">
          {trend === 'up' && <TrendingUp size={12} strokeWidth={2} className="text-sucesso-texto" role="img" aria-label="Em alta" />}
          {trend === 'down' && <TrendingDown size={12} strokeWidth={2} className="text-[#DC2626]" role="img" aria-label="Em queda" />}
          <p className="text-xs text-tinta-suave">{context}</p>
        </div>
      </div>
    </div>
  );
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h2 className="text-base font-bold text-tinta">{title}</h2>
      {action}
    </div>
  );
}

export function CustomBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; fill: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-linha bg-superficie px-3 py-2.5 text-xs shadow-lg" style={ADMIN_FONT}>
      <p className="mb-1 font-bold text-tinta">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-1.5 text-tinta-suave">
          <div className="size-2 rounded-sm" style={{ backgroundColor: p.fill }} aria-hidden />
          {p.name}: <span className="font-semibold text-tinta">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Os gráficos do recharts são só visuais: esta tabela invisível leva os mesmos
 * números ao leitor de tela (o gráfico em si fica com aria-hidden).
 */
export function TabelaDoGrafico({
  titulo,
  colunas,
  linhas,
}: {
  titulo: string;
  colunas: { chave: string; rotulo: string }[];
  linhas: readonly object[];
}) {
  return (
    <table className="sr-only">
      <caption>{titulo}</caption>
      <thead>
        <tr>
          {colunas.map(c => (
            <th key={c.chave} scope="col">{c.rotulo}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {linhas.map((linha, i) => {
          const valores = linha as Record<string, string | number>;
          return (
            <tr key={i}>
              {colunas.map((c, j) =>
                j === 0 ? (
                  <th key={c.chave} scope="row">{valores[c.chave]}</th>
                ) : (
                  <td key={c.chave}>{valores[c.chave]}</td>
                ),
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------
// Esqueletos de carregamento: usam o ui/skeleton com a cor de fundo do tema
// e imitam a forma do conteúdo real, para o layout não pular quando os dados
// chegam. São só visuais (aria-hidden): quem usa anuncia o "Carregando…".
// ---------------------------------------------------------------------

const OSSO = 'bg-fundo';

/** Cartões da lista do celular (miniatura + nome + linha + selos). */
export function CartoesEsqueleto({ quantidade = 4, avatar = false }: { quantidade?: number; avatar?: boolean }) {
  return (
    <div className="divide-y divide-linha" aria-hidden>
      {Array.from({ length: quantidade }, (_, i) => (
        <div key={i} className={cn('flex gap-3 p-4', avatar && 'items-center')}>
          <Skeleton className={cn('shrink-0', OSSO, avatar ? 'size-10 rounded-full' : 'size-14 rounded-xl')} />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className={cn('h-4 w-2/3', OSSO)} />
            <Skeleton className={cn('h-3 w-1/2', OSSO)} />
            <div className="flex gap-1.5 pt-0.5">
              <Skeleton className={cn('h-5 w-20 rounded-full', OSSO)} />
              <Skeleton className={cn('h-5 w-16 rounded-full', OSSO)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Linhas de tabela para pôr no <tbody> enquanto carrega (o cabeçalho real
 * continua visível). A primeira coluna tem miniatura + duas linhas de texto.
 */
export function LinhasEsqueleto({
  colunas,
  quantidade = 5,
  avatar = false,
}: {
  colunas: number;
  quantidade?: number;
  avatar?: boolean;
}) {
  return (
    <>
      {Array.from({ length: quantidade }, (_, i) => (
        <tr key={i} aria-hidden>
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Skeleton className={cn('shrink-0', OSSO, avatar ? 'size-8 rounded-full' : 'size-10 rounded-xl')} />
              <div className="flex-1 space-y-1.5">
                <Skeleton className={cn('h-3.5 w-28', OSSO)} />
                {!avatar && <Skeleton className={cn('h-3 w-20', OSSO)} />}
              </div>
            </div>
          </td>
          {Array.from({ length: colunas - 1 }, (_, j) => (
            <td key={j} className="px-4 py-3">
              <Skeleton
                className={cn(
                  'h-3.5',
                  OSSO,
                  j === colunas - 2 ? 'ml-auto w-14' : j % 2 === 0 ? 'w-20 rounded-full' : 'w-24',
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Mesmo contorno do MetricCard, com barras no lugar do texto. */
export function MetricCardEsqueleto() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-contorno bg-superficie p-5 shadow-sm" aria-hidden>
      <div className="flex items-start justify-between">
        <Skeleton className={cn('h-4 w-24', OSSO)} />
        <Skeleton className={cn('size-10 rounded-xl', OSSO)} />
      </div>
      <div className="space-y-2">
        <Skeleton className={cn('h-9 w-16', OSSO)} />
        <Skeleton className={cn('h-3 w-28', OSSO)} />
      </div>
    </div>
  );
}

/** Bloco no formato de um gráfico (título + área), para os painéis de relatório. */
export function GraficoEsqueleto({ altura = 'h-52 sm:h-60', className }: { altura?: string; className?: string }) {
  return (
    <div className={cn(adminPanelClass, 'p-5', className)} aria-hidden>
      <Skeleton className={cn('mb-5 h-4 w-36', OSSO)} />
      <div className={cn('flex items-end gap-3', altura)}>
        {[45, 70, 35, 85, 55, 65].map((h, i) => (
          <Skeleton key={i} className={cn('flex-1 rounded-t-md rounded-b-none', OSSO)} style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

export function AdminPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(adminPanelClass, className)}>{children}</div>;
}
