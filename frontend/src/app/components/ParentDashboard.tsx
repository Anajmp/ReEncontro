import { useEffect, useState } from 'react';
import { Plus, Pencil, GraduationCap, FileText, User, Clock, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ParentLayout } from './shared/ParentLayout';
import { ClaimCard, ParentInputField } from './shared/ParentChrome';
import { BannerIlustracao, BOTAO_PRIMARIO, CARD, EstadoVazio, PageBanner } from './shared/PageBanner';
import { chipClasses } from './shared/estilos';
import { reivindicacoesApi } from '../../lib/api';
import type { Screen } from '../App';
import { alunosApi } from '../../lib/api';

interface Props {
  navigate: (s: Screen) => void;
  activeTab: 'claims' | 'students';
}

// Aluno no formato devolvido por alunosApi.listarMeus() (traduzirAluno)
interface AlunoTela {
  id: number;
  name: string;
  room: string;
  period: string;
}

// Reivindicação no formato devolvido por reivindicacoesApi.listarMinhas()
interface ReivindicacaoTela {
  id: number;
  itemName: string;
  itemImage: string;
  studentName: string;
  studentRoom: string;
  studentPeriod: string;
  date: string;
  status: string;
  motivoRejeicao: string;
}
function StudentModal({
  open,
  onClose,
  student,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  student?: AlunoTela;
  onSaved: () => void;
}) {
  const [nome, setNome] = useState('');
  const [sala, setSala] = useState('');
  const [periodo, setPeriodo] = useState('Manhã');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [openAnterior, setOpenAnterior] = useState(false);
  const [studentAnterior, setStudentAnterior] = useState(student);

  // Preenche os campos quando abre (edição) ou limpa (novo).
  // Ajusta o estado durante o render quando `open`/`student` mudam (sem useEffect).
  if (open !== openAnterior || student !== studentAnterior) {
    setOpenAnterior(open);
    setStudentAnterior(student);
    if (open) {
      setNome(student?.name ?? '');
      setSala(student?.room ?? '');
      setPeriodo(student?.period ?? 'Manhã');
      setErro('');
    }
  }

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
    } catch (err: unknown) {
      setErro((err instanceof Error && err.message) || 'Erro ao salvar o aluno.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl border-linha p-8 sm:max-w-md">
        <div className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-marca-clara">
          <GraduationCap size={20} strokeWidth={1.7} color="#C8102E" />
        </div>
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-extrabold text-tinta">
            {student ? 'Editar aluno' : 'Adicionar aluno'}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-tinta-suave">
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value)}
          />
          <ParentInputField
            label="Turma / Série"
            leftIcon={<GraduationCap size={15} strokeWidth={1.6} />}
            type="text"
            placeholder="Ex: 2º EM A"
            value={sala}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSala(e.target.value)}
          />
          <div>
            <label htmlFor="aluno-periodo" className="mb-1.5 block text-sm font-semibold text-tinta">Período</label>
            <div className="relative">
              <div className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-tinta-suave">
                <Clock size={15} strokeWidth={1.6} />
              </div>
              <select
                id="aluno-periodo"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-xl border border-linha bg-campo py-2.5 pr-9 pl-10 text-sm text-tinta transition-all focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/20 focus:outline-none"
              >
                <option>Manhã</option>
                <option>Tarde</option>
                <option>Integral</option>
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-tinta-suave" aria-hidden />
            </div>
          </div>

          {erro && (
            <p role="alert" className="rounded-xl bg-erro-fundo px-4 py-2.5 text-sm text-marca-texto">{erro}</p>
          )}
        </div>
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            className="flex-1 rounded-xl bg-fundo py-2.5 text-sm font-semibold text-tinta-suave transition-all hover:bg-fundo-forte"
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
  Integral: '#047857',
};

export function ParentDashboard({ navigate, activeTab }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<AlunoTela | undefined>();
  const [claimsSubTab, setClaimsSubTab] = useState<'claims' | 'history'>('claims');

  const [minhasClaims, setMinhasClaims] = useState<ReivindicacaoTela[]>([]);
  const [myStudents, setMyStudents] = useState<AlunoTela[]>([]);

  async function carregarAlunos() {
    try {
      const dados = await alunosApi.listarMeus();
      setMyStudents(dados);
    } catch (err) {
      console.error('Erro ao carregar alunos:', err);
    }
  }

  useEffect(() => {
    alunosApi.listarMeus()
      .then(setMyStudents)
      .catch(err => console.error('Erro ao carregar alunos:', err));
  }, []);
  useEffect(() => {
    reivindicacoesApi.listarMinhas()
      .then(setMinhasClaims)
      .catch(err => console.error('Erro ao carregar reivindicações:', err));
  }, []);

  const currentClaims = minhasClaims.filter(c => c.status === 'Pendente' || c.status === 'Em Processo');
  const historyClaims = minhasClaims.filter(c =>
  c.status === 'Entregue' || c.status === 'Rejeitada' || c.status === 'Cancelada'
);
  const current = activeTab === 'students' ? 'my-students' : 'parent-dashboard';
  const showStudents = activeTab === 'students';

  const claimsList = claimsSubTab === 'history' ? historyClaims : currentClaims;

  return (
    <ParentLayout current={current} navigate={navigate}>
      {!showStudents ? (
        <>
          <PageBanner
            selo={`${currentClaims.length} ${currentClaims.length === 1 ? 'pedido em andamento' : 'pedidos em andamento'}`}
            titulo="Minhas reivindicações"
            ilustracao={<BannerIlustracao Icon={FileText} />}
          >
            Acompanhe o status dos seus pedidos de retirada. Assim que a equipe confirmar,
            você recebe um e-mail com as instruções.
          </PageBanner>

          <div className={`mb-4 ${CARD}`}>
            <div className="flex flex-nowrap gap-2" role="group" aria-label="Situação das reivindicações">
              {([
                { key: 'claims', label: 'Em andamento', count: currentClaims.length },
                { key: 'history', label: 'Histórico', count: historyClaims.length },
              ] as const).map(({ key, label, count }) => {
                const ativo = claimsSubTab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => setClaimsSubTab(key)}
                    className={`flex items-center gap-2 ${chipClasses(ativo)}`}
                  >
                    {label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                        ativo ? 'bg-white/25 text-white' : 'bg-fundo text-tinta-suave'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mb-5 text-sm text-tinta-suave">
            {claimsList.length} {claimsList.length === 1 ? 'reivindicação' : 'reivindicações'}
          </p>

          {claimsList.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:gap-5 lg:grid-cols-2">
              {claimsList.map(claim => (
                <ClaimCard key={claim.id} claim={claim} />
              ))}
            </div>
          ) : (
            <EstadoVazio
              Icon={FileText}
              titulo="Nenhuma reivindicação aqui"
              acao={claimsSubTab !== 'history' && (
                <button type="button" onClick={() => navigate('public-listing')} className={BOTAO_PRIMARIO}>
                  Ver itens disponíveis
                </button>
              )}
            >
              {claimsSubTab === 'history'
                ? 'Seu histórico de reivindicações aparecerá aqui.'
                : 'Você não tem reivindicações em andamento. Acesse a listagem de itens para iniciar uma.'}
            </EstadoVazio>
          )}
        </>
      ) : (
        <>
          <PageBanner
            selo={`${myStudents.length} ${myStudents.length === 1 ? 'aluno vinculado' : 'alunos vinculados'}`}
            titulo="Meus alunos"
            ilustracao={<BannerIlustracao Icon={GraduationCap} />}
            acao={
              <button
                type="button"
                className={BOTAO_PRIMARIO}
                onClick={() => { setEditingStudent(undefined); setModalOpen(true); }}
              >
                <Plus size={15} strokeWidth={2.2} />
                Adicionar aluno
              </button>
            }
          >
            Cadastre os alunos da sua família para preencher as reivindicações mais rápido.
          </PageBanner>

          <p className="mb-5 text-sm text-tinta-suave">
            {myStudents.length} {myStudents.length === 1 ? 'aluno cadastrado' : 'alunos cadastrados'}
          </p>

          {myStudents.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {myStudents.map(student => (
                <div
                  key={student.id}
                  className="flex items-center gap-4 rounded-2xl border border-contorno bg-superficie p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-marca-clara" aria-hidden>
                    <span className="text-sm font-extrabold text-marca-texto">{studentInitials(student.name)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-tinta">{student.name}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-tinta-suave">
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
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-fundo text-tinta-suave transition-colors hover:bg-marca-clara hover:text-marca-texto"
                    aria-label={`Editar ${student.name}`}
                    onClick={() => { setEditingStudent(student); setModalOpen(true); }}
                  >
                    <Pencil size={13} strokeWidth={1.8} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EstadoVazio
              Icon={GraduationCap}
              titulo="Nenhum aluno cadastrado"
              acao={
                <button
                  type="button"
                  onClick={() => { setEditingStudent(undefined); setModalOpen(true); }}
                  className={BOTAO_PRIMARIO}
                >
                  Adicionar primeiro aluno
                </button>
              }
            >
              Adicione os alunos da sua família para gerenciar reivindicações.
            </EstadoVazio>
          )}
        </>
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
