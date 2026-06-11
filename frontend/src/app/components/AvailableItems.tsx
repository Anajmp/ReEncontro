import { useState } from 'react';
import { Search, Pencil, Trash2, AlertTriangle, Plus } from 'lucide-react';
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

export function AvailableItems({ navigate }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.location.toLowerCase().includes(q);
    const matchCategory = category === 'all' || item.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <AdminLayout current="available-items" navigate={navigate}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-gray-900">Itens Disponíveis</h1>
            <p className="text-sm text-gray-500 mt-1">{items.length} itens cadastrados no sistema</p>
          </div>
          <Button
            size="sm"
            className="bg-[#C8102E] hover:bg-[#A00D24] gap-2"
            onClick={() => navigate('register-item')}
          >
            <Plus className="size-4" />
            Cadastrar item
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48">
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
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="disponivel">Disponível</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="processo">Em Processo</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" className="w-44" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-10">#</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Item</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Categoria</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Local</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Data</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Dias</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(item => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${item.daysFound > 90 ? 'bg-amber-50/60' : ''}`}
                  >
                    <td className="px-4 py-3 text-xs text-gray-400">{item.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-md object-cover bg-gray-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate max-w-[160px]">{item.name}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[160px]">{item.description.slice(0, 40)}…</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5">{item.category}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{item.location}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{item.date}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3">
                      {item.daysFound > 90 ? (
                        <div className="flex items-center gap-1 text-amber-600">
                          <AlertTriangle className="size-3" />
                          <span className="text-xs font-medium">{item.daysFound}d</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">{item.daysFound}d</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                          <Pencil className="size-3.5" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
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
            <div className="text-center py-10 text-gray-400 text-sm">
              Nenhum item encontrado.
            </div>
          )}
        </div>

        {/* Legend */}
        {items.some(i => i.daysFound > 90) && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
            <AlertTriangle className="size-3.5 shrink-0" />
            Itens destacados em amarelo estão há mais de 90 dias sem dono. Considere descartá-los conforme política escolar.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
