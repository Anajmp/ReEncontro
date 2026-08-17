import { useState, useEffect } from 'react';
import { CheckCircle2, X, Clock, User, Mail, Phone, GraduationCap } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { StatusBadge } from './shared/StatusBadge';
import { AdminLayout } from './shared/AdminLayout';
import type { Status } from './shared/data';
import type { Screen } from '../App';
import { reivindicacoesApi } from '../../lib/api';

interface Props {
  navigate: (s: Screen) => void;
}

interface Claim {
  id: number;
  itemId: number;
  itemName: string;
  itemImage: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  studentName: string;
  studentRoom: string;
  studentPeriod: string;
  date: string;
  status: Status;
}

// Modal de cancelamento (exige motivo)
function CancelModal({ claim, open, onClose, onConfirm }: {
  claim: Claim | null; open: boolean; onClose: () => void; onConfirm: (motivo: string) => void;
}) {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState(false);

  if (!claim) return null;

  const confirmar = () => {
    if (!motivo.trim()) { setError(true); return; }
    onConfirm(motivo);
    setMotivo(''); setError(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => { onClose(); setMotivo(''); setError(false); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar reivindicação</DialogTitle>
          <p className="text-sm text-gray-500 mt-0.5">
            Item: <strong className="text-gray-700">{claim.itemName}</strong>
          </p>
        </DialogHeader>
        <div className="py-2">
          <Label htmlFor="cancel-reason">Motivo <span className="text-[#C8102E]">*</span></Label>
          <textarea
            id="cancel-reason"
            rows={4}
            className={`w-full mt-1.5 px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#C8102E]/30 ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
            placeholder="Ex: Responsável não compareceu no prazo."
            value={motivo}
            onChange={e => { setMotivo(e.target.value); setError(false); }}
          />
          {error && <p className="text-xs text-red-600 mt-1">A justificativa é obrigatória.</p>}
        </div>
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <Button variant="outline" className="flex-1" onClick={() => { onClose(); setMotivo(''); setError(false); }}>Voltar</Button>
          <Button className="flex-1 bg-[#C8102E] hover:bg-[#A00D24]" onClick={confirmar}>Confirmar cancelamento</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function InProcess({ navigate }: Props) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<Claim | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  async function carregar() {
    setLoading(true);
    try {
      const dados = await reivindicacoesApi.listarEmProcesso();
      setClaims(dados);
    } catch (err) {
      console.error('Erro ao carregar em processo:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  const entregar = async (id: number) => {
    try {
      await reivindicacoesApi.confirmarEntrega(id);
      carregar();
    } catch (err: any) {
      alert(err.message || 'Erro ao confirmar entrega');
    }
  };

  const abrirCancelar = (claim: Claim) => { setCancelling(claim); setCancelOpen(true); };

  const confirmarCancelamento = async (motivo: string) => {
    if (!cancelling) return;
    try {
      await reivindicacoesApi.cancelar(cancelling.id, motivo);
      setCancelOpen(false); setCancelling(null);
      carregar();
    } catch (err: any) {
      alert(err.message || 'Erro ao cancelar');
    }
  };

  return (
    <AdminLayout current="in-process" navigate={navigate}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-gray-900">Em Processo</h1>
          <p className="text-sm text-gray-500 mt-1">Reivindicações aprovadas aguardando retirada pelo responsável.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5 text-sm text-amber-800 flex items-center gap-2">
          <GraduationCap className="size-4 shrink-0" />
          Confira a ficha física do aluno e um documento com foto antes de confirmar a entrega.
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-16">Carregando...</p>
        ) : claims.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 py-16 text-center">
            <CheckCircle2 className="size-10 text-green-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum item aguardando retirada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {claims.map(claim => (
              <div key={claim.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="flex gap-0">
                  <div className="w-28 shrink-0">
                    <img src={claim.itemImage} alt={claim.itemName} className="w-full h-full object-cover min-h-[160px]" style={{ maxHeight: 220 }} />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="font-semibold text-gray-900">{claim.itemName}</div>
                      <StatusBadge status={claim.status} />
                    </div>
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <User className="size-3.5 text-gray-400 shrink-0" />
                        <span className="font-medium">{claim.claimantName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Mail className="size-3.5 text-gray-400 shrink-0" />
                        {claim.claimantEmail}
                      </div>
                      {claim.claimantPhone && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone className="size-3.5 text-gray-400 shrink-0" />
                          {claim.claimantPhone}
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-md px-3 py-2 mb-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <GraduationCap className="size-3.5 text-gray-400 shrink-0" />
                        <span><strong>{claim.studentName}</strong> · {claim.studentRoom} · {claim.studentPeriod}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-[#C8102E] hover:bg-[#A00D24] gap-1.5" onClick={() => entregar(claim.id)}>
                        <CheckCircle2 className="size-3.5" />
                        Confirmar Entrega
                      </Button>
                      <Button size="sm" variant="outline" className="text-gray-500 gap-1.5" onClick={() => abrirCancelar(claim)}>
                        <X className="size-3.5" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CancelModal claim={cancelling} open={cancelOpen} onClose={() => setCancelOpen(false)} onConfirm={confirmarCancelamento} />
    </AdminLayout>
  );
}