import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import type { Screen } from '../App';
import {
  AuthCard,
  AuthEmblem,
  AuthError,
  AuthField,
  AuthPage,
  AuthSubmitButton,
} from './shared/AuthChrome';

interface Props {
  navigate: (s: Screen) => void;
}

export function Login({ navigate }: Props) {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function fazerLogin() {
    setErro('');
    setCarregando(true);
    try {
      // O contexto salva o token e o usuário (memória + localStorage)
      const usuario = await login(email, senha);

      // Redireciona conforme o perfil
      if (usuario.role === 'funcionaria') {
        navigate('admin-dashboard');
      } else {
        navigate('parent-dashboard');
      }
    } catch (err: any) {
      setErro(err.message || 'Erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AuthPage navigate={navigate}>
      <AuthCard>
        <AuthEmblem>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#C8102E" strokeWidth="1.9" strokeLinecap="round" aria-hidden>
            <circle cx="9.5" cy="9.5" r="7" />
            <path d="M14.8 14.8 L20 20" />
          </svg>
        </AuthEmblem>

        <h1 className="mb-1.5 text-2xl font-extrabold text-[#1C1917]">Bem-vindo de volta</h1>
        <p className="mb-7 text-sm leading-relaxed text-[#78716C]">
          Entre para acompanhar suas reivindicações.
        </p>

        {erro && <AuthError message={erro} className="mb-5" />}

        <form
          className="space-y-4"
          onSubmit={e => {
            e.preventDefault();
            if (!carregando) void fazerLogin();
          }}
        >
          <AuthField
            id="email"
            label="E-mail"
            leftIcon={<Mail size={15} strokeWidth={1.6} />}
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-semibold text-[#1C1917]">
                Senha
              </label>
              <button
                type="button"
                className="text-xs font-semibold text-[#C8102E] underline-offset-2 transition-colors hover:underline"
                onClick={() => navigate('reset-password')}
              >
                Esqueci a senha
              </button>
            </div>
            <AuthField
              id="password"
              leftIcon={<Lock size={15} strokeWidth={1.6} />}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              autoComplete="current-password"
              rightElement={
                <button
                  type="button"
                  className="text-[#A8A29E] transition-colors hover:text-[#78716C]"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={15} strokeWidth={1.6} /> : <Eye size={15} strokeWidth={1.6} />}
                </button>
              }
            />
          </div>

          <AuthSubmitButton className="mt-2" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </AuthSubmitButton>
        </form>

        <p className="mt-7 text-center text-sm text-[#78716C]">
          Ainda não tem conta?{' '}
          <button
            type="button"
            className="font-bold text-[#C8102E] underline-offset-2 transition-colors hover:underline"
            onClick={() => navigate('register')}
          >
            Criar conta
          </button>
        </p>
      </AuthCard>
    </AuthPage>
  );
}
