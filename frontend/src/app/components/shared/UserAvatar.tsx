import { avatarUrl } from '../../../lib/avatar';
import { iniciais } from '../../../contexts/AuthContext';
import { cn } from '../ui/utils';

interface Props {
  seed?: string | null;
  nome?: string | null;
  size?: number;
  className?: string;
  rounded?: 'full' | '2xl' | 'xl';
}

/** Avatar DiceBear a partir do seed; se não houver seed, mostra iniciais. */
export function UserAvatar({
  seed,
  nome,
  size = 36,
  className,
  rounded = 'full',
}: Props) {
  const radius =
    rounded === 'full' ? 'rounded-full' : rounded === '2xl' ? 'rounded-2xl' : 'rounded-xl';

  if (seed) {
    return (
      <img
        src={avatarUrl(seed)}
        alt={nome ? `Avatar de ${nome}` : 'Avatar'}
        width={size}
        height={size}
        className={cn('shrink-0 object-cover bg-white', radius, className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center bg-[#FEE2E2] font-extrabold text-[#C8102E]',
        radius,
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.32 }}
      aria-hidden
    >
      {iniciais(nome ?? undefined)}
    </div>
  );
}
