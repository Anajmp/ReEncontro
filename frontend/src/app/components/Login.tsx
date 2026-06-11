import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { Screen } from '../App';

interface Props {
  navigate: (s: Screen) => void;
}

export function Login({ navigate }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[420px] shrink-0 bg-[#C8102E] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">R</span>
          </div>
          <span className="text-white font-bold text-xl">ReEncontro</span>
        </div>

        <div>
          <h2 className="text-white/90 leading-tight mb-4">
            Achados e perdidos<br />inteligente para escolas
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Gerencie itens encontrados, acompanhe reivindicações e devolva objetos para seus donos com facilidade.
          </p>

          <div className="mt-10 space-y-3">
            {[
              { n: '247', label: 'Itens devolvidos em 2024' },
              { n: '94%', label: 'Taxa de devolução' },
              { n: '3 dias', label: 'Tempo médio de resolução' },
            ].map(({ n, label }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="text-white font-bold">{n}</div>
                <div className="text-white/50 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs">Escola Estadual São Paulo © 2024</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#C8102E] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-gray-900">ReEncontro</span>
          </div>

          <div className="mb-8">
            <h1 className="text-gray-900">Bem-vindo de volta</h1>
            <p className="text-gray-500 text-sm mt-1">Faça login para acessar o sistema.</p>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" defaultValue="ana.paula@escola.edu.br" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <button
                  className="text-xs text-[#C8102E] hover:underline"
                  onClick={() => navigate('reset-password')}
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pr-10"
                  defaultValue="senha123"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              className="w-full bg-[#C8102E] hover:bg-[#A00D24]"
              onClick={() => navigate('admin-dashboard')}
            >
              Entrar
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Responsável por aluno?{' '}
            <button
              className="text-[#C8102E] font-medium hover:underline"
              onClick={() => navigate('register')}
            >
              Cadastre-se
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
