import { useState, useEffect, useMemo, type MouseEvent } from 'react';
import {
  Search, MapPin, Calendar, Check, X, SlidersHorizontal, ListFilter, Glasses, Key,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { StatusBadge } from './shared/StatusBadge';
import { itensApi, reivindicacoesApi, alunosApi,referenciasApi } from '../../lib/api';
import type { Item } from './shared/data';
import type { Screen } from '../App';
import { useNavigate } from 'react-router-dom';
import { getUsuario } from '../../lib/auth';
import { SiteFooter, SiteHeader } from './shared/SiteHeader';
import { BannerIlustracao, PageBanner } from './shared/PageBanner';
import { useLoginSplash } from './LoginSplash';
import { getCatConfig } from './shared/AdminChrome';

interface Props {
  navigate: (s: Screen) => void;
}

const FONT = { fontFamily: 'Plus Jakarta Sans, sans-serif' };

type Ordem = 'recentes' | 'antigos' | 'nome';

// Lupa da tela de carregamento "encontrando" uma chave e uns óculos
function WelcomeIllustration() {
  const oculos = getCatConfig('Acessório');
  const chave = getCatConfig('Outros');
  return (
    <BannerIlustracao>
      <g transform="translate(-12 -12) rotate(-12)">
        <circle r="17" fill={oculos.bg} />
        <Glasses x={-11} y={-11} width={22} height={22} color={oculos.color} strokeWidth={1.8} />
      </g>
      <g transform="translate(14 14) rotate(14)">
        <circle r="15" fill={chave.bg} />
        <Key x={-10} y={-10} width={20} height={20} color={chave.color} strokeWidth={1.8} />
      </g>
    </BannerIlustracao>
  );
}

function dataParaIso(dataPt: string) {
  const partes = dataPt.split('/');
  if (partes.length !== 3) return '';
  const [dia, mes, ano] = partes;
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

function ClaimModal({
  item,
  open,
  onClose,
  onCadastrar,
}: {
  item: Item | null;
  open: boolean;
  onClose: () => void;
  onCadastrar: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
  const usuario = getUsuario();
  const [submitted, setSubmitted] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nomeAluno, setNomeAluno] = useState('');
  const [sala, setSala] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [alunos, setAlunos] = useState<any[]>([]);
  const [alunoId, setAlunoId] = useState('');

  const periodoMap: Record<string, string> = {
    Manhã: 'manha',
    Tarde: 'tarde',
    Integral: 'integral',
  };

  function selecionarAluno(aluno: any) {
    setAlunoId(String(aluno.id));
    setNomeAluno(aluno.name);
    setSala(aluno.room);
    setPeriodo(periodoMap[aluno.period] || aluno.periodoRaw || aluno.period);
  }

  function trocarAluno(id: string) {
    if (id === 'outro') {
      setAlunoId('outro');
      setNomeAluno('');
      setSala('');
      setPeriodo('');
      return;
    }
    const aluno = alunos.find(a => String(a.id) === id);
    if (aluno) selecionarAluno(aluno);
  }

  useEffect(() => {
    if (!open) return;

    if (usuario) {
      setNome(usuario.nome || '');
      setEmail(usuario.email || '');
      setTelefone(usuario.telefone || '');

      alunosApi.listarMeus()
        .then(lista => {
          setAlunos(lista);
          if (lista.length === 1) {
            selecionarAluno(lista[0]);
          }
        })
        .catch(err => console.error('Erro ao carregar alunos:', err));
    } else {
      setAlunos([]);
      setAlunoId('');
    }
  }, [open]);

  if (!item) return null;

  const cfg = getCatConfig(item.category);
  const CatIcon = cfg.Icon;
  const mostrarSeletor = Boolean(usuario && alunos.length > 1);
  const alunoTravado = Boolean(alunoId && alunoId !== 'outro');

  async function enviar() {
    setErro('');
    if (!item) return;
    if (!nome || !email || !nomeAluno || !sala || !periodo) {
      setErro('Preencha todos os campos obrigatórios (*)');
      return;
    }
    setEnviando(true);
    try {
      await reivindicacoesApi.criar({
        item_id: item.id,
        aluno_id: alunoId && alunoId !== 'outro' ? Number(alunoId) : undefined,
        nome_requerente: nome,
        email_requerente: email,
        telefone_requerente: telefone || undefined,
        nome_aluno: nomeAluno,
        sala_aluno: sala,
        periodo_aluno: periodo,
      });
      setSubmitted(true);
    } catch (err: any) {
      setErro(err.message || 'Erro ao enviar reivindicação');
    } finally {
      setEnviando(false);
    }
  }

  function fechar() {
    onClose();
    setSubmitted(false);
    setErro('');
    if (!usuario) {
      setNome('');
      setEmail('');
      setTelefone('');
    }
    setNomeAluno('');
    setSala('');
    setPeriodo('');
    setAlunoId('');
  }

  const modalClass =
    'max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl border-0 p-8 shadow-2xl [&_[data-slot=dialog-close]]:top-5 [&_[data-slot=dialog-close]]:right-5 [&_[data-slot=dialog-close]]:flex [&_[data-slot=dialog-close]]:size-8 [&_[data-slot=dialog-close]]:items-center [&_[data-slot=dialog-close]]:justify-center [&_[data-slot=dialog-close]]:rounded-full [&_[data-slot=dialog-close]]:bg-[#F5F3F0] [&_[data-slot=dialog-close]]:text-[#78716C] [&_[data-slot=dialog-close]]:opacity-100 hover:[&_[data-slot=dialog-close]]:bg-[#EDE9E4]';

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={fechar}>
        <DialogContent className={modalClass} style={FONT}>
          <div className="py-4 text-center">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#DCFCE7]">
              <Check className="size-6 text-[#16A34A]" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-[#1C1917]">Reivindicação enviada</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[#78716C]">
              Você receberá um e-mail em breve. Nossa equipe vai entrar em contato para confirmar a retirada.
            </p>
            <button
              type="button"
              className="mt-6 rounded-xl bg-[#C8102E] px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#A50D26] active:scale-[0.98]"
              onClick={fechar}
            >
              Fechar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={modalClass} style={FONT}>
        <DialogHeader className="pr-8 text-left">
          <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-[#FEE2E2]">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#C8102E" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="10" cy="10" r="7" />
              <path d="M15.5 15.5 L20 20" />
            </svg>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-[#1C1917]">Este item é meu</DialogTitle>
          <p className="text-sm leading-relaxed text-[#78716C]">
            Reivindicando: <span className="font-semibold text-[#1C1917]">{item.name}</span>
          </p>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-xl border border-black/[0.06] p-3" style={{ backgroundColor: `${cfg.bg}55` }}>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
            <CatIcon size={20} strokeWidth={1.6} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#1C1917]">{item.name}</p>
            <p className="text-xs text-[#78716C]">{item.location} · {item.date}</p>
          </div>
        </div>

        {!usuario && (
          <div className="rounded-xl border border-amber-200/80 bg-amber-50 px-3.5 py-3 text-sm text-amber-900">
            Quer acompanhar o status pelo site?{' '}
            <button
              type="button"
              className="font-semibold text-[#C8102E] underline-offset-2 hover:underline"
              onClick={onCadastrar}
            >
              Cadastre-se
            </button>{' '}
            antes de reivindicar.
          </div>
        )}

        <div className="space-y-4 py-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="claim-name" className="font-semibold text-[#1C1917]">Nome completo *</Label>
              <Input id="claim-name" placeholder="Seu nome completo" value={nome} onChange={e => setNome(e.target.value)} className="rounded-xl border-[#E7E5E4]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="claim-email" className="font-semibold text-[#1C1917]">E-mail *</Label>
              <Input id="claim-email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl border-[#E7E5E4]" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="claim-phone" className="font-semibold text-[#1C1917]">
              Telefone <span className="font-normal text-[#A8A29E]">(opcional)</span>
            </Label>
            <Input id="claim-phone" placeholder="(19) 99999-9999" value={telefone} onChange={e => setTelefone(e.target.value)} className="rounded-xl border-[#E7E5E4]" />
          </div>

          {mostrarSeletor && (
            <div className="space-y-1.5">
              <Label className="font-semibold text-[#1C1917]">Qual aluno? *</Label>
              <Select value={alunoId} onValueChange={trocarAluno}>
                <SelectTrigger className="rounded-xl border-[#E7E5E4]">
                  <SelectValue placeholder="Selecione o aluno" />
                </SelectTrigger>
                <SelectContent>
                  {alunos.map(a => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.name} — {a.room} · {a.period}
                    </SelectItem>
                  ))}
                  <SelectItem value="outro">Outro aluno (preencher manualmente)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="claim-student" className="font-semibold text-[#1C1917]">Nome do aluno *</Label>
              <Input
                id="claim-student"
                placeholder="Nome completo do aluno"
                value={nomeAluno}
                onChange={e => setNomeAluno(e.target.value)}
                disabled={alunoTravado}
                className="rounded-xl border-[#E7E5E4] disabled:bg-[#F5F3F0]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="claim-room" className="font-semibold text-[#1C1917]">Sala *</Label>
              <Input
                id="claim-room"
                placeholder="Ex: 5A"
                value={sala}
                onChange={e => setSala(e.target.value)}
                disabled={alunoTravado}
                className="rounded-xl border-[#E7E5E4] disabled:bg-[#F5F3F0]"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="font-semibold text-[#1C1917]">Período *</Label>
            <Select value={periodo} onValueChange={setPeriodo} disabled={alunoTravado}>
              <SelectTrigger className="rounded-xl border-[#E7E5E4] disabled:bg-[#F5F3F0]">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manha">Manhã</SelectItem>
                <SelectItem value="tarde">Tarde</SelectItem>
                <SelectItem value="integral">Integral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {erro && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[#F5F3F0] pt-4 sm:flex-row sm:gap-3">
          <Button variant="outline" className="flex-1 rounded-xl border-[#E7E5E4]" onClick={onClose} disabled={enviando}>
            Cancelar
          </Button>
          <Button className="flex-1 rounded-xl bg-[#C8102E] hover:bg-[#A50D26] active:scale-[0.98]" onClick={enviar} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar reivindicação'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CardEsqueleto() {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.05] bg-white shadow-sm">
      <div className="aspect-[6/7] animate-pulse bg-[#F5F3F0]" />
      <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-[#F5F3F0]" />
        <div className="h-4 w-16 animate-pulse rounded-full bg-[#F5F3F0]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[#F5F3F0]" />
        <div className="h-8 w-full animate-pulse rounded-xl bg-[#F5F3F0]" />
      </div>
    </div>
  );
}

function ItemCard({
  item,
  onDetalhe,
  onReivindicar,
}: {
  item: Item;
  onDetalhe: () => void;
  onReivindicar: () => void;
}) {
  const indisponivel = item.status === 'Entregue' || item.status === 'Descartado';
  const cfg = getCatConfig(item.category);
  const CatIcon = cfg.Icon;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/[0.05] bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <button type="button" className="relative aspect-[6/7] overflow-hidden bg-[#F5F3F0] text-left" onClick={onDetalhe}>
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/25 to-transparent" />
        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={item.status} className="shadow-sm backdrop-blur-sm" />
        </div>
      </button>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <span
          className="mb-2 inline-flex w-fit max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:mb-2.5 sm:px-2.5 sm:py-1 sm:text-[11px]"
          style={{ backgroundColor: cfg.bg, color: cfg.color }}
        >
          <CatIcon size={10} strokeWidth={2} className="sm:hidden" />
          <CatIcon size={11} strokeWidth={2} className="hidden sm:block" />
          <span className="truncate">{item.category}</span>
        </span>

        <button type="button" className="min-w-0 text-left" onClick={onDetalhe}>
          <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-[#1C1917] transition-colors group-hover:text-[#C8102E] sm:text-sm" style={FONT}>
            {item.name}
          </h3>
        </button>

        <div className="mt-2 space-y-1 sm:mt-3 sm:space-y-1.5">
          <div className="flex items-center gap-1 text-[10px] text-[#78716C] sm:gap-1.5 sm:text-xs">
            <MapPin className="size-2.5 shrink-0 sm:size-3" strokeWidth={1.5} />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#78716C] sm:gap-1.5 sm:text-xs">
            <Calendar className="size-2.5 shrink-0 sm:size-3" strokeWidth={1.5} />
            {item.date}
          </div>
        </div>

        <div className="mt-auto pt-3 sm:pt-4">
          <button
            type="button"
            onClick={onReivindicar}
            disabled={indisponivel}
            className={`w-full rounded-xl py-1.5 text-xs font-semibold transition-all duration-150 sm:py-2 sm:text-sm ${
              indisponivel
                ? 'cursor-not-allowed bg-[#F5F3F0] text-[#A8A29E]'
                : 'bg-[#C8102E] text-white hover:bg-[#A50D26] active:scale-[0.98]'
            }`}
            style={FONT}
          >
            {indisponivel ? 'Indisponível' : 'É meu!'}
          </button>
        </div>
      </div>
    </article>
  );
}

export function PublicListing({ navigate }: Props) {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [claimOpen, setClaimOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [dataFiltro, setDataFiltro] = useState('');
  const [ordem, setOrdem] = useState<Ordem>('recentes');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const routerNavigate = useNavigate();
  const { playCadastroTransition } = useLoginSplash();


  useEffect(() => {
    referenciasApi.categorias().then(setCategorias).catch(console.error);
  }, []);

  useEffect(() => {
    itensApi.listar()
      .then(setItems)
      .catch(err => console.error('Erro ao carregar itens:', err))
      .finally(() => setLoading(false));
  }, []);

  const itensIndexados = useMemo(
  () =>
    items.map(item => ({
      item,
      texto: [item.name, item.description, item.location].join('\n').toLowerCase(),
      dataIso: dataParaIso(item.date),
    })),
  [items]
);

const filtered = useMemo(() => {
  const q = search.trim().toLowerCase();
  return itensIndexados
    .filter(({ item, texto, dataIso }) =>
      (!q || texto.includes(q)) &&
      (category === 'all' || item.category === category) &&
      (!dataFiltro || dataIso === dataFiltro)
    )
    .sort((a, b) => {
      if (ordem === 'nome') return a.item.name.localeCompare(b.item.name, 'pt-BR');
      // Itens sem data vão sempre para o final
      if (!a.dataIso || !b.dataIso) return Number(!a.dataIso) - Number(!b.dataIso);
      const cmp = a.dataIso.localeCompare(b.dataIso);
      return ordem === 'recentes' ? -cmp : cmp;
    })
    .map(({ item }) => item);
}, [itensIndexados, search, category, dataFiltro, ordem]);

  const temFiltro = Boolean(search || dataFiltro || category !== 'all');

  function limparFiltros() {
    setSearch('');
    setDataFiltro('');
    setCategory('all');
  }

  const disponiveis = useMemo(
  () => items.filter(i => i.status === 'Disponível').length,
  [items]
);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#F5F3F0]" style={FONT}>
      <SiteHeader navigate={navigate} />

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-8 sm:py-8">
        <PageBanner
          selo={loading
            ? 'Carregando itens…'
            : `${disponiveis} ${disponiveis === 1 ? 'item disponível' : 'itens disponíveis'}`}
          titulo="Encontrou algo que é seu?"
          ilustracao={<WelcomeIllustration />}
        >
          Aqui estão todos os itens encontrados no SESI Nova Odessa. Reconheceu algo? Clique em{' '}
          <span className="font-bold text-[#C8102E]">“É meu!”</span> para iniciar a reivindicação.
        </PageBanner>

        <div className="mb-4 rounded-2xl border border-black/[0.05] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[17px] -translate-y-1/2 text-[#A8A29E]" strokeWidth={1.8} />
              <Input
                className="h-11 rounded-xl border-[#E7E5E4] bg-white pr-10 pl-10 text-[#1C1917] placeholder:text-[#A8A29E] focus-visible:border-[#C8102E] focus-visible:ring-[#C8102E]/20"
                placeholder="Buscar por nome ou local"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Buscar itens"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-[#78716C] transition-colors hover:bg-[#F5F3F0] hover:text-[#1C1917]"
                  aria-label="Limpar busca"
                >
                  <X className="size-4" strokeWidth={1.8} />
                </button>
              )}
            </div>
            <div className="relative w-full sm:w-60">
              <Calendar className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-[17px] -translate-y-1/2 text-[#A8A29E]" strokeWidth={1.8} />
              {/* O ícone nativo do calendário fica invisível cobrindo o campo todo:
                  clicar em qualquer ponto abre o seletor, e o visual segue o da busca */}
              <Input
                type="date"
                className={`relative h-11 w-full rounded-xl border-[#E7E5E4] bg-white pr-10 pl-10 focus-visible:border-[#C8102E] focus-visible:ring-[#C8102E]/20 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 ${
                  dataFiltro ? 'text-[#1C1917]' : 'text-[#A8A29E]'
                }`}
                value={dataFiltro}
                onChange={e => setDataFiltro(e.target.value)}
                aria-label="Filtrar por data em que o item foi encontrado"
              />
              {dataFiltro && (
                <button
                  type="button"
                  onClick={() => setDataFiltro('')}
                  className="absolute top-1/2 right-3 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-[#78716C] transition-colors hover:bg-[#F5F3F0] hover:text-[#1C1917]"
                  aria-label="Limpar data"
                >
                  <X className="size-4" strokeWidth={1.8} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 sm:justify-between sm:gap-3">
            <div className="-ml-4 min-w-0 flex-1 overflow-x-auto pl-4 scrollbar-hide sm:ml-0 sm:overflow-visible sm:pl-0">
              <div className="flex flex-nowrap gap-2 sm:flex-wrap" role="tablist" aria-label="Categorias">
                {[{ id: 'all', label: 'Todos' }, ...categorias.map(c => ({ id: c.nome, label: c.nome }))].map(cat => {
                  const ativo = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={ativo}
                      onClick={() => setCategory(cat.id)}
                      className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-150 ${
                        ativo
                          ? 'bg-[#C8102E] text-white shadow-sm shadow-[#C8102E]/20'
                          : 'border border-[#E7E5E4] bg-white text-[#57534E] hover:border-[#C8102E]/30 hover:text-[#C8102E]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={limparFiltros}
              disabled={!temFiltro}
              className="flex size-9 shrink-0 items-center justify-center gap-2 rounded-full border border-[#E7E5E4] text-sm font-medium text-[#57534E] transition-colors hover:text-[#C8102E] disabled:cursor-default disabled:opacity-50 disabled:hover:text-[#57534E] sm:size-auto sm:rounded-lg sm:border-0 sm:px-2 sm:py-1.5"
              aria-label="Limpar filtros"
              title="Limpar filtros"
            >
              <SlidersHorizontal className="size-4" strokeWidth={1.8} />
              <span className="hidden sm:inline">Limpar filtros</span>
            </button>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-[#78716C]">
            {loading ? 'Carregando…' : `${filtered.length} ${filtered.length === 1 ? 'item encontrado' : 'itens encontrados'}`}
          </p>
          <Select value={ordem} onValueChange={v => setOrdem(v as Ordem)}>
            <SelectTrigger className="h-10 w-auto gap-2 rounded-xl border-[#E7E5E4] bg-white px-3.5 text-sm font-medium text-[#1C1917] shadow-sm" aria-label="Ordenar itens">
              <ListFilter className="size-4 text-[#78716C]" strokeWidth={1.8} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recentes">Mais recentes</SelectItem>
              <SelectItem value="antigos">Mais antigos</SelectItem>
              <SelectItem value="nome">Nome (A–Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <CardEsqueleto key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-[#E7E5E4] bg-white shadow-sm">
              <Search className="size-7 text-[#D4CFC9]" strokeWidth={1.2} />
            </div>
            <p className="mb-1 text-base font-bold text-[#1C1917]">Nenhum item encontrado</p>
            <p className="text-sm text-[#A8A29E]">Tente outro termo, categoria ou data.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {filtered.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onDetalhe={() => routerNavigate(`/item/${item.id}`)}
                onReivindicar={() => {
                  setSelectedItem(item);
                  setClaimOpen(true);
                }}
              />
            ))}
          </div>
        )}

      </main>

      <SiteFooter />

      <ClaimModal
        item={selectedItem}
        open={claimOpen}
        onClose={() => setClaimOpen(false)}
        onCadastrar={e => {
          setClaimOpen(false);
          playCadastroTransition(e);
        }}
      />
    </div>
  );
}
