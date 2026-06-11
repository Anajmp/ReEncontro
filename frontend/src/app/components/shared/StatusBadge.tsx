import { cn } from "../ui/utils";
import type { Status } from "./data";

const styles: Record<Status, string> = {
  'Disponível': 'bg-green-100 text-green-700 border-green-200',
  'Pendente': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Em Processo': 'bg-blue-100 text-blue-700 border-blue-200',
  'Entregue': 'bg-gray-100 text-gray-600 border-gray-200',
  'Descartado': 'bg-red-100 text-red-700 border-red-200',
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
      styles[status] ?? 'bg-gray-100 text-gray-600 border-gray-200',
      className
    )}>
      {status}
    </span>
  );
}
