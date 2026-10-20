import { GoogleLogin } from '@react-oauth/google';
import { authApi } from '../../../lib/api';
import type { Usuario } from '../../../contexts/AuthContext';

// Resposta de POST /api/auth/google (mesmo formato do login normal)
export interface ResultadoLoginGoogle {
  token: string;
  usuario: Usuario;
}

interface Props {
  onSucesso: (resultado: ResultadoLoginGoogle) => void;
  onErro: (mensagem: string) => void;
}

export function BotaoGoogle({ onSucesso, onErro }: Props) {
  return (
    <div className="flex w-full justify-center">
      <GoogleLogin
        onSuccess={async (resposta) => {
          try {
            if (!resposta.credential) {
              onErro('Não foi possível obter a credencial do Google.');
              return;
            }
            const resultado: ResultadoLoginGoogle = await authApi.loginGoogle(resposta.credential);
            onSucesso(resultado);
          } catch (err: unknown) {
            onErro((err instanceof Error && err.message) || 'Erro ao entrar com o Google.');
          }
        }}
        onError={() => onErro('Falha ao conectar com o Google.')}
        text="continue_with"
        locale="pt-BR"
        width="320"
      />
    </div>
  );
}
