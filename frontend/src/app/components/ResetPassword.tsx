import { useState } from 'react';
import { Mail, Eye, EyeOff, Lock, Check } from 'lucide-react';
import type { Screen } from '../App';
import {
  AuthCard,
  AuthEmblem,
  AuthField,
  AuthPage,
  AuthSubmitButton,
} from './shared/AuthChrome';

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
  const [step, setStep] = useState<Step>('email');
  const [showPw, setShowPw] = useState(false);

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
            <form
              className="space-y-4"
              onSubmit={e => {
                e.preventDefault();
                setStep('sent');
              }}
            >
              <AuthField
                id="reset-email"
                label="E-mail cadastrado"
                leftIcon={<Mail size={15} strokeWidth={1.6} />}
                type="email"
                placeholder="seu@email.com"
                defaultValue="maria.santos@email.com"
                autoComplete="email"
              />
              <AuthSubmitButton>Enviar link de redefinição</AuthSubmitButton>
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
                Enviamos um link de redefinição para:
              </p>
              <p className="mb-5 truncate text-sm font-bold text-[#1C1917]">maria.santos@email.com</p>
              <div className="rounded-xl border border-[#E7E5E4] bg-[#FAFAF8] px-4 py-3 text-xs leading-relaxed text-[#A8A29E]">
                Verifique também a pasta de spam. O link expira em{' '}
                <span className="font-semibold text-[#78716C]">30 minutos</span>.
              </div>
            </div>
            <button
              type="button"
              className="mt-5 w-full rounded-xl border border-[#E7E5E4] bg-white py-3 text-sm font-bold text-[#78716C] transition-all hover:border-[#C8102E]/30 hover:text-[#C8102E] active:scale-[0.98]"
              onClick={() => setStep('new-password')}
            >
              Simular: abrir link recebido
            </button>
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
            <form
              className="space-y-4"
              onSubmit={e => {
                e.preventDefault();
                setStep('done');
              }}
            >
              <AuthField
                label="Nova senha"
                leftIcon={<Lock size={15} strokeWidth={1.6} />}
                type={showPw ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
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
              />
              <AuthSubmitButton>Redefinir senha</AuthSubmitButton>
            </form>
            <BackToLogin onClick={() => navigate('login')} />
          </>
        )}

        {step === 'done' && (
          <>
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
          </>
        )}
      </AuthCard>
    </AuthPage>
  );
}
