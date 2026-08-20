import { Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { cn } from '../ui/utils';
import type { Status } from './data';

const styles: Record<Status, { color: string; bg: string; Icon: typeof Clock }> = {
  'Disponível': { color: '#059669', bg: '#D1FAE5', Icon: CheckCircle },
  'Pendente': { color: '#B45309', bg: '#FEF3C7', Icon: Clock },
  'Em Processo': { color: '#1D4ED8', bg: '#DBEAFE', Icon: Search },
  'Entregue': { color: '#6B7280', bg: '#F3F4F6', Icon: CheckCircle },
  'Descartado': { color: '#C8102E', bg: '#FEE2E2', Icon: XCircle },
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const cfg = styles[status] ?? { color: '#78716C', bg: '#F5F5F4', Icon: Clock };
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
