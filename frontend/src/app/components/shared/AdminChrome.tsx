import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../ui/utils';
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

export function AdminPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(adminPanelClass, className)}>{children}</div>;
}
