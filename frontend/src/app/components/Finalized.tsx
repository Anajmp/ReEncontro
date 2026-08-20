import { Search, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { StatusBadge } from './shared/StatusBadge';
import { AdminLayout } from './shared/AdminLayout';
import { AdminPanel, CategoryBadge, adminInputClass, adminSelectClass } from './shared/AdminChrome';
import { items } from './shared/data';
import type { Screen } from '../App';

interface Props {
  navigate: (s: Screen) => void;
}

const finalizedItems = [
  ...items.filter(i => i.status === 'Entregue' || i.status === 'Descartado'),
  { ...items[1], id: 101, status: 'Entregue' as const, date: '16/03/2024', staff: 'Ana Paula' },
  { ...items[6], id: 102, status: 'Entregue' as const, date: '15/03/2024', staff: 'Cláudia Reis' },
  { ...items[7], id: 103, status: 'Descartado' as const, date: '14/03/2024', staff: 'Fernanda Lima' },
].filter((item, idx, arr) => arr.findIndex(i => i.id === item.id) === idx);

export function Finalized({ navigate }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = finalizedItems.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.name.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchSearch && matchStatus;
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
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Entregue">Entregue</SelectItem>
              <SelectItem value="Descartado">Descartado</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" className={`w-44 ${adminInputClass}`} />
          <Input type="date" className={`w-44 ${adminInputClass}`} />
        </AdminPanel>

        <AdminPanel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E7E5E4] bg-[#F5F3F0]/60">
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Categoria</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Funcionária</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Reverter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {filtered.map(item => {
                  const isRecent = item.daysFound < 30;
                  return (
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
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <CategoryBadge category={item.category} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-[#78716C]">{item.date}</td>
                      <td className="px-4 py-3 text-xs text-[#78716C]">{item.staff || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        {isRecent ? (
                          <button
                            type="button"
                            className="ml-auto flex items-center gap-1 text-xs text-[#78716C] transition-colors hover:text-[#C8102E]"
                            title="Reverter para disponível"
                          >
                            <RotateCcw className="size-3.5" />
                            Reverter
                          </button>
                        ) : (
                          <span className="text-xs text-[#D6D3D1]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm text-[#A8A29E]">
              Nenhum item no histórico.
            </div>
          )}
        </AdminPanel>
      </div>
    </AdminLayout>
  );
}
