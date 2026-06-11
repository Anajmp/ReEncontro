import { Search, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { StatusBadge } from './shared/StatusBadge';
import { AdminLayout } from './shared/AdminLayout';
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
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-gray-900">Finalizados</h1>
          <p className="text-sm text-gray-500 mt-1">Histórico de itens entregues e descartados.</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Buscar item..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Entregue">Entregue</SelectItem>
              <SelectItem value="Descartado">Descartado</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" className="w-44" />
          <Input type="date" className="w-44" />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Item</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Categoria</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Data</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Funcionária</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Reverter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(item => {
                  const isRecent = item.daysFound < 30;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-md object-cover bg-gray-100 shrink-0"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-400">{item.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5">{item.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{item.date}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{item.staff || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        {isRecent ? (
                          <button
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#C8102E] transition-colors ml-auto"
                            title="Reverter para disponível"
                          >
                            <RotateCcw className="size-3.5" />
                            Reverter
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              Nenhum item no histórico.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
