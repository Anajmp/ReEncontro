import { useState } from 'react';
import { Search, MapPin, Calendar, LogIn, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { StatusBadge } from './shared/StatusBadge';
import { items } from './shared/data';
import type { Item } from './shared/data';
import type { Screen } from '../App';

interface Props {
  navigate: (s: Screen) => void;
}

function ClaimModal({ item, open, onClose }: { item: Item | null; open: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  if (!item) return null;

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={() => { onClose(); setSubmitted(false); }}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="size-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Reivindicação enviada!</h3>
            <p className="text-sm text-gray-500">Você receberá um e-mail em breve. Nossa equipe entrará em contato para confirmar a retirada.</p>
            <Button className="mt-4 bg-[#C8102E] hover:bg-[#A00D24]" onClick={() => { onClose(); setSubmitted(false); }}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Este item é meu!</DialogTitle>
          <p className="text-sm text-gray-500 mt-0.5">
            Reivindicando: <strong className="text-gray-700">{item.name}</strong>
          </p>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="claim-name">Nome completo *</Label>
              <Input id="claim-name" placeholder="Seu nome completo" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="claim-email">E-mail *</Label>
              <Input id="claim-email" type="email" placeholder="seu@email.com" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="claim-phone">
              Telefone <span className="text-gray-400 font-normal">(opcional)</span>
            </Label>
            <Input id="claim-phone" placeholder="(11) 99999-9999" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="claim-student">Nome do aluno *</Label>
              <Input id="claim-student" placeholder="Nome completo do aluno" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="claim-room">Sala *</Label>
              <Input id="claim-room" placeholder="Ex: 5º A" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Período *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manha">Manhã</SelectItem>
                <SelectItem value="tarde">Tarde</SelectItem>
                <SelectItem value="noite">Noite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-3 pt-2 border-t border-gray-100 mt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1 bg-[#C8102E] hover:bg-[#A00D24]" onClick={() => setSubmitted(true)}>
            Enviar reivindicação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PublicListing({ navigate }: Props) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [claimOpen, setClaimOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.location.toLowerCase().includes(q);
    const matchCategory = category === 'all' || item.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C8102E] rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-gray-900">ReEncontro</span>
            <span className="text-gray-400 text-sm hidden sm:inline">Escola Estadual São Paulo</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('login')} className="gap-2">
          <LogIn className="size-4" />
          Entrar
        </Button>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-gray-900">Itens Encontrados</h1>
          <p className="text-gray-500 text-sm mt-1">Reconheceu um item? Clique em "É meu!" para iniciar a reivindicação.</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome, descrição ou local..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-52">
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
          <Input type="date" className="w-44" />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Search className="size-10 mx-auto mb-3 opacity-30" />
            <p>Nenhum item encontrado com esses filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div
                  className="relative h-44 bg-gray-100 overflow-hidden cursor-pointer"
                  onClick={() => navigate('item-detail')}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={item.status} />
                  </div>
                </div>
                <div className="p-3.5">
                  <h3
                    className="font-semibold text-gray-900 truncate cursor-pointer hover:text-[#C8102E] transition-colors"
                    onClick={() => navigate('item-detail')}
                  >
                    {item.name}
                  </h3>
                  <span className="inline-block text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5 mt-1">
                    {item.category}
                  </span>
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin className="size-3 text-gray-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="size-3 text-gray-400 shrink-0" />
                      {item.date}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-3 bg-[#C8102E] hover:bg-[#A00D24]"
                    onClick={() => { setSelectedItem(item); setClaimOpen(true); }}
                    disabled={item.status === 'Entregue' || item.status === 'Descartado'}
                  >
                    É meu!
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ClaimModal item={selectedItem} open={claimOpen} onClose={() => setClaimOpen(false)} />
    </div>
  );
}
