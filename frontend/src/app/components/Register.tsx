import { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Screen } from '../App';

interface Props {
  navigate: (s: Screen) => void;
}

interface StudentEntry {
  id: number;
  name: string;
  room: string;
  period: string;
}

export function Register({ navigate }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [students, setStudents] = useState<StudentEntry[]>([
    { id: 1, name: '', room: '', period: '' },
  ]);

  const addStudent = () => {
    setStudents(prev => [...prev, { id: Date.now(), name: '', room: '', period: '' }]);
  };

  const removeStudent = (id: number) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const updateStudent = (id: number, field: keyof StudentEntry, value: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[380px] shrink-0 bg-[#C8102E] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">R</span>
          </div>
          <span className="text-white font-bold text-xl">ReEncontro</span>
        </div>

        <div>
          <h2 className="text-white/90 leading-tight mb-4">
            Crie sua conta e<br />acompanhe seus filhos
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Cadastre-se como responsável e receba notificações quando um item de seus alunos for encontrado.
          </p>

          <div className="mt-8 space-y-3">
            {['Reivindicação online em minutos', 'Notificações por e-mail', 'Acompanhe o status em tempo real'].map(text => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-[10px]">✓</span>
                </div>
                <span className="text-white/70 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs">Escola Estadual São Paulo © 2024</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-auto bg-gray-50 flex items-start justify-center py-8 px-6">
        <div className="w-full max-w-lg">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-[#C8102E] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-gray-900">ReEncontro</span>
          </div>

          <div className="mb-6">
            <h1 className="text-gray-900">Criar conta</h1>
            <p className="text-gray-500 text-sm mt-1">Preencha seus dados para se cadastrar como responsável.</p>
          </div>

          {/* Section: Personal data */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
            <h3 className="text-gray-900 mb-4">Dados pessoais</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nome completo *</Label>
                <Input placeholder="Maria Santos" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>E-mail *</Label>
                  <Input type="email" placeholder="maria@email.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Telefone *</Label>
                  <Input placeholder="(11) 99999-9999" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Senha *</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      className="pr-10"
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
                <div className="space-y-1.5">
                  <Label>Confirmar senha *</Label>
                  <Input type="password" placeholder="Repita a senha" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Students */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Alunos</h3>
              <Button variant="outline" size="sm" onClick={addStudent} className="gap-1.5">
                <Plus className="size-3.5" />
                Adicionar aluno
              </Button>
            </div>
            <div className="space-y-4">
              {students.map((student, index) => (
                <div key={student.id} className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Aluno {index + 1}</span>
                    {students.length > 1 && (
                      <button
                        onClick={() => removeStudent(student.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nome do aluno *</Label>
                    <Input
                      placeholder="Lucas Santos"
                      value={student.name}
                      onChange={e => updateStudent(student.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Sala *</Label>
                      <Input
                        placeholder="Ex: 5º A"
                        value={student.room}
                        onChange={e => updateStudent(student.id, 'room', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Período *</Label>
                      <Select onValueChange={v => updateStudent(student.id, 'period', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manha">Manhã</SelectItem>
                          <SelectItem value="tarde">Tarde</SelectItem>
                          <SelectItem value="noite">Noite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            className="w-full bg-[#C8102E] hover:bg-[#A00D24]"
            onClick={() => navigate('parent-dashboard')}
          >
            Criar conta
          </Button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Já tem conta?{' '}
            <button className="text-[#C8102E] font-medium hover:underline" onClick={() => navigate('login')}>
              Entrar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
