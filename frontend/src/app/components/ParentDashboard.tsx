import { useEffect, useState } from 'react';
import { Plus, Pencil, GraduationCap, FileText, User, Clock, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ParentLayout } from './shared/ParentLayout';
import { ClaimCard, ParentInputField } from './shared/ParentChrome';
import { myStudents } from './shared/data';
import { reivindicacoesApi } from '../../lib/api';
import type { Student } from './shared/data';
import type { Screen } from '../App';
import { alunosApi } from '../../lib/api';

interface Props {
  navigate: (s: Screen) => void;
  activeTab: 'claims' | 'students';
}
function StudentModal({
  open,
  onClose,
  student,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  student?: any;
  onSaved: () => void;
}) {
  const [nome, setNome] = useState('');
  const [sala, setSala] = useState('');
  const [periodo, setPeriodo] = useState('Manhã');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Preenche os campos quando abre (edição) ou limpa (novo)
  useEffect(() => {
    if (open) {
      setNome(student?.name ?? '');
      setSala(student?.room ?? '');
      setPeriodo(student?.period ?? 'Manhã');
      setErro('');
    }
  }, [open, student]);

  // Converte o label da tela para o valor que o backend espera
  const periodoMap: Record<string, string> = {
    'Manhã': 'manha',
    'Tarde': 'tarde',
    'Integral': 'integral',
  };

  async function salvar() {
    setErro('');
    if (!nome.trim() || !sala.trim()) {
      setErro('Preencha o nome e a turma do aluno.');
      return;
    }
    setSalvando(true);
    try {
      const dados = {
        nome: nome.trim(),
        sala: sala.trim(),
        periodo: periodoMap[periodo] ?? 'manha',
        ano_letivo: new Date().getFullYear(),
      };

      if (student?.id) {
        await alunosApi.atualizar(student.id, dados);
      } else {
        await alunosApi.criar(dados);
      }

      onSaved();   // recarrega a lista
      onClose();
    } catch (err: any) {
      setErro(err.message || 'Erro ao salvar o aluno.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl border-[#E7E5E4] p-8 sm:max-w-md">
        <div className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-[#FEE2E2]">
          <GraduationCap size={20} strokeWidth={1.7} color="#C8102E" />
        </div>
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-extrabold text-[#1C1917]">
            {student ? 'Editar aluno' : 'Adicionar aluno'}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-[#78716C]">
            Preencha os dados do aluno vinculado à sua conta.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <ParentInputField
            label="Nome completo"
            leftIcon={<User size={15} strokeWidth={1.6} />}
            type="text"
            placeholder="Nome completo do aluno"
            value={nome}
            onChange={(e: any) => setNome(e.target.value)}
          />
          <ParentInputField
            label="Turma / Série"
            leftIcon={<GraduationCap size={15} strokeWidth={1.6} />}
            type="text"
            placeholder="Ex: 2º EM A"
            value={sala}
            onChange={(e: any) => setSala(e.target.value)}
          />
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#1C1917]">Período</label>
            <div className="relative">
              <div className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#A8A29E]">
                <Clock size={15} strokeWidth={1.6} />
              </div>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-xl border border-[#E7E5E4] bg-[#FAFAF8] py-2.5 pr-9 pl-10 text-sm text-[#1C1917] transition-all focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20 focus:outline-none"
              >
                <option>Manhã</option>
                <option>Tarde</option>
                <option>Integral</option>
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[#A8A29E]" />
            </div>
          </div>

          {erro && (
            <p className="rounded-xl bg-[#FFF1F2] px-4 py-2.5 text-sm text-[#C8102E]">{erro}</p>
          )}
        </div>
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            className="flex-1 rounded-xl bg-[#F5F3F0] py-2.5 text-sm font-semibold text-[#78716C] transition-all hover:bg-[#EDE9E4]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={salvar}
            disabled={salvando}
            className="flex-1 rounded-xl bg-[#C8102E] py-2.5 text-sm font-bold text-white transition-all hover:bg-[#A50D26] active:scale-[0.98]"
          >
            {salvando ? 'Salvando...' : student ? 'Salvar alterações' : 'Adicionar aluno'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function studentInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

const periodoBg: Record<string, string> = {
  Manhã: '#FEF3C7',
  Tarde: '#DBEAFE',
  Noite: '#EDE9FE',
  Integral: '#D1FAE5',
};
const periodoColor: Record<string, string> = {
  Manhã: '#B45309',
  Tarde: '#1D4ED8',
  Noite: '#7C3AED',
  Integral: '#059669',
};

export function ParentDashboard({ navigate, activeTab }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>();
  const [claimsSubTab, setClaimsSubTab] = useState<'claims' | 'history'>('claims');

  const [minhasClaims, setMinhasClaims] = useState<any[]>([]);
  const [myStudents, setMyStudents] = useState<any[]>([]);

  async function carregarAlunos() {
    try {
      const dados = await alunosApi.listarMeus();
      setMyStudents(dados);
    } catch (err) {
      console.error('Erro ao carregar alunos:', err);
    }
  }

  useEffect(() => { carregarAlunos(); }, []);
  useEffect(() => {
    reivindicacoesApi.listarMinhas()
      .then(setMinhasClaims)
      .catch(err => console.error('Erro ao carregar reivindicações:', err));
  }, []);

  const currentClaims = minhasClaims.filter(c => c.status === 'Pendente' || c.status === 'Em Processo');
  const historyClaims = minhasClaims.filter(c => c.status === 'Entregue' || c.status === 'Descartado');
  const current = activeTab === 'students' ? 'my-students' : 'parent-dashboard';
  const showStudents = activeTab === 'students';

  const claimsList = claimsSubTab === 'history' ? historyClaims : currentClaims;

  return (
    <ParentLayout current={current} navigate={navigate}>
      {!showStudents ? (
        <div>
          <div className="mb-6">
            <h1 className="mb-1 text-xl font-extrabold text-[#1C1917]">Minhas Reivindicações</h1>
            <p className="text-sm text-[#78716C]">Acompanhe o status dos seus pedidos de retirada.</p>
          </div>

          <div className="mb-6 flex w-fit gap-1 rounded-xl border border-[#E7E5E4] bg-white p-1">
            {([
              { key: 'claims', label: 'Em andamento', count: currentClaims.length },
              { key: 'history', label: 'Histórico', count: historyClaims.length },
            ] as const).map(({ key, label, count }) => (
              <button
                key={key}
                type="button"
                onClick={() => setClaimsSubTab(key)}
                className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-150 ${
                  claimsSubTab === key
                    ? 'bg-[#C8102E] text-white shadow-sm'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                {label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                    claimsSubTab === key ? 'bg-white/25 text-white' : 'bg-[#F5F3F0] text-[#78716C]'
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          {claimsList.length > 0 ? (
            <div className="space-y-3">
              {claimsList.map(claim => (
                <ClaimCard key={claim.id} claim={claim} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E7E5E4] bg-white py-20 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#FEE2E2]">
                <FileText size={24} strokeWidth={1.4} className="text-[#C8102E]" />
              </div>
              <p className="mb-1.5 font-bold text-[#1C1917]">Nenhuma reivindicação aqui</p>
              <p className="mb-6 max-w-xs text-sm leading-relaxed text-[#A8A29E]">
                {claimsSubTab === 'history'
                  ? 'Seu histórico de reivindicações aparecerá aqui.'
                  : 'Você não tem reivindicações em andamento. Acesse a listagem de itens para iniciar uma.'}
              </p>
              {claimsSubTab !== 'history' && (
                <button
                  type="button"
                  onClick={() => navigate('public-listing')}
                  className="rounded-xl bg-[#C8102E] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#A50D26] active:scale-[0.98]"
                >
                  Ver itens disponíveis
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="mb-1 text-xl font-extrabold text-[#1C1917]">Meus Alunos</h1>
              <p className="text-sm text-[#78716C]">Alunos vinculados à sua conta.</p>
            </div>
            <button
              type="button"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-[#C8102E] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#A50D26] active:scale-[0.98]"
              onClick={() => { setEditingStudent(undefined); setModalOpen(true); }}
            >
              <Plus size={15} strokeWidth={2.2} />
              Adicionar aluno
            </button>
          </div>

          {myStudents.length > 0 ? (
            <div className="space-y-3">
              {myStudents.map(student => (
                <div
                  key={student.id}
                  className="flex items-center gap-4 rounded-2xl border border-black/[0.05] bg-white p-4 shadow-sm"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2]">
                    <span className="text-sm font-extrabold text-[#C8102E]">{studentInitials(student.name)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#1C1917]">{student.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-[#78716C]">
                        <GraduationCap size={11} strokeWidth={1.6} />
                        {student.room}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        style={{
                          backgroundColor: periodoBg[student.period] ?? '#F5F5F4',
                          color: periodoColor[student.period] ?? '#78716C',
                        }}
                      >
                        {student.period}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F5F3F0] text-[#78716C] transition-colors hover:bg-[#EDE9E4]"
                    aria-label="Editar aluno"
                    onClick={() => { setEditingStudent(student); setModalOpen(true); }}
                  >
                    <Pencil size={13} strokeWidth={1.8} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E7E5E4] bg-white py-20 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#FEE2E2]">
                <GraduationCap size={24} strokeWidth={1.4} className="text-[#C8102E]" />
              </div>
              <p className="mb-1.5 font-bold text-[#1C1917]">Nenhum aluno cadastrado</p>
              <p className="mb-6 max-w-xs text-sm text-[#A8A29E]">
                Adicione os alunos da sua família para gerenciar reivindicações.
              </p>
              <button
                type="button"
                onClick={() => { setEditingStudent(undefined); setModalOpen(true); }}
                className="rounded-xl bg-[#C8102E] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#A50D26] active:scale-[0.98]"
              >
                Adicionar primeiro aluno
              </button>
            </div>
          )}
        </div>
      )}

            <StudentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        student={editingStudent}
        onSaved={carregarAlunos}
      />
    </ParentLayout>
  );
}
