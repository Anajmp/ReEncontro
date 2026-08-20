import { useState } from 'react';
import {
  Plus, Trash2, Eye, EyeOff, User, Mail, Phone, Lock, GraduationCap, Clock,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Screen } from '../App';
import { useAuth } from '../../contexts/AuthContext';
import { useLoginSplash } from './LoginSplash';
import {
  AuthCard,
  AuthEmblem,
  AuthError,
  AuthField,
  AuthPage,
  AuthSubmitButton,
  SectionDivider,
  authSelectTriggerClass,
} from './shared/AuthChrome';

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
  const { registrar } = useAuth();
  const { playLoginTransition } = useLoginSplash();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [students, setStudents] = useState<StudentEntry[]>([
    { id: 1, name: '', room: '', period: '' },
  ]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Mapa de período do frontend pro formato do backend
  const periodoMap: Record<string, string> = {
    'Manhã': 'manha', 'manha': 'manha',
    'Tarde': 'tarde', 'tarde': 'tarde',
    'Integral': 'integral', 'integral': 'integral',
  };

  async function fazerCadastro() {
    setErro('');

    // Validações básicas
    if (senha !== confirmarSenha) {
      setErro('As senhas não conferem');
      return;
    }
    if (students.some(s => !s.name || !s.room || !s.period)) {
      setErro('Preencha todos os dados dos alunos');
      return;
    }

    setCarregando(true);
    try {
      const dados = {
        nome,
        email,
        senha,
        telefone,
        alunos: students.map(s => ({
          nome: s.name,
          sala: s.room,
          periodo: periodoMap[s.period] || s.period,
          ano_letivo: 2026,
        })),
      };
      // Já vem logado (backend devolve token) — o contexto guarda a sessão
      await registrar(dados);
      navigate('parent-dashboard');
    } catch (err: any) {
      setErro(err.message || 'Erro ao criar conta');
    } finally {
      setCarregando(false);
    }
  }

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
    <AuthPage navigate={navigate} center={false}>
      <AuthCard className="max-w-lg">
        <AuthEmblem>
          <User size={22} strokeWidth={1.7} color="#C8102E" />
        </AuthEmblem>

        <h1 className="mb-1.5 text-2xl font-extrabold text-[#1C1917]">Criar conta</h1>
        <p className="mb-2 text-sm leading-relaxed text-[#78716C]">
          Cadastre-se para reivindicar itens encontrados no SESI Nova Odessa.
        </p>

        <form
          onSubmit={e => {
            e.preventDefault();
            if (!carregando) void fazerCadastro();
          }}
        >
          <SectionDivider label="Seus dados" />

          <div className="space-y-4">
            <AuthField
              label="Nome completo"
              leftIcon={<User size={15} strokeWidth={1.6} />}
              type="text"
              placeholder="Seu nome completo"
              value={nome}
              onChange={e => setNome(e.target.value)}
              autoComplete="name"
            />

            <AuthField
              label="E-mail"
              leftIcon={<Mail size={15} strokeWidth={1.6} />}
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />

            <AuthField
              label="Telefone"
              leftIcon={<Phone size={15} strokeWidth={1.6} />}
              type="tel"
              placeholder="(19) 9 0000-0000"
              value={telefone}
              onChange={e => setTelefone(e.target.value)}
              autoComplete="tel"
            />

            <AuthField
              label="Senha"
              leftIcon={<Lock size={15} strokeWidth={1.6} />}
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              autoComplete="new-password"
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

            <AuthField
              label="Confirmar senha"
              leftIcon={<Lock size={15} strokeWidth={1.6} />}
              type={showConfirmarSenha ? 'text' : 'password'}
              placeholder="Repita a senha"
              value={confirmarSenha}
              onChange={e => setConfirmarSenha(e.target.value)}
              autoComplete="new-password"
              rightElement={
                <button
                  type="button"
                  className="text-[#A8A29E] transition-colors hover:text-[#78716C]"
                  onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                  aria-label={showConfirmarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showConfirmarSenha ? <EyeOff size={15} strokeWidth={1.6} /> : <Eye size={15} strokeWidth={1.6} />}
                </button>
              }
            />
          </div>

          <SectionDivider label="Dados do aluno" />

          <div className="mb-5 flex items-center justify-between">
            <p className="-mt-1 text-xs leading-relaxed text-[#A8A29E]">
              Vincule o aluno da sua família para gerenciar reivindicações.
            </p>
            <button
              type="button"
              onClick={addStudent}
              className="ml-3 inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#C8102E] hover:underline hover:underline-offset-2"
            >
              <Plus size={13} strokeWidth={2.2} />
              Adicionar
            </button>
          </div>

          <div className="space-y-4">
            {students.map((student, index) => (
              <div key={student.id} className="space-y-4 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF8] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-widest text-[#78716C] uppercase">
                    Aluno {index + 1}
                  </span>
                  {students.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStudent(student.id)}
                      className="text-[#A8A29E] transition-colors hover:text-[#C8102E]"
                      aria-label={`Remover aluno ${index + 1}`}
                    >
                      <Trash2 size={14} strokeWidth={1.8} />
                    </button>
                  )}
                </div>

                <AuthField
                  label="Nome do aluno"
                  leftIcon={<GraduationCap size={15} strokeWidth={1.6} />}
                  type="text"
                  placeholder="Nome completo do aluno"
                  value={student.name}
                  onChange={e => updateStudent(student.id, 'name', e.target.value)}
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <AuthField
                    label="Sala"
                    leftIcon={<GraduationCap size={15} strokeWidth={1.6} />}
                    type="text"
                    placeholder="Ex: 5º A"
                    value={student.room}
                    onChange={e => updateStudent(student.id, 'room', e.target.value)}
                  />
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1C1917]">Período</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-[#A8A29E]">
                        <Clock size={15} strokeWidth={1.6} />
                      </div>
                      <Select
                        value={student.period || undefined}
                        onValueChange={v => updateStudent(student.id, 'period', v)}
                      >
                        <SelectTrigger className={`${authSelectTriggerClass} pl-10`}>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manha">Manhã</SelectItem>
                          <SelectItem value="tarde">Tarde</SelectItem>
                          <SelectItem value="integral">Integral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {erro && <AuthError message={erro} className="mt-5" />}

          <AuthSubmitButton className="mt-7" disabled={carregando}>
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </AuthSubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-[#78716C]">
          Já tem conta?{' '}
          <button
            type="button"
            className="font-bold text-[#C8102E] underline-offset-2 transition-colors hover:underline"
            onClick={playLoginTransition}
          >
            Entrar
          </button>
        </p>
      </AuthCard>
    </AuthPage>
  );
}
