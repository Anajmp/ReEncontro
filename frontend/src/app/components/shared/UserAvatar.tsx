import { avatarDoUsuario } from '../../../lib/avatar';
import { cn } from '../ui/utils';

interface Props {
  usuario: {
    role?: string;
    is_diretora?: boolean | number;
    avatar_seed?: string;
    email?: string;
    nome?: string;
  } | null;
  size?: number;
  className?: string;
  rounded?: 'full' | '2xl' | 'xl';
}

/** Avatar do usuário — diretora fixa, inspetora feminina aleatória, responsável escolhido. */
export function UserAvatar({
  usuario,
  size = 36,
  className,
  rounded = 'full',
}: Props) {
  const radius =
    rounded === 'full' ? 'rounded-full' : rounded === '2xl' ? 'rounded-2xl' : 'rounded-xl';

  return (
    <img
      src={avatarDoUsuario(usuario)}
      alt={usuario?.nome ? `Avatar de ${usuario.nome}` : 'Avatar'}
      width={size}
      height={size}
      className={cn(
        'shrink-0 border border-[#E7E5E4] bg-white object-cover',
        radius,
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
