import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import type { Screen } from '../../App';
import { LupaMarca } from './LupaMarca';
import { cn } from '../ui/utils';

export const AUTH_FONT = { fontFamily: 'Plus Jakarta Sans, sans-serif' };

const inputClass =
  'w-full rounded-xl border border-[#E7E5E4] bg-[#FAFAF8] py-2.5 pl-10 text-sm text-[#1C1917] placeholder:text-[#C4BFBA] transition-all focus:border-[#C8102E] focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20';

export function AuthAmbient() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full blur-3xl"
        style={{ background: '#FEE2E2', opacity: 0.38 }}
      />
      <div
        className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full blur-3xl"
        style={{ background: '#FEE2E2', opacity: 0.28 }}
      />
    </div>
  );
}

export function AuthHeader({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
      <button
        type="button"
        onClick={() => navigate('public-listing')}
        className="transition-opacity hover:opacity-80 focus:outline-none"
      >
        <div className="flex items-center gap-2.5">
          <LupaMarca size={34} />
          <span className="text-[1.1rem] font-bold tracking-tight text-[#1C1917]">
            Re<span className="text-[#C8102E]">Encontro</span>
          </span>
        </div>
      </button>
      <button
        type="button"
        onClick={() => navigate('public-listing')}
        className="hidden text-xs font-medium text-[#A8A29E] transition-colors hover:text-[#78716C] sm:block"
      >
        ← Voltar à listagem
      </button>
    </header>
  );
}

export function AuthPage({
  navigate,
  children,
  center = true,
}: {
  navigate: (s: Screen) => void;
  children: ReactNode;
  center?: boolean;
}) {
  return (
    <div
      className={cn('relative min-h-screen bg-[#F5F3F0]', center && 'flex flex-col')}
      style={AUTH_FONT}
    >
      <AuthAmbient />
      <AuthHeader navigate={navigate} />
      <div
        className={cn(
          'relative z-10',
          center
            ? 'flex flex-1 items-center justify-center px-5 py-8'
            : 'flex items-start justify-center px-5 py-4 pb-14',
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function AuthCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'w-full max-w-[420px] rounded-3xl border border-black/[0.05] bg-white p-8 shadow-sm sm:p-10',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AuthEmblem({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-[#FEE2E2]">
      {children}
    </div>
  );
}

export function AuthError({ message, className }: { message: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl border border-[#FECDD3] bg-[#FFF1F2] px-4 py-3 text-sm text-[#C8102E]',
        className,
      )}
    >
      <AlertCircle size={15} strokeWidth={1.8} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function AuthSubmitButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      className={cn(
        'w-full rounded-xl bg-[#C8102E] py-3 font-bold text-white transition-all duration-150 hover:bg-[#A50D26] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-[#E7E5E4]" />
      <span className="whitespace-nowrap text-[11px] font-bold tracking-widest text-[#78716C] uppercase">
        {label}
      </span>
      <div className="h-px flex-1 bg-[#E7E5E4]" />
    </div>
  );
}

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon: ReactNode;
  rightElement?: ReactNode;
}

export function AuthField({
  label,
  leftIcon,
  rightElement,
  id,
  className,
  ...inputProps
}: AuthFieldProps) {
  return (
    <div>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-[#1C1917]">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <div className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#A8A29E]">
          {leftIcon}
        </div>
        <input
          id={id}
          className={cn(inputClass, rightElement ? 'pr-10' : 'pr-4', className)}
          style={AUTH_FONT}
          {...inputProps}
        />
        {rightElement && (
          <div className="absolute top-1/2 right-3.5 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
    </div>
  );
}

export const authSelectTriggerClass =
  'h-auto min-h-[42px] rounded-xl border-[#E7E5E4] bg-[#FAFAF8] py-2.5 text-sm text-[#1C1917] shadow-none focus-visible:border-[#C8102E] focus-visible:ring-2 focus-visible:ring-[#C8102E]/20';
