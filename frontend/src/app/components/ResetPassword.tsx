import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, Eye, EyeOff, Lock, Check } from 'lucide-react';
import type { Screen } from '../App';
import {
  AuthCard,
  AuthEmblem,
  AuthField,
  AuthPage,
  AuthSubmitButton,
} from './shared/AuthChrome';
import { authApi } from '../../lib/api';

interface Props {
  navigate: (s: Screen) => void;
}

type Step = 'email' | 'sent' | 'new-password' | 'done';

function BackToLogin({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-7 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#78716C] transition-colors hover:text-[#C8102E]"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <path d="M10 12 L6 8 L10 4" />
        </svg>
        Voltar para o login
      </button>
    </div>
  );
}

export function ResetPassword({ navigate }: Props) {
  const [searchParams] = useSearchParams();
  const tokenDaUrl = searchParams.get('token');

  // Se veio com token na URL, já abre direto na tela de nova senha
  const [step, setStep] = useState<Step>(tokenDaUrl ? 'new-password' : 'email');
  const [showPw, setShowPw] = useState(false);

  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Solicita o link de redefinição
  async function solicitar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    if (!email.trim()) {
      setErro('Informe seu e-mail.');
      return;
    }
    setCarregando(true);
    try {
      await authApi.esqueciSenha(email.trim());
      setStep('sent');
    } catch (err: any) {
      setErro(err.message || 'Erro ao solicitar a redefinição.');
    } finally {
      setCarregando(false);
    }
  }

  // Define a nova senha usando o token do link
  async function redefinir(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    if (novaSenha.length < 6) {
      setErro('A senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não conferem.');
      return;
    }
    if (!tokenDaUrl) {
      setErro('Link inválido. Solicite uma nova redefinição.');
      return;
    }
    setCarregando(true);
    try {
      await authApi.redefinirSenha(tokenDaUrl, novaSenha);
      setStep('done');
    } catch (err: any) {
      setErro(err.message || 'Erro ao redefinir a senha.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AuthPage navigate={navigate}>
      <AuthCard>
        {step === 'email' && (
          <>
            <AuthEmblem>
              <Lock size={22} strokeWidth={1.7} color="#C8102E" />
            </AuthEmblem>
            <h1 className="mb-1.5 text-2xl font-extrabold text-[#1C1917]">Esqueci minha senha</h1>
            <p className="mb-7 text-sm leading-relaxed text-[#78716C]">
              Digite seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
            </p>
            <form className="space-y-4" onSubmit={solicitar}>
              <AuthField
                id="reset-email"
                label="E-mail cadastrado"
                leftIcon={<Mail size={15} strokeWidth={1.6} />}
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
              />
              {erro && (
                <p className="rounded-xl bg-[#FFF1F2] px-4 py-2.5 text-sm text-[#C8102E]">{erro}</p>
              )}
              <AuthSubmitButton disabled={carregando}>
                {carregando ? 'Enviando...' : 'Enviar link de redefinição'}
              </AuthSubmitButton>
            </form>
            <BackToLogin onClick={() => navigate('login')} />
          </>
        )}

        {step === 'sent' && (
          <>
            <div className="py-4 text-center">
              <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#DCFCE7]">
                <Check size={28} color="#16A34A" strokeWidth={2.5} />
              </div>
              <h2 className="mb-2 text-xl font-extrabold text-[#1C1917]">E-mail enviado!</h2>
              <p className="mb-1.5 text-sm leading-relaxed text-[#78716C]">
                Se este e-mail estiver cadastrado, você receberá um link para redefinir a senha em:
              </p>
              <p className="mb-5 truncate text-sm font-bold text-[#1C1917]">{email}</p>
              <div className="rounded-xl border border-[#E7E5E4] bg-[#FAFAF8] px-4 py-3 text-xs leading-relaxed text-[#A8A29E]">
                Verifique também a pasta de spam. O link expira em{' '}
                <span className="font-semibold text-[#78716C]">1 hora</span>.
              </div>
            </div>
            <BackToLogin onClick={() => navigate('login')} />
          </>
        )}

        {step === 'new-password' && (
          <>
            <AuthEmblem>
              <Lock size={22} strokeWidth={1.7} color="#C8102E" />
            </AuthEmblem>
            <h1 className="mb-1.5 text-2xl font-extrabold text-[#1C1917]">Nova senha</h1>
            <p className="mb-7 text-sm leading-relaxed text-[#78716C]">
              Escolha uma nova senha segura para sua conta.
            </p>
            <form className="space-y-4" onSubmit={redefinir}>
              <AuthField
                label="Nova senha"
                leftIcon={<Lock size={15} strokeWidth={1.6} />}
                type={showPw ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={novaSenha}
                onChange={(e: any) => setNovaSenha(e.target.value)}
                rightElement={
                  <button
                    type="button"
                    className="text-[#A8A29E] transition-colors hover:text-[#78716C]"
                    onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPw ? <EyeOff size={15} strokeWidth={1.6} /> : <Eye size={15} strokeWidth={1.6} />}
                  </button>
                }
              />
              <AuthField
                label="Confirmar nova senha"
                leftIcon={<Lock size={15} strokeWidth={1.6} />}
                type="password"
                placeholder="Repita a nova senha"
                value={confirmarSenha}
                onChange={(e: any) => setConfirmarSenha(e.target.value)}
              />
              {erro && (
                <p className="rounded-xl bg-[#FFF1F2] px-4 py-2.5 text-sm text-[#C8102E]">{erro}</p>
              )}
              <AuthSubmitButton disabled={carregando}>
                {carregando ? 'Redefinindo...' : 'Redefinir senha'}
              </AuthSubmitButton>
            </form>
            <BackToLogin onClick={() => navigate('login')} />
          </>
        )}

        {step === 'done' && (
          <div className="py-4 text-center">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#DCFCE7]">
              <Check size={28} color="#16A34A" strokeWidth={2.5} />
            </div>
            <h2 className="mb-2 text-xl font-extrabold text-[#1C1917]">Senha redefinida!</h2>
            <p className="mb-6 text-sm leading-relaxed text-[#78716C]">
              Sua senha foi atualizada com sucesso. Faça login para continuar.
            </p>
            <AuthSubmitButton type="button" onClick={() => navigate('login')}>
              Ir para o login
            </AuthSubmitButton>
          </div>
        )}
      </AuthCard>
    </AuthPage>
  );
}