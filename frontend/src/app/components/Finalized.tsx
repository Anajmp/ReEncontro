import { Search, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { StatusBadge } from './shared/StatusBadge';
import { AdminLayout } from './shared/AdminLayout';
import { AdminPanel, CategoryBadge, adminInputClass, adminSelectClass } from './shared/AdminChrome';
import type { Screen } from '../App';
import { itensApi, reivindicacoesApi } from '../../lib/api';

interface Props {
  navigate: (s: Screen) => void;
}

export function Finalized({ navigate }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Entregue');
  const [itens, setItens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    setLoading(true);
    try {
      if (statusFilter === 'all') {
        // Busca os dois status e junta
        const [entregues, descartados] = await Promise.all([
          itensApi.listarFinalizados('entregue'),
          itensApi.listarFinalizados('descartado'),
        ]);
        setItens([...entregues, ...descartados]);
      } else {
        const status = statusFilter === 'Entregue' ? 'entregue' : 'descartado';
        setItens(await itensApi.listarFinalizados(status));
      }
    } catch (err) {
      console.error('Erro ao carregar finalizados:', err);
    } finally {
      setLoading(false);
    }
  }

  // Recarrega sempre que o filtro de status muda
  useEffect(() => { carregar(); }, [statusFilter]);

  // Verifica se a entrega ainda está na janela de 24h (RN-015)
  function podeReverter(item: any) {
    if (item.status !== 'Entregue' || !item.finalizadoEmRaw) return false;
    const horas = (Date.now() - new Date(item.finalizadoEmRaw).getTime()) / 36e5;
    return horas <= 24;
  }

  async function reverter(itemId: number, nome: string) {
    if (!confirm(`Reverter a entrega de "${nome}"? O item voltará para disponível.`)) return;
    try {
      await reivindicacoesApi.reverterEntrega(itemId);
      carregar();
    } catch (err: any) {
      alert(err.message || 'Erro ao reverter a entrega');
    }
  }

  const filtered = itens.filter(item => {
    const q = search.toLowerCase();
    return !q || item.name.toLowerCase().includes(q);
  });

  return (
    <AdminLayout current="finalized" navigate={navigate}>
      <div className="space-y-4">
        <AdminPanel className="flex flex-wrap gap-3 p-4">
          <div className="relative min-w-[160px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#A8A29E]" />
            <Input
              className={`pl-9 ${adminInputClass}`}
              placeholder="Buscar item..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className={`w-44 ${adminSelectClass}`}>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E7E5E4] bg-[#F5F3F0]/60">
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Categoria</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Finalizado em</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Funcionária</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Reverter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {filtered.map(item => (
                  <tr key={item.id} className="transition-colors hover:bg-[#F5F3F0]/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="size-10 shrink-0 rounded-xl object-cover bg-[#F5F3F0]"
                        />
                        <div>
                          <div className="font-semibold text-[#1C1917]">{item.name}</div>
                          <div className="text-xs text-[#A8A29E]">{item.location}</div>
                          {item.motivoDescarte && (
                            <div className="mt-0.5 text-xs text-[#C8102E]">Motivo: {item.motivoDescarte}</div>
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
                    <td className="px-4 py-3 text-xs text-[#78716C]">{item.finalizadoEm || '—'}</td>
                    <td className="px-4 py-3 text-xs text-[#78716C]">{item.finalizadoPor || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      {podeReverter(item) ? (
                        <button
                          type="button"
                          onClick={() => reverter(item.id, item.name)}
                          className="ml-auto flex items-center gap-1 text-xs text-[#78716C] transition-colors hover:text-[#C8102E]"
                          title="Reverter para disponível (até 24h após a entrega)"
                        >
                          <RotateCcw className="size-3.5" />
                          Reverter
                        </button>
                      ) : (
                        <span className="text-xs text-[#D6D3D1]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-[#A8A29E]">Carregando...</div>
          ) : filtered.length === 0 && (
            <div className="py-10 text-center text-sm text-[#A8A29E]">
              Nenhum item no histórico.
            </div>
          )}
        </AdminPanel>
      </div>
    </AdminLayout>
  );
}