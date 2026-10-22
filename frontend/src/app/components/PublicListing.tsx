import { useState, useEffect } from 'react';
import {
  Search, MapPin, Calendar, X, SlidersHorizontal, ListFilter, Glasses, Key,
} from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { StatusBadge } from './shared/StatusBadge';
import { ClaimModal } from './shared/ClaimModal';
import { itensApi, referenciasApi, fotoMiniatura } from '../../lib/api';
import type { FiltrosListagem, ItemTela, Pagina } from '../../lib/api';
import type { Screen } from '../App';
import { useNavigate } from 'react-router-dom';
import { SiteFooter, SiteHeader } from './shared/SiteHeader';
import { BannerIlustracao, PageBanner } from './shared/PageBanner';
import { useLoginSplash } from './LoginSplash';
import { getCatConfig } from './shared/categorias';
import { CONTEUDO_ID } from '../../lib/acessibilidade';

interface Props {
  navigate: (s: Screen) => void;
}

const FONT = { fontFamily: 'Plus Jakarta Sans, sans-serif' };

type Ordem = 'recentes' | 'antigos' | 'nome';

// Formato de referenciasApi.categorias() (SELECT id, nome FROM categorias)
interface Categoria {
  id: number;
  nome: string;
}

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

// Página atual da listagem, marcada com os filtros que a geraram
type ListaCarregada = Pagina<ItemTela> & { chave: string };

// Espera o usuário parar de digitar antes de buscar no servidor
const ATRASO_BUSCA_MS = 300;

function CardEsqueleto() {
  return (
    <div className="overflow-hidden rounded-2xl border border-contorno bg-superficie shadow-sm">
      <div className="aspect-[6/7] animate-pulse bg-fundo" />
      <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-fundo" />
        <div className="h-4 w-16 animate-pulse rounded-full bg-fundo" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-fundo" />
        <div className="h-8 w-full animate-pulse rounded-xl bg-fundo" />
      </div>
    </div>
  );
}

function ItemCard({
  item,
  onDetalhe,
  onReivindicar,
}: {
  item: ItemTela;
  onDetalhe: () => void;
  onReivindicar: () => void;
}) {
  const indisponivel = item.status === 'Entregue' || item.status === 'Descartado';
  const cfg = getCatConfig(item.category);
  const CatIcon = cfg.Icon;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-contorno bg-superficie shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <button
        type="button"
        className="relative aspect-[6/7] overflow-hidden bg-fundo text-left"
        onClick={onDetalhe}
        aria-label={`Ver detalhes de ${item.name} (${item.status})`}
      >
        <img
          src={fotoMiniatura(item.image)}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/25 to-transparent" aria-hidden />
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
          <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-tinta transition-colors group-hover:text-marca-texto sm:text-sm" style={FONT}>
            {item.name}
          </h3>
        </button>

        <div className="mt-2 space-y-1 sm:mt-3 sm:space-y-1.5">
          <div className="flex items-center gap-1 text-[10px] text-tinta-suave sm:gap-1.5 sm:text-xs">
            <MapPin className="size-2.5 shrink-0 sm:size-3" strokeWidth={1.5} />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-tinta-suave sm:gap-1.5 sm:text-xs">
            <Calendar className="size-2.5 shrink-0 sm:size-3" strokeWidth={1.5} />
            {item.date}
          </div>
        </div>

        <div className="mt-auto pt-3 sm:pt-4">
          <button
            type="button"
            onClick={onReivindicar}
            disabled={indisponivel}
            aria-label={indisponivel ? `Indisponível: ${item.name}` : `É meu! Reivindicar ${item.name}`}
            className={`w-full rounded-xl py-1.5 text-xs font-semibold transition-all duration-150 sm:py-2 sm:text-sm ${
              indisponivel
                ? 'cursor-not-allowed bg-fundo text-tinta-suave'
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
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemTela | null>(null);
  const [claimOpen, setClaimOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [dataFiltro, setDataFiltro] = useState('');
  const [ordem, setOrdem] = useState<Ordem>('recentes');
  const [buscaAplicada, setBuscaAplicada] = useState('');
  const [lista, setLista] = useState<ListaCarregada | null>(null);
  const [totalGeral, setTotalGeral] = useState<number | null>(null);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const routerNavigate = useNavigate();
  const { playCadastroTransition } = useLoginSplash();

  useEffect(() => {
    referenciasApi.categorias().then(setCategorias).catch(console.error);
  }, []);

  // A busca só vai pro servidor quando o usuário para de digitar
  useEffect(() => {
    const timer = window.setTimeout(() => setBuscaAplicada(search.trim()), ATRASO_BUSCA_MS);
    return () => window.clearTimeout(timer);
  }, [search]);

  // Busca, categoria, data e ordem rodam no servidor; a chave identifica a
  // combinação atual e descarta respostas que chegarem fora de ordem
  const filtros: FiltrosListagem = {
    q: buscaAplicada || undefined,
    categoriaId: category === 'all' ? undefined : categorias.find(c => c.nome === category)?.id,
    dataInicio: dataFiltro || undefined,
    dataFim: dataFiltro || undefined,
    ordem,
  };
  const chave = JSON.stringify(filtros);

  // Primeira página sempre que os filtros mudam
  useEffect(() => {
    let ativo = true;
    const filtrosAtuais = JSON.parse(chave) as FiltrosListagem;
    itensApi.listar(filtrosAtuais)
      .then(pagina => {
        if (!ativo) return;
        setLista({ ...pagina, chave });
        // O selo do banner mostra o total sem filtros
        if (!filtrosAtuais.q && !filtrosAtuais.categoriaId && !filtrosAtuais.dataInicio) {
          setTotalGeral(pagina.total);
        }
      })
      .catch(err => {
        console.error('Erro ao carregar itens:', err);
        if (ativo) setLista({ chave, itens: [], total: 0, pagina: 1, totalPaginas: 0 });
      });
    return () => { ativo = false; };
  }, [chave]);

  // Enquanto a página dos filtros atuais não chega, mostra o esqueleto
  const loading = lista?.chave !== chave;
  const itens = loading ? [] : lista.itens;
  const temMais = !loading && lista.pagina < lista.totalPaginas;

  function carregarMais() {
    if (!lista || carregandoMais) return;
    const { chave: chaveDaLista, pagina } = lista;
    setCarregandoMais(true);
    itensApi.listar({ ...(JSON.parse(chaveDaLista) as FiltrosListagem), pagina: pagina + 1 })
      .then(proxima => setLista(atual => {
        // Os filtros mudaram enquanto carregava: essa página não vale mais
        if (!atual || atual.chave !== chaveDaLista) return atual;
        // Um item novo cadastrado no meio pode empurrar outro pra próxima página
        const vistos = new Set(atual.itens.map(i => i.id));
        return {
          ...atual,
          itens: [...atual.itens, ...proxima.itens.filter(i => !vistos.has(i.id))],
          total: proxima.total,
          pagina: proxima.pagina,
          totalPaginas: proxima.totalPaginas,
        };
      }))
      .catch(err => console.error('Erro ao carregar mais itens:', err))
      .finally(() => setCarregandoMais(false));
  }

  const temFiltro = Boolean(search || dataFiltro || category !== 'all');

  function limparFiltros() {
    setSearch('');
    setDataFiltro('');
    setCategory('all');
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-fundo" style={FONT}>
      <SiteHeader navigate={navigate} />

      <main id={CONTEUDO_ID} tabIndex={-1} className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-5 outline-none sm:px-8 sm:py-8">
        <PageBanner
          selo={totalGeral === null
            ? 'Carregando itens…'
            : `${totalGeral} ${totalGeral === 1 ? 'item disponível' : 'itens disponíveis'}`}
          titulo="Encontrou algo que é seu?"
          ilustracao={<WelcomeIllustration />}
        >
          Aqui estão todos os itens encontrados no SESI Nova Odessa. Reconheceu algo? Clique em{' '}
          <span className="font-bold text-marca-texto">“É meu!”</span> para iniciar a reivindicação.
        </PageBanner>

        <div className="mb-4 rounded-2xl border border-contorno bg-superficie p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[17px] -translate-y-1/2 text-tinta-suave" strokeWidth={1.8} />
              <Input
                className="h-11 rounded-xl border-linha bg-superficie pr-10 pl-10 text-tinta placeholder:text-tinta-suave focus-visible:border-[#C8102E] focus-visible:ring-[#C8102E]/20"
                placeholder="Buscar por nome, descrição ou local"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Buscar itens"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-tinta-suave transition-colors hover:bg-fundo hover:text-tinta"
                  aria-label="Limpar busca"
                >
                  <X className="size-4" strokeWidth={1.8} />
                </button>
              )}
            </div>
            <div className="relative w-full sm:w-60">
              <Calendar className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-[17px] -translate-y-1/2 text-tinta-suave" strokeWidth={1.8} />
              {/* O ícone nativo do calendário fica invisível cobrindo o campo todo:
                  clicar em qualquer ponto abre o seletor, e o visual segue o da busca */}
              <Input
                type="date"
                className={`relative h-11 w-full rounded-xl border-linha bg-superficie pr-10 pl-10 focus-visible:border-[#C8102E] focus-visible:ring-[#C8102E]/20 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 ${
                  dataFiltro ? 'text-tinta' : 'text-tinta-suave'
                }`}
                value={dataFiltro}
                onChange={e => setDataFiltro(e.target.value)}
                aria-label="Filtrar por data em que o item foi encontrado"
              />
              {dataFiltro && (
                <button
                  type="button"
                  onClick={() => setDataFiltro('')}
                  className="absolute top-1/2 right-3 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-tinta-suave transition-colors hover:bg-fundo hover:text-tinta"
                  aria-label="Limpar data"
                >
                  <X className="size-4" strokeWidth={1.8} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 sm:justify-between sm:gap-3">
            <div className="-ml-4 min-w-0 flex-1 overflow-x-auto pl-4 scrollbar-hide sm:ml-0 sm:overflow-visible sm:pl-0">
              <div className="flex flex-nowrap gap-2 sm:flex-wrap" role="group" aria-label="Filtrar por categoria">
                {[{ id: 'all', label: 'Todas' }, ...categorias.map(c => ({ id: c.nome, label: c.nome }))].map(cat => {
                  const ativo = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      aria-pressed={ativo}
                      onClick={() => setCategory(cat.id)}
                      className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-150 ${
                        ativo
                          ? 'bg-[#C8102E] text-white shadow-sm shadow-[#C8102E]/20'
                          : 'border border-linha bg-superficie text-tinta-media hover:border-[#C8102E]/30 hover:text-marca-texto'
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
              className="flex size-9 shrink-0 items-center justify-center gap-2 rounded-full border border-linha text-sm font-medium text-tinta-media transition-colors hover:text-marca-texto disabled:cursor-default disabled:opacity-50 disabled:hover:text-tinta-media sm:size-auto sm:rounded-lg sm:border-0 sm:px-2 sm:py-1.5"
              aria-label="Limpar filtros"
              title="Limpar filtros"
            >
              <SlidersHorizontal className="size-4" strokeWidth={1.8} />
              <span className="hidden sm:inline">Limpar filtros</span>
            </button>
          </div>
        </div>

        <h2 className="sr-only">Itens encontrados</h2>
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-tinta-suave" role="status">
            {loading ? 'Carregando…' : `${lista.total} ${lista.total === 1 ? 'item encontrado' : 'itens encontrados'}`}
          </p>
          <Select value={ordem} onValueChange={v => setOrdem(v as Ordem)}>
            <SelectTrigger className="h-10 w-auto gap-2 rounded-xl border-linha bg-superficie px-3.5 text-sm font-medium text-tinta shadow-sm" aria-label="Ordenar itens">
              <ListFilter className="size-4 text-tinta-suave" strokeWidth={1.8} />
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4" aria-hidden>
            {Array.from({ length: 8 }, (_, i) => (
              <CardEsqueleto key={i} />
            ))}
          </div>
        ) : itens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-linha bg-superficie shadow-sm">
              <Search className="size-7 text-tinta-apagada" strokeWidth={1.2} />
            </div>
            <h3 className="mb-1 text-base font-bold text-tinta">Nenhum item encontrado</h3>
            <p className="text-sm text-tinta-suave">Tente outro termo, categoria ou data.</p>
            {temFiltro && (
              <button
                type="button"
                onClick={limparFiltros}
                className="mt-5 rounded-full border border-linha bg-superficie px-4 py-1.5 text-sm font-semibold text-tinta-suave transition-colors hover:border-[#C8102E]/30 hover:text-marca-texto"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {itens.map(item => (
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
            {temMais && (
              <div className="mt-8 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={carregarMais}
                  disabled={carregandoMais}
                  className="rounded-full border border-linha bg-superficie px-6 py-2.5 text-sm font-semibold text-tinta shadow-sm transition-colors hover:border-[#C8102E]/30 hover:text-marca-texto disabled:cursor-default disabled:opacity-60"
                  style={FONT}
                >
                  {carregandoMais ? 'Carregando…' : 'Carregar mais'}
                </button>
                <p className="text-xs text-tinta-suave">
                  Mostrando {itens.length} de {lista?.total}
                </p>
              </div>
            )}
          </>
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
