import type { InputHTMLAttributes, ReactNode } from 'react';
import { AlertCircle, Clock, CheckCircle, Search, XCircle, GraduationCap } from 'lucide-react';
import { CategoryBadge, getCatConfig } from './AdminChrome';
import { cn } from '../ui/utils';

export const PARENT_FONT = { fontFamily: 'Plus Jakarta Sans, sans-serif' };

export function ParentInputField({
  label,
  leftIcon,
  rightElement,
  error,
  className,
  ...inputProps
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  leftIcon: ReactNode;
  rightElement?: ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-[#1C1917]">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#A8A29E]">
          {leftIcon}
        </div>
        <input
          {...inputProps}
          className={cn(
            'w-full rounded-xl border bg-[#FAFAF8] py-2.5 pl-10 text-sm text-[#1C1917] placeholder:text-[#C4BFBA] transition-all focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20 focus:outline-none',
            rightElement ? 'pr-10' : 'pr-4',
            error ? 'border-[#FCA5A5]' : 'border-[#E7E5E4]',
            className,
          )}
        />
        {rightElement && (
          <div className="absolute top-1/2 right-3.5 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-[#FECDD3] bg-[#FFF1F2] px-3 py-1.5">
          <AlertCircle size={12} strokeWidth={2} className="shrink-0 text-[#C8102E]" />
          <span className="text-xs font-medium text-[#C8102E]">{error}</span>
        </div>
      )}
    </div>
  );
}

const CLAIM_STATUS: Record<string, { label: string; color: string; bg: string; icon: ReactNode }> = {
  Pendente: { label: 'Pendente', color: '#B45309', bg: '#FEF3C7', icon: <Clock size={11} strokeWidth={2} /> },
  'Em Processo': { label: 'Em Processo', color: '#1D4ED8', bg: '#DBEAFE', icon: <Search size={11} strokeWidth={2} /> },
  Entregue: { label: 'Entregue', color: '#6B7280', bg: '#F3F4F6', icon: <CheckCircle size={11} strokeWidth={2} /> },
  Descartado: { label: 'Descartado', color: '#C8102E', bg: '#FEE2E2', icon: <XCircle size={11} strokeWidth={2} /> },
  Rejeitada: { label: 'Rejeitada', color: '#C8102E', bg: '#FEE2E2', icon: <XCircle size={11} strokeWidth={2} /> },
  Cancelada: { label: 'Cancelada', color: '#C8102E', bg: '#FEE2E2', icon: <XCircle size={11} strokeWidth={2} /> },
};

export function ClaimStatusBadge({ status, motivo }: { status: string; motivo?: string }) {
  const display = motivo && status === 'Descartado' ? 'Rejeitada' : status;
  const cfg = CLAIM_STATUS[display] ?? { label: status, color: '#78716C', bg: '#F5F5F4', icon: <Clock size={11} /> };
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export function ClaimCard({
  claim,
}: {
  claim: {
    id: number;
    itemName: string;
    itemImage?: string;
    category?: string;
    studentName: string;
    studentRoom: string;
    studentPeriod: string;
    date: string;
    status: string;
    motivoRejeicao?: string;
  };
}) {
  const category = claim.category;
  const catCfg = category ? getCatConfig(category) : null;
  const CatIcon = catCfg?.Icon;
  const motivo = claim.motivoRejeicao?.trim();

  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.05] bg-white shadow-sm">
      <div className="flex gap-4 p-4">
        {claim.itemImage ? (
          <img
            src={claim.itemImage}
            alt={claim.itemName}
            className="size-16 shrink-0 rounded-xl object-cover bg-[#F5F3F0]"
          />
        ) : (
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: catCfg?.bg ?? '#F5F5F4' }}
          >
            {CatIcon ? <CatIcon size={26} strokeWidth={1.5} style={{ color: catCfg?.color }} /> : null}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="truncate text-sm leading-snug font-bold text-[#1C1917]">{claim.itemName}</p>
            <ClaimStatusBadge status={claim.status} motivo={motivo} />
          </div>
          {category ? (
            <div className="mb-2">
              <CategoryBadge category={category} />
            </div>
          ) : null}
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-[#F5F3F0] px-2.5 py-1.5">
            <GraduationCap size={12} strokeWidth={1.6} className="text-[#78716C]" />
            <span className="text-xs font-medium text-[#78716C]">
              {claim.studentName} · {claim.studentRoom} · {claim.studentPeriod}
            </span>
          </div>
          <p className="text-xs text-[#A8A29E]">Solicitado em {claim.date}</p>
        </div>
      </div>

      {motivo ? (
        <div className="mx-4 mb-4 flex gap-2.5 rounded-xl border border-[#FECDD3] bg-[#FFF1F2] px-4 py-3">
          <AlertCircle size={14} strokeWidth={1.8} className="mt-0.5 shrink-0 text-[#C8102E]" />
          <div>
            <p className="mb-0.5 text-xs font-bold text-[#C8102E]">Motivo da recusa</p>
            <p className="text-xs leading-relaxed text-[#78716C]">{motivo}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
