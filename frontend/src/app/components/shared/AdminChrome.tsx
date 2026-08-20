import type { ReactNode } from 'react';
import {
  BookOpen, Shirt, Watch, Headphones, Footprints, Package,
  TrendingUp, TrendingDown,
} from 'lucide-react';
import type { Screen } from '../../App';
import { cn } from '../ui/utils';

export const ADMIN_FONT = { fontFamily: 'Plus Jakarta Sans, sans-serif' };

export const adminPanelClass = 'rounded-2xl border border-black/[0.05] bg-white shadow-sm';

export const adminInputClass =
  'h-11 rounded-xl border border-[#E7E5E4] bg-white px-4 text-sm text-[#1C1917] placeholder:text-[#C4BFBA] focus:border-[#C8102E] focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20';

export const adminSelectClass =
  'h-11 rounded-xl border-[#E7E5E4] bg-white text-[#1C1917] shadow-none focus-visible:border-[#C8102E] focus-visible:ring-[#C8102E]/20';

export const adminBtnPrimary =
  'rounded-xl bg-[#C8102E] font-bold text-white hover:bg-[#A50D26] active:scale-[0.98]';

export const adminBtnOutline =
  'rounded-xl border border-[#E7E5E4] bg-white font-semibold text-[#78716C] hover:bg-[#F5F3F0] hover:text-[#1C1917]';

export const PAGE_INFO: Record<Screen, { title: string; subtitle: string }> = {
  'public-listing': { title: 'Listagem', subtitle: '' },
  'item-detail': { title: 'Detalhe', subtitle: '' },
  login: { title: 'Login', subtitle: '' },
  register: { title: 'Cadastro', subtitle: '' },
  'reset-password': { title: 'Redefinir senha', subtitle: '' },
  'parent-dashboard': { title: 'Painel', subtitle: '' },
  'my-students': { title: 'Alunos', subtitle: '' },
  'admin-dashboard': { title: 'Dashboard', subtitle: 'Visão geral dos achados e perdidos' },
  'register-item': { title: 'Cadastrar Item', subtitle: 'Adicione um novo item encontrado ao sistema' },
  'available-items': { title: 'Itens Disponíveis', subtitle: 'Gerencie os itens aguardando retirada' },
  'pending-claims': { title: 'Pendentes', subtitle: 'Reivindicações aguardando validação' },
  'in-process': { title: 'Em Processo', subtitle: 'Reivindicações aprovadas aguardando entrega' },
  finalized: { title: 'Finalizados', subtitle: 'Histórico de itens entregues e descartados' },
  reports: { title: 'Relatórios', subtitle: 'Análise e exportação de dados' },
  'staff-management': { title: 'Gestão de Funcionárias', subtitle: 'Contas com acesso ao sistema administrativo' },
};

const CAT_CFG: Record<string, { color: string; bg: string; Icon: typeof BookOpen }> = {
  'Material Escolar': { color: '#D97706', bg: '#FEF3C7', Icon: BookOpen },
  'Vestuário': { color: '#059669', bg: '#D1FAE5', Icon: Shirt },
  'Acessórios': { color: '#7C3AED', bg: '#EDE9FE', Icon: Watch },
  'Eletrônicos': { color: '#4F46E5', bg: '#E0E7FF', Icon: Headphones },
  'Calçados': { color: '#B45309', bg: '#FEF9C3', Icon: Footprints },
  'Outros': { color: '#78716C', bg: '#F5F5F4', Icon: Package },
};

export function getCatConfig(category: string) {
  return CAT_CFG[category] ?? { color: '#78716C', bg: '#F5F5F4', Icon: Package };
}

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
      className="flex shrink-0 items-center justify-center rounded-full bg-[#FEE2E2] font-bold text-[#C8102E]"
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
    <div className="flex flex-col gap-3 rounded-2xl border border-black/[0.05] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm font-semibold leading-tight text-[#78716C]">{label}</p>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: iconBg }}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-4xl font-extrabold leading-none" style={{ color: valueColor }}>{value}</p>
        <div className="mt-1.5 flex items-center gap-1">
          {trend === 'up' && <TrendingUp size={12} strokeWidth={2} className="text-[#22C55E]" />}
          {trend === 'down' && <TrendingDown size={12} strokeWidth={2} className="text-[#EF4444]" />}
          <p className="text-xs text-[#A8A29E]">{context}</p>
        </div>
      </div>
    </div>
  );
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h2 className="text-base font-bold text-[#1C1917]">{title}</h2>
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
    <div className="rounded-xl border border-[#E7E5E4] bg-white px-3 py-2.5 text-xs shadow-lg" style={ADMIN_FONT}>
      <p className="mb-1 font-bold text-[#1C1917]">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-1.5 text-[#78716C]">
          <div className="size-2 rounded-sm" style={{ backgroundColor: p.fill }} />
          {p.name}: <span className="font-semibold text-[#1C1917]">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function AdminPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(adminPanelClass, className)}>{children}</div>;
}
