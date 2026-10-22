import { Search, RotateCcw, CheckCircle2, Trash2, Archive } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { StatusBadge } from './shared/StatusBadge';
import { AdminLayout } from './shared/AdminLayout';
import {
  AdminPanel, CartoesEsqueleto, CategoryBadge, LinhasEsqueleto, adminSearchInputClass, adminSelectClass,
} from './shared/AdminChrome';
import { EstadoVazio } from './shared/PageBanner';
import type { Screen } from '../App';
import type { Status } from './shared/data';
import { itensApi, reivindicacoesApi, fotoMiniatura } from '../../lib/api';
import type { Pagina } from '../../lib/api';

interface Props {
  navigate: (s: Screen) => void;
}

// Estado vazio de cada filtro de status (e da busca sem resultado)
const VAZIO_POR_STATUS: Record<string, { Icon: typeof Archive; titulo: string; texto: string }> = {
  Entregue: {
    Icon: CheckCircle2,
    titulo: 'Nenhum item entregue',
    texto: 'Quando uma entrega for confirmada em "Em Processo", o item aparece aqui.',
  },
  Descartado: {
    Icon: Trash2,
    titulo: 'Nenhum item descartado',
    texto: 'Itens descartados em "Itens Disponíveis" aparecem aqui, com o motivo do descarte.',
  },
  all: {
    Icon: Archive,
    titulo: 'Nenhum item finalizado',
    texto: 'Itens entregues aos responsáveis ou descartados aparecem aqui.',
  },
};

// Item finalizado como devolvido por itensApi.listarFinalizados()
interface ItemFinalizado {
  id: number;
  name: string;
  category: string;
  location: string;
  status: Status;
  image: string;
  finalizadoEmRaw?: string | null;
  finalizadoEm?: string;
  finalizadoPor: string;
  motivoDescarte: string;
}

// Filtros que viajam na chave da lista
interface FiltrosFinalizados {
  status: 'entregue' | 'descartado' | 'todos';
  q?: string;
}

// Página atual, marcada com os filtros que a geraram
type ListaFinalizados = Pagina<ItemFinalizado> & { chave: string };

export function Finalized({ navigate }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Entregue');
  const [buscaAplicada, setBuscaAplicada] = useState('');
  const [lista, setLista] = useState<ListaFinalizados | null>(null);
  // Sobe a cada reversão para recarregar a lista
  const [versao, setVersao] = useState(0);
  const [carregandoMais, setCarregandoMais] = useState(false);
  // "Agora" de referência pra janela de 24h, atualizado a cada carregamento
  const [agora, setAgora] = useState(() => Date.now());

  // A busca só vai pro servidor quando a funcionária para de digitar
  useEffect(() => {
    const timer = window.setTimeout(() => setBuscaAplicada(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  // "Todos" vira status=todos: o servidor junta entregues e descartados
  const chave = JSON.stringify({
    status: statusFilter === 'all' ? 'todos' : statusFilter === 'Entregue' ? 'entregue' : 'descartado',
    q: buscaAplicada || undefined,
  });

  // Primeira página sempre que o status ou a busca mudam (ou após reverter)
  useEffect(() => {
    let ativo = true;
    const { status, q } = JSON.parse(chave) as FiltrosFinalizados;
    itensApi.listarFinalizados(status, { q })
      .then(pagina => {
        if (!ativo) return;
        setLista({ ...pagina, chave });
        setAgora(Date.now());
      })
      .catch(err => {
        console.error('Erro ao carregar finalizados:', err);
        if (ativo) setLista({ chave, itens: [], total: 0, pagina: 1, totalPaginas: 0 });
      });
    return () => { ativo = false; };
  }, [chave, versao]);

  const carregar = useCallback(() => setVersao(v => v + 1), []);

  // Mostra o esqueleto enquanto a página do filtro atual não chega (sem
  // deixar na tela as linhas do filtro anterior)
  const loading = lista?.chave !== chave;
  const itens = loading || !lista ? [] : lista.itens;
  const vazio = !loading && itens.length === 0;
  const estadoVazio = VAZIO_POR_STATUS[statusFilter] ?? VAZIO_POR_STATUS.all;
  const temMais = Boolean(lista && lista.pagina < lista.totalPaginas);

  function carregarMais() {
    if (!lista || carregandoMais) return;
    const { chave: chaveDaLista, pagina } = lista;
    const { status, q } = JSON.parse(chaveDaLista) as FiltrosFinalizados;
    setCarregandoMais(true);
    itensApi.listarFinalizados(status, { q, pagina: pagina + 1 })
      .then(proxima => setLista(atual => {
        // O filtro mudou enquanto carregava: essa página não vale mais
        if (!atual || atual.chave !== chaveDaLista) return atual;
        const vistos = new Set(atual.itens.map(i => i.id));
        return {
          ...atual,
          itens: [...atual.itens, ...proxima.itens.filter(i => !vistos.has(i.id))],
          total: proxima.total,
          pagina: proxima.pagina,
          totalPaginas: proxima.totalPaginas,
        };
      }))
      .catch(err => console.error('Erro ao carregar mais finalizados:', err))
      .finally(() => setCarregandoMais(false));
  }

  function trocarFiltro(valor: string) {
    setStatusFilter(valor);
  }

  // Verifica se a entrega ainda está na janela de 24h (RN-015)
  function podeReverter(item: ItemFinalizado) {
    if (item.status !== 'Entregue' || !item.finalizadoEmRaw) return false;
    const horas = (agora - new Date(item.finalizadoEmRaw).getTime()) / 36e5;
    return horas <= 24;
  }

  async function reverter(itemId: number, nome: string) {
    if (!confirm(`Reverter a entrega de "${nome}"? O item voltará para disponível.`)) return;
    try {
      await reivindicacoesApi.reverterEntrega(itemId);
      carregar();
    } catch (err: unknown) {
      alert((err instanceof Error && err.message) || 'Erro ao reverter a entrega');
    }
  }


  return (
    <AdminLayout current="finalized" navigate={navigate}>
      <div className="space-y-4">
        <AdminPanel className="flex flex-wrap gap-3 p-4">
          <div className="relative min-w-[160px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-tinta-suave" />
            <Input
              className={adminSearchInputClass}
              placeholder="Buscar item..."
              aria-label="Buscar item"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={trocarFiltro}>
            <SelectTrigger className={`w-44 ${adminSelectClass}`} aria-label="Filtrar por status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Entregue">Entregues</SelectItem>
              <SelectItem value="Descartado">Descartados</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
        </AdminPanel>

        <AdminPanel className="overflow-hidden">
          {/* Lista em cards — mobile */}
          <div className="divide-y divide-linha lg:hidden">
            {loading ? <CartoesEsqueleto /> : itens.map(item => (
              <div key={item.id} className="flex gap-3 p-4">
                <img
                  src={fotoMiniatura(item.image, 160)}
                  loading="lazy"
                  alt={item.name}
                  className="size-14 shrink-0 rounded-xl object-cover bg-fundo"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-tinta">{item.name}</p>
                      <p className="mt-0.5 truncate text-xs text-tinta-suave">{item.location}</p>
                      {item.motivoDescarte && (
                        <p className="mt-0.5 truncate text-xs text-marca-texto">Motivo: {item.motivoDescarte}</p>
                      )}
                    </div>
                    {podeReverter(item) ? (
                      <button
                        type="button"
                        onClick={() => reverter(item.id, item.name)}
                        aria-label={`Reverter a entrega de ${item.name}`}
                        className="flex shrink-0 items-center gap-1 text-xs text-tinta-suave transition-colors hover:text-marca-texto"
                        title="Reverter para disponível (até 24h após a entrega)"
                      >
                        <RotateCcw className="size-3.5" />
                        Reverter
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <CategoryBadge category={item.category} />
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-1.5 text-xs text-tinta-suave">
                    {item.finalizadoEm || '—'} · {item.finalizadoPor || '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabela — desktop (sem registros, dá lugar ao estado vazio) */}
          {!vazio && (
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <caption className="sr-only">Itens finalizados</caption>
              <thead>
                <tr className="border-b border-linha bg-fundo/60">
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-tinta-suave uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-tinta-suave uppercase">Categoria</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-tinta-suave uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-tinta-suave uppercase">Finalizado em</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-tinta-suave uppercase">Funcionária</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold tracking-wide text-tinta-suave uppercase">Reverter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linha">
                {loading ? <LinhasEsqueleto colunas={6} /> : itens.map(item => (
                  <tr key={item.id} className="transition-colors hover:bg-fundo/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={fotoMiniatura(item.image, 160)}
                          loading="lazy"
                          alt={item.name}
                          className="size-10 shrink-0 rounded-xl object-cover bg-fundo"
                        />
                        <div>
                          <div className="font-semibold text-tinta">{item.name}</div>
                          <div className="text-xs text-tinta-suave">{item.location}</div>
                          {item.motivoDescarte && (
                            <div className="mt-0.5 text-xs text-marca-texto">Motivo: {item.motivoDescarte}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={item.category} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-tinta-suave">{item.finalizadoEm || '—'}</td>
                    <td className="px-4 py-3 text-xs text-tinta-suave">{item.finalizadoPor || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      {podeReverter(item) ? (
                        <button
                          type="button"
                          onClick={() => reverter(item.id, item.name)}
                          aria-label={`Reverter a entrega de ${item.name}`}
                          className="ml-auto flex items-center gap-1 text-xs text-tinta-suave transition-colors hover:text-marca-texto"
                          title="Reverter para disponível (até 24h após a entrega)"
                        >
                          <RotateCcw className="size-3.5" />
                          Reverter
                        </button>
                      ) : (
                        <span className="text-xs text-tinta-suave"><span aria-hidden>—</span><span className="sr-only">Não é possível reverter</span></span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          <p className="sr-only" role="status">
            {loading ? 'Carregando itens finalizados…' : `${lista?.total ?? 0} itens finalizados`}
          </p>
          {vazio && (buscaAplicada ? (
            <EstadoVazio Icon={Search} titulo="Nenhum item encontrado">
              Nenhum item finalizado corresponde a “{buscaAplicada}”. Tente outro termo.
            </EstadoVazio>
          ) : (
            <EstadoVazio Icon={estadoVazio.Icon} titulo={estadoVazio.titulo}>
              {estadoVazio.texto}
            </EstadoVazio>
          ))}
        </AdminPanel>

        {temMais && !loading && (
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={carregarMais}
              disabled={carregandoMais}
              className="rounded-xl border border-linha bg-superficie px-4 py-1.5 text-sm font-medium text-tinta transition-colors hover:text-marca-texto disabled:opacity-60"
            >
              {carregandoMais ? 'Carregando...' : 'Carregar mais'}
            </button>
            <p className="text-xs text-tinta-suave">Mostrando {itens.length} de {lista?.total}</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}