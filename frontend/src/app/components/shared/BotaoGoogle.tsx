import { GoogleLogin } from '@react-oauth/google';
import { authApi } from '../../../lib/api';

interface Props {
  onSucesso: (resultado: any) => void;
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
            const resultado = await authApi.loginGoogle(resposta.credential);
            onSucesso(resultado);
          } catch (err: any) {
            onErro(err.message || 'Erro ao entrar com o Google.');
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
