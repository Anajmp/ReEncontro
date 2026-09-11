import { useState } from 'react';
import { GraduationCap, Phone, Lock, User, Eye, EyeOff, Clock } from 'lucide-react';
import type { Screen } from '../App';
import { AuthCard, AuthEmblem, AuthField, AuthPage, AuthSubmitButton } from './shared/AuthChrome';
import { authApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  navigate: (s: Screen) => void;
}

export function CompletarCadastro({ navigate }: Props) {
  const { usuario, atualizarUsuario } = useAuth();

  const [alunoNome, setAlunoNome] = useState('');
  const [alunoSala, setAlunoSala] = useState('');
  const [alunoPeriodo, setAlunoPeriodo] = useState('manha');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function concluir(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    if (!alunoNome.trim() || !alunoSala.trim()) {
      setErro('Informe o nome e a turma do aluno.');
      return;
    }
    if (senha && senha.length < 6) {
      setErro('A senha deve ter ao menos 6 caracteres.');
      return;
    }

    setSalvando(true);
    try {
      await authApi.completarCadastro({
        aluno_nome: alunoNome.trim(),
        aluno_sala: alunoSala.trim(),
        aluno_periodo: alunoPeriodo,
        aluno_ano_letivo: new Date().getFullYear(),
        telefone: telefone.trim() || undefined,
        senha: senha || undefined,
      });

      atualizarUsuario({ cadastro_completo: true, telefone: telefone.trim() });
      navigate('parent-dashboard');
    } catch (err: any) {
      setErro(err.message || 'Erro ao concluir o cadastro.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AuthPage navigate={navigate}>
      <AuthCard>
        <AuthEmblem>
          <GraduationCap size={22} strokeWidth={1.7} color="#C8102E" />
        </AuthEmblem>

        <h1 className="mb-1.5 text-2xl font-extrabold text-[#1C1917]">
          Falta pouco{usuario?.nome ? `, ${usuario.nome.split(' ')[0]}` : ''}!
        </h1>
        <p className="mb-7 text-sm leading-relaxed text-[#78716C]">
          Para reivindicar itens, precisamos saber quem é o aluno vinculado à sua conta.
        </p>

        <form className="space-y-4" onSubmit={concluir}>
          <AuthField
            id="aluno-nome"
            label="Nome completo do aluno"
            leftIcon={<User size={15} strokeWidth={1.6} />}
            type="text"
            placeholder="Nome do aluno"
            value={alunoNome}
            onChange={(e) => setAlunoNome(e.target.value)}
          />

          <AuthField
            id="aluno-sala"
            label="Turma / Série"
            leftIcon={<GraduationCap size={15} strokeWidth={1.6} />}
            type="text"
            placeholder="Ex: 5A"
            value={alunoSala}
            onChange={(e) => setAlunoSala(e.target.value)}
          />

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#1C1917]">Período</label>
            <div className="relative">
              <div className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#A8A29E]">
                <Clock size={15} strokeWidth={1.6} />
              </div>
              <select
                value={alunoPeriodo}
                onChange={(e) => setAlunoPeriodo(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-xl border border-[#E7E5E4] bg-[#FAFAF8] py-2.5 pr-9 pl-10 text-sm text-[#1C1917] transition-all focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20 focus:outline-none"
              >
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="integral">Integral</option>
              </select>
            </div>
          </div>

          <div className="my-5 h-px bg-[#E7E5E4]" />

          <AuthField
            id="telefone"
            label="Telefone (opcional)"
            leftIcon={<Phone size={15} strokeWidth={1.6} />}
            type="tel"
            placeholder="(19) 99999-9999"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />

          <AuthField
            id="senha"
            label="Criar uma senha (opcional)"
            leftIcon={<Lock size={15} strokeWidth={1.6} />}
            type={showSenha ? 'text' : 'password'}
            placeholder="Para entrar sem o Google"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            rightElement={
              <button
                type="button"
                className="text-[#A8A29E] transition-colors hover:text-[#78716C]"
                onClick={() => setShowSenha(!showSenha)}
              >
                {showSenha ? <EyeOff size={15} strokeWidth={1.6} /> : <Eye size={15} strokeWidth={1.6} />}
              </button>
            }
          />
          <p className="-mt-2 text-xs text-[#A8A29E]">
            Se preferir, você pode continuar entrando apenas com o Google.
          </p>

          {erro && (
            <p className="rounded-xl bg-[#FFF1F2] px-4 py-2.5 text-sm text-[#C8102E]">{erro}</p>
          )}

          <AuthSubmitButton disabled={salvando}>
            {salvando ? 'Concluindo...' : 'Concluir cadastro'}
          </AuthSubmitButton>
        </form>
      </AuthCard>
    </AuthPage>
  );
}
