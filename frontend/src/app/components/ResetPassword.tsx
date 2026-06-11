import { useState } from 'react';
import { ArrowLeft, Mail, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { Screen } from '../App';

interface Props {
  navigate: (s: Screen) => void;
}

type Step = 'email' | 'sent' | 'new-password' | 'done';

export function ResetPassword({ navigate }: Props) {
  const [step, setStep] = useState<Step>('email');
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#C8102E] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="font-bold text-gray-900">ReEncontro</span>
        </div>

        {/* Step: Email input */}
        {step === 'email' && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="w-12 h-12 bg-[#C8102E]/10 rounded-xl flex items-center justify-center mx-auto mb-5">
              <Mail className="size-6 text-[#C8102E]" />
            </div>
            <h1 className="text-center text-gray-900 mb-1">Redefinir senha</h1>
            <p className="text-sm text-center text-gray-500 mb-6">
              Informe seu e-mail e enviaremos um link de redefinição.
            </p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email">E-mail cadastrado</Label>
                <Input id="reset-email" type="email" placeholder="seu@email.com" defaultValue="maria.santos@email.com" />
              </div>
              <Button
                className="w-full bg-[#C8102E] hover:bg-[#A00D24]"
                onClick={() => setStep('sent')}
              >
                Enviar link de redefinição
              </Button>
            </div>
            <button
              onClick={() => navigate('login')}
              className="flex items-center justify-center gap-1.5 w-full mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Voltar ao login
            </button>
          </div>
        )}

        {/* Step: Email sent */}
        {step === 'sent' && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="size-6 text-green-600" />
            </div>
            <h1 className="text-gray-900 mb-1">E-mail enviado!</h1>
            <p className="text-sm text-gray-500 mb-6">
              Enviamos um link de redefinição para <strong>maria.santos@email.com</strong>. Verifique sua caixa de entrada.
            </p>
            <Button variant="outline" className="w-full mb-3" onClick={() => setStep('new-password')}>
              Simular: abrir link recebido
            </Button>
            <button
              onClick={() => navigate('login')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Voltar ao login
            </button>
          </div>
        )}

        {/* Step: New password */}
        {step === 'new-password' && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="w-12 h-12 bg-[#C8102E]/10 rounded-xl flex items-center justify-center mx-auto mb-5">
              <svg className="size-6 text-[#C8102E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-center text-gray-900 mb-1">Nova senha</h1>
            <p className="text-sm text-center text-gray-500 mb-6">Escolha uma nova senha segura para sua conta.</p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nova senha</Label>
                <div className="relative">
                  <Input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Confirmar nova senha</Label>
                <Input type="password" placeholder="Repita a nova senha" />
              </div>
              <Button
                className="w-full bg-[#C8102E] hover:bg-[#A00D24]"
                onClick={() => setStep('done')}
              >
                Redefinir senha
              </Button>
            </div>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="size-6 text-green-600" />
            </div>
            <h1 className="text-gray-900 mb-1">Senha redefinida!</h1>
            <p className="text-sm text-gray-500 mb-6">Sua senha foi atualizada com sucesso. Faça login para continuar.</p>
            <Button
              className="w-full bg-[#C8102E] hover:bg-[#A00D24]"
              onClick={() => navigate('login')}
            >
              Ir para o login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
