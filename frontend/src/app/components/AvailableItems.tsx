import { useState, useEffect} from 'react';
import { Search, Pencil, Trash2, AlertTriangle, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { StatusBadge } from './shared/StatusBadge';
import { AdminLayout } from './shared/AdminLayout';
import {
  AdminPanel, CategoryBadge, adminBtnPrimary, adminInputClass, adminSelectClass,
} from './shared/AdminChrome';
import { itensApi, reivindicacoesApi } from '../../lib/api';
import type { Screen } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';

interface Props {
  navigate: (s: Screen) => void;
}

function EditItemModal({ item, open, onClose, onSaved }: {
  item: any | null; open: boolean; onClose: () => void; onSaved: () => void;
}) {
  const [descricao, setDescricao] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [local, setLocal] = useState('');
  const [pontoColetaId, setPontoColetaId] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Preenche com os dados atuais quando abre
  useEffect(() => {
    if (item) {
      setDescricao(item.name || '');
      setLocal(item.location || '');
      // categoria e ponto: o item traduzido tem nome, mas o backend quer ID.
      // Por simplicidade, o usuário reescolhe (começa vazio).
      setCategoriaId('');
      setPontoColetaId('');
    }
  }, [item, open]);

  if (!item) return null;

  async function salvar() {
    setErro('');
    if (!descricao || !categoriaId || !local || !pontoColetaId) {
      setErro('Preencha todos os campos');
      return;
    }
    setSalvando(true);
    try {
      await itensApi.editar(item.id, {
        descricao,
        categoria_id: Number(categoriaId),
        local_encontrado: local,
        ponto_coleta_id: Number(pontoColetaId),
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setErro(err.message || 'Erro ao salvar');
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
            <Label className="text-sm font-semibold text-[#1C1917]">Descrição *</Label>
            <Input className={adminInputClass} value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição do item" />
          </div>
          <div className="space-y-1.5">
            <Label>Categoria *</Label>
            <Select value={categoriaId} onValueChange={setCategoriaId}>
              <SelectTrigger className={adminSelectClass}><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Vestuário</SelectItem>
                <SelectItem value="2">Acessórios</SelectItem>
                <SelectItem value="3">Material Escolar</SelectItem>
                <SelectItem value="4">Eletrônicos</SelectItem>
                <SelectItem value="5">Calçados</SelectItem>
                <SelectItem value="6">Outros</SelectItem>
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

export function AvailableItems({ navigate }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  

  async function carregar() {
    try {
      const dados = await itensApi.listar();
      setItems(dados);
    } catch (err) {
      console.error('Erro ao carregar itens:', err);
    }
  }

  useEffect(() => { carregar(); }, []);

  async function descartar(id: number, nome: string) {
    if (!confirm(`Descartar o item "${nome}"? Ele sairá da listagem.`)) return;
    try {
      await itensApi.descartar(id);
      carregar();
    } catch (err: any) {
      alert(err.message || 'Erro ao descartar');
    }
  }

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
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#A8A29E]" />
            <Input
              className={`pl-9 ${adminInputClass}`}
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
              <SelectItem value="Eletrônicos">Eletrônicos</SelectItem>
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
          <div className="overflow-x-auto">
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
                          onClick={() => descartar(item.id, item.name)}
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
    </AdminLayout>
  );
}
