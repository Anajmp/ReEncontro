import { useState, useEffect } from 'react';
import {
  Search, MapPin, Calendar, LogIn, Check, User, LogOut,
  BookOpen, Shirt, Watch, Headphones, Package, Footprints,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { StatusBadge } from './shared/StatusBadge';
import { itensApi, reivindicacoesApi } from '../../lib/api';
import type { Item } from './shared/data';
import type { Screen } from '../App';
import { useNavigate } from 'react-router-dom';
import { getUsuario, logout } from '../../lib/auth';
import { useLoginSplash } from './LoginSplash';

interface Props {
  navigate: (s: Screen) => void;
}

const FONT = { fontFamily: 'Plus Jakarta Sans, sans-serif' };

const CAT_CONFIG: Record<string, { color: string; bg: string; Icon: typeof BookOpen }> = {
  'Material Escolar': { color: '#D97706', bg: '#FEF3C7', Icon: BookOpen },
  'Vestuário': { color: '#059669', bg: '#D1FAE5', Icon: Shirt },
  'Acessórios': { color: '#7C3AED', bg: '#EDE9FE', Icon: Watch },
  'Eletrônicos': { color: '#4F46E5', bg: '#E0E7FF', Icon: Headphones },
  'Calçados': { color: '#B45309', bg: '#FEF9C3', Icon: Footprints },
  'Outros': { color: '#B45309', bg: '#FEF9C3', Icon: Package },
};

const CATEGORIAS = [
  { id: 'all', label: 'Todos' },
  { id: 'Material Escolar', label: 'Material Escolar' },
  { id: 'Vestuário', label: 'Vestuário' },
  { id: 'Acessórios', label: 'Acessórios' },
  { id: 'Eletrônicos', label: 'Eletrônicos' },
  { id: 'Calçados', label: 'Calçados' },
  { id: 'Outros', label: 'Outros' },
];

function getCatConfig(category: string) {
  return CAT_CONFIG[category] ?? { color: '#78716C', bg: '#F5F5F4', Icon: Package };
}

function LogoMarca() {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden className="shrink-0">
        <circle cx="14" cy="14" r="9.5" stroke="#C8102E" strokeWidth="2.3" fill="none" />
        <path d="M21.5 21.5 L30 30" stroke="#C8102E" strokeWidth="2.3" strokeLinecap="round" />
        <circle cx="8.5" cy="8.5" r="1.7" fill="#C8102E" fillOpacity="0.38" />
        <circle cx="20.5" cy="8" r="1.1" fill="#C8102E" fillOpacity="0.28" />
        <circle cx="22" cy="21" r="0.9" fill="#C8102E" fillOpacity="0.32" />
        <circle cx="7" cy="21" r="1.3" fill="#C8102E" fillOpacity="0.2" />
      </svg>
      <div className="min-w-0">
        <p className="truncate text-[1.15rem] font-bold tracking-tight text-[#1C1917]" style={FONT}>
          Re<span className="text-[#C8102E]">Encontro</span>
        </p>
        <p className="hidden truncate text-[11px] font-medium tracking-wide text-[#A8A29E] uppercase sm:block">
          SESI Nova Odessa
        </p>
      </div>
    </div>
  );
}

function WelcomeIllustration() {
  return (
    <svg width="210" height="148" viewBox="0 0 210 148" fill="none" aria-hidden className="flex-shrink-0">
      <ellipse cx="105" cy="74" rx="94" ry="66" fill="#FEE2E2" fillOpacity="0.45" />
      <ellipse cx="112" cy="68" rx="58" ry="44" fill="#FEE2E2" fillOpacity="0.28" />
      <path d="M122 106 L152 136" stroke="#C8102E" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="88" cy="71" r="43" fill="white" fillOpacity="0.84" />
      <circle cx="88" cy="71" r="43" stroke="#C8102E" strokeWidth="2.4" fill="none" />
      <circle cx="74" cy="59" r="10.5" stroke="#9CA3AF" strokeWidth="1.8" fill="none" />
      <path d="M83 59 H103" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M99 59 V65.5" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M93 59 V64.5" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="76" cy="86" r="10" stroke="#9CA3AF" strokeWidth="1.6" fill="none" />
      <circle cx="98" cy="86" r="10" stroke="#9CA3AF" strokeWidth="1.6" fill="none" />
      <path d="M86 86 H88" stroke="#9CA3AF" strokeWidth="1.6" />
      <path d="M66 82 L61.5 81" stroke="#9CA3AF" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M108 82 L112.5 81" stroke="#9CA3AF" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M28 27 L30.8 18.5 L33.5 27 L42 29.8 L33.5 32.5 L30.8 41 L28 32.5 L19.5 29.8Z" fill="#C8102E" fillOpacity="0.17" />
      <path d="M170 40 L172 35 L174 40 L179 42 L174 44 L172 49 L170 44 L165 42Z" fill="#C8102E" fillOpacity="0.14" />
      <circle cx="46" cy="122" r="5.5" fill="#FCA5A5" fillOpacity="0.52" />
      <circle cx="174" cy="117" r="3.8" fill="#FCA5A5" fillOpacity="0.44" />
    </svg>
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
  onCadastrar: () => void;
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

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || '');
      setEmail(usuario.email || '');
    }
  }, [open]);

  if (!item) return null;

  const cfg = getCatConfig(item.category);
  const CatIcon = cfg.Icon;

  async function enviar() {
    setErro('');
    if (!item) return;
    if (!nome || !email || !nomeAluno || !sala || !periodo) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }
    setEnviando(true);
    try {
      await reivindicacoesApi.criar({
        item_id: item.id,
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
    setNomeAluno('');
    setSala('');
    setPeriodo('');
    setTelefone('');
    setErro('');
    if (!usuario) {
      setNome('');
      setEmail('');
    }
  }

  const modalClass =
    'max-w-lg rounded-3xl border-0 p-8 shadow-2xl [&_[data-slot=dialog-close]]:top-5 [&_[data-slot=dialog-close]]:right-5 [&_[data-slot=dialog-close]]:flex [&_[data-slot=dialog-close]]:size-8 [&_[data-slot=dialog-close]]:items-center [&_[data-slot=dialog-close]]:justify-center [&_[data-slot=dialog-close]]:rounded-full [&_[data-slot=dialog-close]]:bg-[#F5F3F0] [&_[data-slot=dialog-close]]:text-[#78716C] [&_[data-slot=dialog-close]]:opacity-100 hover:[&_[data-slot=dialog-close]]:bg-[#EDE9E4]';

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
            <Input id="claim-phone" placeholder="(11) 99999-9999" value={telefone} onChange={e => setTelefone(e.target.value)} className="rounded-xl border-[#E7E5E4]" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="claim-student" className="font-semibold text-[#1C1917]">Nome do aluno *</Label>
              <Input id="claim-student" placeholder="Nome completo do aluno" value={nomeAluno} onChange={e => setNomeAluno(e.target.value)} className="rounded-xl border-[#E7E5E4]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="claim-room" className="font-semibold text-[#1C1917]">Sala *</Label>
              <Input id="claim-room" placeholder="Ex: 5A" value={sala} onChange={e => setSala(e.target.value)} className="rounded-xl border-[#E7E5E4]" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="font-semibold text-[#1C1917]">Período *</Label>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="rounded-xl border-[#E7E5E4]">
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
      <div className="h-44 animate-pulse bg-[#F5F3F0]" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#F5F3F0]" />
        <div className="h-5 w-20 animate-pulse rounded-full bg-[#F5F3F0]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[#F5F3F0]" />
        <div className="h-9 w-full animate-pulse rounded-xl bg-[#F5F3F0]" />
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
      <button type="button" className="relative h-44 overflow-hidden bg-[#F5F3F0] text-left" onClick={onDetalhe}>
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

      <div className="flex flex-1 flex-col p-4">
        <span
          className="mb-2.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{ backgroundColor: cfg.bg, color: cfg.color }}
        >
          <CatIcon size={11} strokeWidth={2} />
          {item.category}
        </span>

        <button type="button" className="text-left" onClick={onDetalhe}>
          <h3 className="text-sm font-semibold leading-snug text-[#1C1917] transition-colors group-hover:text-[#C8102E]" style={FONT}>
            {item.name}
          </h3>
        </button>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-[#78716C]">
            <MapPin className="size-3 shrink-0" strokeWidth={1.5} />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#78716C]">
            <Calendar className="size-3 shrink-0" strokeWidth={1.5} />
            {item.date}
          </div>
        </div>

        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={onReivindicar}
            disabled={indisponivel}
            className={`w-full rounded-xl py-2 text-sm font-semibold transition-all duration-150 ${
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
  const { playLoginTransition } = useLoginSplash();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [claimOpen, setClaimOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [dataFiltro, setDataFiltro] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const routerNavigate = useNavigate();
  const usuario = getUsuario();

  useEffect(() => {
    itensApi.listar()
      .then(setItems)
      .catch(err => console.error('Erro ao carregar itens:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(item => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q);
    const matchCategory = category === 'all' || item.category === category;
    const matchDate = !dataFiltro || dataParaIso(item.date) === dataFiltro;
    return matchSearch && matchCategory && matchDate;
  });

  const disponiveis = items.filter(i => i.status === 'Disponível').length;

  return (
    <div className="relative min-h-screen bg-[#F5F3F0] pb-24" style={FONT}>
      <header className="sticky top-0 z-20 border-b border-[#E7E5E4] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
          <LogoMarca />

          {usuario ? (
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(usuario.role === 'funcionaria' ? 'admin-dashboard' : 'parent-dashboard')}
                className="gap-2 rounded-xl border-[#E7E5E4] bg-white text-[#78716C]"
              >
                <User className="size-4" />
                <span className="hidden sm:inline">{usuario.nome.split(' ')[0]}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  window.location.reload();
                }}
                className="gap-2 text-[#78716C]"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={playLoginTransition}
              className="gap-2 font-semibold text-[#78716C] hover:text-[#C8102E]"
            >
              <LogIn className="size-4" />
              Entrar
            </Button>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-black/[0.05] bg-white shadow-sm">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(to left, rgba(254,226,226,0.4) 0%, transparent 55%)' }}
          />
          <div className="relative flex items-center justify-between gap-6 px-8 py-7">
            <div className="min-w-0 flex-1">
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-3 py-1 text-xs font-bold text-[#C8102E]">
                <span className="size-1.5 animate-pulse rounded-full bg-[#C8102E]" />
                {loading ? 'Carregando itens…' : `${disponiveis} itens disponíveis`}
              </div>
              <h1 className="mb-2 text-2xl font-extrabold leading-tight text-[#1C1917]">
                Encontrou algo que é seu?
              </h1>
              <p className="max-w-sm text-sm leading-relaxed text-[#78716C]">
                Aqui estão todos os itens encontrados no SESI Nova Odessa. Reconheceu algo? Clique em{' '}
                <span className="font-bold text-[#C8102E]">“É meu!”</span> para iniciar a reivindicação.
              </p>
            </div>
            <div className="hidden md:block">
              <WelcomeIllustration />
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[15px] -translate-y-1/2 text-[#A8A29E]" strokeWidth={1.8} />
            <Input
              className="h-11 rounded-xl border-[#E7E5E4] bg-white pl-10 text-[#1C1917] placeholder:text-[#C4BFBA] focus-visible:border-[#C8102E] focus-visible:ring-[#C8102E]/20"
              placeholder="Buscar por nome, descrição ou local"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Buscar itens"
            />
          </div>
          <Input
            type="date"
            className="h-11 w-full rounded-xl border-[#E7E5E4] bg-white sm:w-44"
            value={dataFiltro}
            onChange={e => setDataFiltro(e.target.value)}
            aria-label="Filtrar por data"
          />
        </div>

        <div className="mb-7 flex flex-wrap gap-2" role="tablist" aria-label="Categorias">
          {CATEGORIAS.map(cat => {
            const ativo = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-150 ${
                  ativo
                    ? 'bg-[#C8102E] text-white shadow-sm shadow-[#C8102E]/20'
                    : 'border border-[#E7E5E4] bg-white text-[#78716C] hover:border-[#C8102E]/30 hover:text-[#C8102E]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {!loading && (
          <p className="mb-5 text-xs text-[#A8A29E]">
            {filtered.length} {filtered.length === 1 ? 'item' : 'itens'}
            {category !== 'all' ? ` em “${category}”` : ''}
            {search.trim() ? ` para “${search}”` : ''}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-[#E7E5E4] pt-5 text-xs text-[#A8A29E] sm:flex-row">
          <span className="font-medium">ReEncontro — Sistema de Achados e Perdidos · SESI Nova Odessa</span>
          <span>Dúvidas? Procure a inspetora na recepção.</span>
        </div>
      </main>

      <ClaimModal
        item={selectedItem}
        open={claimOpen}
        onClose={() => setClaimOpen(false)}
        onCadastrar={() => {
          setClaimOpen(false);
          navigate('register');
        }}
      />
    </div>
  );
}
