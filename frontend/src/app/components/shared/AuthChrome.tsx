import { useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import type { Screen } from '../../App';
import { LupaMarca } from './LupaMarca';
import { BotaoTema } from './BotaoTema';
import { cn } from '../ui/utils';
import { CONTEUDO_ID } from '../../../lib/acessibilidade';

const AUTH_FONT = { fontFamily: 'Plus Jakarta Sans, sans-serif' };

const inputClass =
  'w-full rounded-xl border border-linha bg-campo py-2.5 pl-10 text-sm text-tinta placeholder:text-tinta-suave transition-all focus:border-[#C8102E] focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20';

export function AuthAmbient() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full blur-3xl"
        style={{ background: 'var(--re-marca-clara)', opacity: 0.38 }}
      />
      <div
        className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full blur-3xl"
        style={{ background: 'var(--re-marca-clara)', opacity: 0.28 }}
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
        className="rounded-lg transition-opacity hover:opacity-80"
        aria-label="ReEncontro — ir para a listagem"
      >
        <div className="flex items-center gap-2.5">
          <LupaMarca size={34} />
          <span className="text-[1.1rem] font-bold tracking-tight text-tinta">
            Re<span className="text-marca-texto">Encontro</span>
          </span>
        </div>
      </button>
      <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => navigate('public-listing')}
        className="hidden text-xs font-medium text-tinta-suave transition-colors hover:text-tinta sm:block"
      >
        <span aria-hidden>← </span>Voltar à listagem
      </button>
      <BotaoTema />
      </div>
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
      className={cn('relative min-h-screen bg-fundo', center && 'flex flex-col')}
      style={AUTH_FONT}
    >
      <AuthAmbient />
      <AuthHeader navigate={navigate} />
      <main
        id={CONTEUDO_ID}
        tabIndex={-1}
        className={cn(
          'relative z-10 outline-none',
          center
            ? 'flex flex-1 items-center justify-center px-5 py-8'
            : 'flex items-start justify-center px-5 py-4 pb-14',
        )}
      >
        {children}
      </main>
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
        'w-full max-w-[420px] rounded-3xl border border-contorno bg-superficie p-8 shadow-sm sm:p-10',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AuthEmblem({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-marca-clara">
      {children}
    </div>
  );
}

export function AuthError({ message, className }: { message: string; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-2 rounded-xl border border-erro-borda bg-erro-fundo px-4 py-3 text-sm text-marca-texto',
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
      <div className="h-px flex-1 bg-linha" />
      <span className="whitespace-nowrap text-[11px] font-bold tracking-widest text-tinta-suave uppercase">
        {label}
      </span>
      <div className="h-px flex-1 bg-linha" />
    </div>
  );
}

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon: ReactNode;
  rightElement?: ReactNode;
  error?: string;
}

export function AuthField({
  label,
  leftIcon,
  rightElement,
  error,
  id,
  className,
  ...inputProps
}: AuthFieldProps) {
  // Sem id explícito, gera um: é ele que liga o <label> e a mensagem de erro ao campo
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idErro = `${idCampo}-erro`;
  return (
    <div>
      {label ? (
        <label htmlFor={idCampo} className="mb-1.5 block text-sm font-semibold text-tinta">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <div className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-tinta-suave">
          {leftIcon}
        </div>
        <input
          id={idCampo}
          className={cn(
            inputClass,
            rightElement ? 'pr-10' : 'pr-4',
            error && 'border-erro-borda-forte',
            className,
          )}
          style={AUTH_FONT}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? idErro : undefined}
          {...inputProps}
        />
        {rightElement && (
          <div className="absolute top-1/2 right-3.5 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && (
        <div id={idErro} role="alert" className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-erro-borda bg-erro-fundo px-3 py-1.5">
          <AlertCircle size={12} strokeWidth={2} className="shrink-0 text-marca-texto" />
          <span className="text-xs font-medium text-marca-texto">{error}</span>
        </div>
      )}
    </div>
  );
}

export const authSelectTriggerClass =
  'h-auto min-h-[42px] rounded-xl border-linha bg-campo py-2.5 text-sm text-tinta shadow-none focus-visible:border-[#C8102E] focus-visible:ring-2 focus-visible:ring-[#C8102E]/20';
