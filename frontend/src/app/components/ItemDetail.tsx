import { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Package, Building2, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { StatusBadge } from './shared/StatusBadge';
import { items } from './shared/data';
import type { Screen } from '../App';

interface Props {
  navigate: (s: Screen) => void;
}

function ClaimModal({ open, onClose, itemName }: { open: boolean; onClose: () => void; itemName: string }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={() => { onClose(); setSubmitted(false); }}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="size-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Reivindicação enviada!</h3>
            <p className="text-sm text-gray-500">Nossa equipe entrará em contato para confirmar a retirada em até 2 dias úteis.</p>
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
          <p className="text-sm text-gray-500">Reivindicando: <strong className="text-gray-700">{itemName}</strong></p>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nome completo *</Label>
              <Input placeholder="Seu nome completo" />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail *</Label>
              <Input type="email" placeholder="seu@email.com" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Telefone <span className="text-gray-400 font-normal">(opcional)</span></Label>
            <Input placeholder="(11) 99999-9999" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Nome do aluno *</Label>
              <Input placeholder="Nome completo do aluno" />
            </div>
            <div className="space-y-1.5">
              <Label>Sala *</Label>
              <Input placeholder="Ex: 5º A" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Período *</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
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

export function ItemDetail({ navigate }: Props) {
  const [claimOpen, setClaimOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const item = items[0];

  const photos = [item.image, items[4].image, items[5].image];

  const infoRows = [
    { icon: Package, label: 'Categoria', value: item.category },
    { icon: MapPin, label: 'Local encontrado', value: item.location },
    { icon: Calendar, label: 'Data encontrado', value: item.date },
    { icon: Building2, label: 'Ponto de coleta', value: item.collectionPoint },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C8102E] rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="font-bold text-gray-900">ReEncontro</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate('public-listing')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          Voltar para a listagem
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={photos[activePhoto]}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className={`w-20 h-16 rounded-md overflow-hidden border-2 transition-colors shrink-0 ${
                    activePhoto === i ? 'border-[#C8102E]' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info card */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h1 className="text-gray-900">{item.name}</h1>
                  <p className="text-gray-500 text-sm mt-0.5">Ref. #RE-{String(item.id).padStart(4, '0')}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="space-y-3">
                {infoRows.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="size-4 text-gray-400" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">{label}</div>
                      <div className="text-sm text-gray-900 font-medium">{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-400 mb-1">Descrição</div>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>

              <Button
                size="lg"
                className="w-full mt-5 bg-[#C8102E] hover:bg-[#A00D24]"
                onClick={() => setClaimOpen(true)}
                disabled={item.status === 'Entregue' || item.status === 'Descartado'}
              >
                Este item é meu!
              </Button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
              <strong>Como funciona?</strong> Após enviar a reivindicação, nossa equipe verificará os dados e entrará em contato em até 2 dias úteis para confirmar a retirada.
            </div>
          </div>
        </div>
      </main>

      <ClaimModal open={claimOpen} onClose={() => setClaimOpen(false)} itemName={item.name} />
    </div>
  );
}
