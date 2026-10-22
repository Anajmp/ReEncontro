import { Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { cn } from '../ui/utils';
import type { Status } from './data';

const styles: Record<Status, { color: string; bg: string; Icon: typeof Clock }> = {
  // Cores de texto com contraste ≥ 4.5:1 sobre o fundo (WCAG AA)
  'Disponível': { color: '#047857', bg: '#D1FAE5', Icon: CheckCircle },
  'Pendente': { color: '#B45309', bg: '#FEF3C7', Icon: Clock },
  'Em Processo': { color: '#1D4ED8', bg: '#DBEAFE', Icon: Search },
  'Entregue': { color: '#4B5563', bg: '#F3F4F6', Icon: CheckCircle },
  'Descartado': { color: '#C8102E', bg: '#FEE2E2', Icon: XCircle },
  'Rejeitada': { color: '#C8102E', bg: '#FEE2E2', Icon: XCircle },
  'Cancelada': { color: '#C2410C', bg: '#FFEDD5', Icon: XCircle },
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const cfg = styles[status] ?? { color: '#6E6762', bg: '#F5F5F4', Icon: Clock };
  const Icon = cfg.Icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap',
        className,
      )}
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <Icon size={11} strokeWidth={2} />
      {status}
    </span>
  );
}
