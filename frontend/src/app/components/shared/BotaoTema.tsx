import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '../ui/utils';

/** Liga e desliga o tema escuro. Até a primeira escolha, o site fica no claro. */
export function BotaoTema({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const escuro = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(escuro ? 'light' : 'dark')}
      aria-label="Tema escuro"
      aria-pressed={escuro}
      title={escuro ? 'Usar tema claro' : 'Usar tema escuro'}
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-full text-tinta-suave transition-colors hover:bg-fundo hover:text-tinta',
        className,
      )}
    >
      {escuro ? (
        <Sun className="size-[18px]" strokeWidth={1.8} aria-hidden />
      ) : (
        <Moon className="size-[18px]" strokeWidth={1.8} aria-hidden />
      )}
    </button>
  );
}
