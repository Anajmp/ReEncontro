import { cn } from '../ui/utils';
import type { Status } from './data';

const styles: Record<Status, { color: string; bg: string }> = {
  'Disponível': { color: '#059669', bg: '#D1FAE5' },
  'Pendente': { color: '#D97706', bg: '#FEF3C7' },
  'Em Processo': { color: '#2563EB', bg: '#DBEAFE' },
  'Entregue': { color: '#6B7280', bg: '#F3F4F6' },
  'Descartado': { color: '#C8102E', bg: '#FEE2E2' },
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const cfg = styles[status] ?? { color: '#78716C', bg: '#F5F5F4' };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        className,
      )}
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {status}
    </span>
  );
}
