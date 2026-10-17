import { useState, useEffect, useCallback } from 'react';
import { Search, Pencil, Trash2, AlertTriangle, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { StatusBadge } from './shared/StatusBadge';
import { AdminLayout } from './shared/AdminLayout';
import {
  AdminPanel, CategoryBadge, adminBtnPrimary, adminInputClass, adminSearchInputClass, adminSelectClass,
} from './shared/AdminChrome';
import { itensApi, referenciasApi } from '../../lib/api';
import type { Screen } from '../App';
import type { Status } from './shared/data';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';

interface Props {
  navigate: (s: Screen) => void;
}

// Item como devolvido por itensApi.listar() (já traduzido pro formato da tela)
interface ItemDisponivel {
  id: number;
  name: string;
  category: string;
  location: string;
  date: string;
  status: Status;
  image: string;
  description: string;
  daysFound: number;
}

// Categoria de GET /api/categorias
interface Categoria {
  id: number;
  nome: string;
}

function EditItemModal({ item, open, onClose, onSaved }: {
  item: ItemDisponivel | null; open: boolean; onClose: () => void; onSaved: () => void;
}) {
  const [nome, setNome] = useState(item?.name || '');
  const [descricao, setDescricao] = useState(item?.description || '');
  // categoria e ponto: o item traduzido tem nome, mas o backend quer ID.
  // Por simplicidade, o usuário reescolhe (começa vazio).
  const [categoriaId, setCategoriaId] = useState('');
  const [local, setLocal] = useState(item?.location || '');
  const [pontoColetaId, setPontoColetaId] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    referenciasApi.categorias().then(setCategorias).catch(console.error);
  }, []);

  // Preenche com os dados atuais quando abre (ajuste de estado durante o
  // render quando item/open mudam, em vez de sincronizar via efeito)
  const [anterior, setAnterior] = useState({ item, open });
  if (anterior.item !== item || anterior.open !== open) {
    setAnterior({ item, open });
    if (item) {
      setNome(item.name || '');
      setDescricao(item.description || '');
      setLocal(item.location || '');
      setCategoriaId('');
      setPontoColetaId('');
    }
  }

  if (!item) return null;

  async function salvar() {
    if (!item) return;
    setErro('');
    if (!nome || !descricao || !categoriaId || !local || !pontoColetaId) {
      setErro('Preencha todos os campos');
      return;
    }
    setSalvando(true);
    try {
      await itensApi.editar(item.id, {
        nome,
        descricao,
        categoria_id: Number(categoriaId),
        local_encontrado: local,
        ponto_coleta_id: Number(pontoColetaId),
      });
      onSaved();
      onClose();
    } catch (err: unknown) {
      setErro((err instanceof Error && err.message) || 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl border-[#E7E5E4]">
        <DialogHeader>
          <DialogTitle className="text-[#1C1917]">Editar item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-[#1C1917]">Nome do item *</Label>
            <Input className={adminInputClass} value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Mochila azul" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-[#1C1917]">Descrição *</Label>
            <Input className={adminInputClass} value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição do item" />
          </div>
          <div className="space-y-1.5">
            <Label>Categoria *</Label>
            <Select value={categoriaId} onValueChange={setCategoriaId}>
              <SelectTrigger className={adminSelectClass}><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
              <SelectContent>
                {categorias.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Local encontrado *</Label>
            <Input className={adminInputClass} value={local} onChange={e => setLocal(e.target.value)} placeholder="Onde foi encontrado" />
          </div>
          <div className="space-y-1.5">
            <Label>Ponto de coleta *</Label>
            <Select value={pontoColetaId} onValueChange={setPontoColetaId}>
              <SelectTrigger className={adminSelectClass}><SelectValue placeholder="Selecione o ponto" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Secretaria</SelectItem>
                <SelectItem value="2">Sala das Inspetoras</SelectItem>
                <SelectItem value="3">Portaria</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {erro && <p className="rounded-xl bg-[#FEE2E2] px-3 py-2 text-sm text-[#C8102E]">{erro}</p>}
        </div>
        <div className="flex gap-3 border-t border-[#E7E5E4] pt-2">
          <Button variant="outline" className="flex-1 rounded-xl border-[#E7E5E4]" onClick={onClose} disabled={salvando}>Cancelar</Button>
          <Button className={`flex-1 ${adminBtnPrimary}`} onClick={salvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DiscardItemModal({ item, onClose, onDiscarded }: {
  item: ItemDisponivel | null; onClose: () => void; onDiscarded: () => void;
}) {
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState('');
  const [descartando, setDescartando] = useState(false);

  // Limpa o formulário sempre que abre para outro item
  const [anterior, setAnterior] = useState(item);
  if (anterior !== item) {
    setAnterior(item);
    setMotivo('');
    setErro('');
  }

  if (!item) return null;

  async function confirmar() {
    if (!item) return;
    setErro('');
    if (motivo.trim().length < 3) {
      setErro('Informe o motivo do descarte');
      return;
    }
    setDescartando(true);
    try {
      await itensApi.descartar(item.id, motivo.trim());
      onDiscarded();
      onClose();
    } catch (err: unknown) {
      setErro((err instanceof Error && err.message) || 'Erro ao descartar');
    } finally {
      setDescartando(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl border-[#E7E5E4]">
        <DialogHeader>
          <DialogTitle className="text-[#1C1917]">Descartar item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-[#78716C]">
            O item <strong className="text-[#1C1917]">{item.name}</strong> sairá da listagem e irá para Finalizados.
          </p>
          {item.status === 'Pendente' && (
            <p className="rounded-xl bg-[#FEF3C7] px-3 py-2 text-sm text-[#92400E]">
              Este item tem uma reivindicação pendente. Ela será rejeitada e o responsável receberá um e-mail com o motivo.
            </p>
          )}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-[#1C1917]">Motivo *</Label>
            <Input
              className={adminInputClass}
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Ex: Mais de 90 dias sem dono, doado"
            />
          </div>
          {erro && <p className="rounded-xl bg-[#FEE2E2] px-3 py-2 text-sm text-[#C8102E]">{erro}</p>}
        </div>
        <div className="flex gap-3 border-t border-[#E7E5E4] pt-2">
          <Button variant="outline" className="flex-1 rounded-xl border-[#E7E5E4]" onClick={onClose} disabled={descartando}>Cancelar</Button>
          <Button className="flex-1 rounded-xl bg-[#C8102E] text-white hover:bg-[#A50D26]" onClick={confirmar} disabled={descartando}>
            {descartando ? 'Descartando...' : 'Descartar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AvailableItems({ navigate }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [items, setItems] = useState<ItemDisponivel[]>([]);
  const [editing, setEditing] = useState<ItemDisponivel | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [discarding, setDiscarding] = useState<ItemDisponivel | null>(null);


  const carregar = useCallback(() => {
    return itensApi.listar()
      .then((dados: ItemDisponivel[]) => setItems(dados))
      .catch(err => console.error('Erro ao carregar itens:', err));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.location.toLowerCase().includes(q);
    const matchCategory = category === 'all' || item.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <AdminLayout current="available-items" navigate={navigate}>
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button size="sm" className={`gap-2 ${adminBtnPrimary}`} onClick={() => navigate('register-item')}>
            <Plus className="size-4" />
            Cadastrar item
          </Button>
        </div>

        <AdminPanel className="flex flex-wrap gap-3 p-4">
          <div className="relative min-w-[160px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#A8A29E]" />
            <Input
              className={adminSearchInputClass}
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className={`w-48 ${adminSelectClass}`}>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="Vestuário">Vestuário</SelectItem>
              <SelectItem value="Acessórios">Acessórios</SelectItem>
              <SelectItem value="Material Escolar">Material Escolar</SelectItem>
              <SelectItem value="Calçados">Calçados</SelectItem>
              <SelectItem value="Outros">Outros</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className={`w-40 ${adminSelectClass}`}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="disponivel">Disponível</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="processo">Em Processo</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" className={`w-44 ${adminInputClass}`} />
        </AdminPanel>

        <AdminPanel className="overflow-hidden">
          {/* Lista em cards — mobile */}
          <div className="divide-y divide-[#E7E5E4] lg:hidden">
            {filtered.map(item => (
              <div
                key={item.id}
                className={`flex gap-3 p-4 ${item.daysFound > 0 ? 'bg-[#FEF3C7]/30' : ''}`}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="size-14 shrink-0 rounded-xl object-cover bg-[#F5F3F0]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate font-semibold text-[#1C1917]">{item.name}</p>
                        {item.daysFound > 0 && (
                          <span className="inline-flex shrink-0 items-center rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[10px] font-bold text-[#D97706]">
                            +90 dias
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[#A8A29E]">{item.location} · {item.date}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-[#A8A29E] transition-colors hover:bg-[#F5F3F0] hover:text-[#1C1917]"
                        onClick={() => { setEditing(item); setEditOpen(true); }}
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-[#A8A29E] transition-colors hover:bg-[#FEE2E2] hover:text-[#C8102E]"
                        onClick={() => setDiscarding(item)}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <CategoryBadge category={item.category} />
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabela — desktop */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E7E5E4] bg-[#F5F3F0]/60">
                  <th className="w-10 px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">#</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Categoria</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Local</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Dias</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {filtered.map(item => (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-[#F5F3F0]/50 ${item.daysFound > 0 ? 'bg-[#FEF3C7]/30' : ''}`}
                  >
                    <td className="px-4 py-3 text-xs text-[#A8A29E]">{item.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="size-10 shrink-0 rounded-xl object-cover bg-[#F5F3F0]"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="max-w-[160px] truncate font-semibold text-[#1C1917]">{item.name}</span>
                            {item.daysFound > 0 && (
                              <span className="inline-flex shrink-0 items-center rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[10px] font-bold text-[#D97706]">
                                +90 dias
                              </span>
                            )}
                          </div>
                          <div className="max-w-[160px] truncate text-xs text-[#A8A29E]">{item.description.slice(0, 40)}…</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={item.category} />
                    </td>
                    <td className="px-4 py-3 text-xs text-[#78716C]">{item.location}</td>
                    <td className="px-4 py-3 text-xs text-[#78716C]">{item.date}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3">
                      {item.daysFound > 0 ? (
                        <div className="flex items-center gap-1 text-[#D97706]">
                          <AlertTriangle className="size-3" />
                          <span className="text-xs font-semibold">{item.daysFound}d</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#A8A29E]">{item.daysFound}d</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-[#A8A29E] transition-colors hover:bg-[#F5F3F0] hover:text-[#1C1917]"
                          onClick={() => { setEditing(item); setEditOpen(true); }}
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-[#A8A29E] transition-colors hover:bg-[#FEE2E2] hover:text-[#C8102E]"
                          onClick={() => setDiscarding(item)}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm text-[#A8A29E]">
              Nenhum item encontrado.
            </div>
          )}
        </AdminPanel>

        {items.some(i => i.daysFound > 90) && (
          <div className="flex items-center gap-2 rounded-xl border border-[#FEF3C7] bg-[#FEF3C7]/50 px-4 py-2.5 text-xs text-[#92400E]">
            <AlertTriangle className="size-3.5 shrink-0" />
            Itens destacados em amarelo estão há mais de 90 dias sem dono. Considere descartá-los conforme política escolar.
          </div>
        )}
      </div>

      <EditItemModal
        item={editing}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={carregar}
      />
      <DiscardItemModal
        item={discarding}
        onClose={() => setDiscarding(null)}
        onDiscarded={carregar}
      />
    </AdminLayout>
  );
}
