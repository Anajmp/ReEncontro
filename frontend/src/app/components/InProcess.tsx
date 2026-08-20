import { useState, useEffect } from 'react';
import { CheckCircle2, X, Clock, User, Mail, Phone, GraduationCap } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { StatusBadge } from './shared/StatusBadge';
import { AdminLayout } from './shared/AdminLayout';
import { AdminPanel, adminBtnPrimary, adminBtnOutline } from './shared/AdminChrome';
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
      <DialogContent className="max-w-md rounded-2xl border-[#E7E5E4]">
        <DialogHeader>
          <DialogTitle className="text-[#1C1917]">Cancelar reivindicação</DialogTitle>
          <p className="mt-0.5 text-sm text-[#78716C]">
            Item: <strong className="text-[#1C1917]">{claim.itemName}</strong>
          </p>
        </DialogHeader>
        <div className="py-2">
          <Label htmlFor="cancel-reason" className="text-sm font-semibold text-[#1C1917]">Motivo <span className="text-[#C8102E]">*</span></Label>
          <textarea
            id="cancel-reason"
            rows={4}
            className={`mt-1.5 w-full resize-none rounded-xl border px-3 py-2 text-sm focus:border-[#C8102E] focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20 ${error ? 'border-red-300 bg-[#FEE2E2]' : 'border-[#E7E5E4] bg-[#F5F3F0]'}`}
            placeholder="Ex: Responsável não compareceu no prazo."
            value={motivo}
            onChange={e => { setMotivo(e.target.value); setError(false); }}
          />
          {error && <p className="text-xs text-red-600 mt-1">A justificativa é obrigatória.</p>}
        </div>
        <div className="flex gap-3 border-t border-[#E7E5E4] pt-2">
          <Button variant="outline" className={`flex-1 ${adminBtnOutline}`} onClick={() => { onClose(); setMotivo(''); setError(false); }}>Voltar</Button>
          <Button className={`flex-1 ${adminBtnPrimary}`} onClick={confirmar}>Confirmar cancelamento</Button>
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
      <div className="space-y-5">
        <div className="flex items-center gap-2 rounded-xl border border-[#FEF3C7] bg-[#FEF3C7]/50 px-4 py-3 text-sm text-[#92400E]">
          <GraduationCap className="size-4 shrink-0" />
          Confira a ficha física do aluno e um documento com foto antes de confirmar a entrega.
        </div>

        {loading ? (
          <p className="py-16 text-center text-[#78716C]">Carregando...</p>
        ) : claims.length === 0 ? (
          <AdminPanel className="py-16 text-center">
            <CheckCircle2 className="mx-auto mb-3 size-10 text-[#059669]" />
            <p className="font-semibold text-[#1C1917]">Nenhum item aguardando retirada.</p>
          </AdminPanel>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {claims.map(claim => (
              <AdminPanel key={claim.id} className="overflow-hidden">
                <div className="flex gap-0">
                  <div className="w-28 shrink-0">
                    <img src={claim.itemImage} alt={claim.itemName} className="min-h-[160px] w-full object-cover" style={{ maxHeight: 220 }} />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="font-bold text-[#1C1917]">{claim.itemName}</div>
                      <StatusBadge status={claim.status} />
                    </div>
                    <div className="mb-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-[#78716C]">
                        <User className="size-3.5 shrink-0 text-[#A8A29E]" />
                        <span className="font-semibold">{claim.claimantName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#78716C]">
                        <Mail className="size-3.5 shrink-0 text-[#A8A29E]" />
                        {claim.claimantEmail}
                      </div>
                      {claim.claimantPhone && (
                        <div className="flex items-center gap-2 text-xs text-[#78716C]">
                          <Phone className="size-3.5 shrink-0 text-[#A8A29E]" />
                          {claim.claimantPhone}
                        </div>
                      )}
                    </div>
                    <div className="mb-3 rounded-xl bg-[#F5F3F0] px-3 py-2">
                      <div className="flex items-center gap-2 text-xs text-[#78716C]">
                        <GraduationCap className="size-3.5 shrink-0 text-[#A8A29E]" />
                        <span><strong className="text-[#1C1917]">{claim.studentName}</strong> · {claim.studentRoom} · {claim.studentPeriod}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className={`flex-1 gap-1.5 ${adminBtnPrimary}`} onClick={() => entregar(claim.id)}>
                        <CheckCircle2 className="size-3.5" />
                        Confirmar Entrega
                      </Button>
                      <Button size="sm" variant="outline" className={`flex-1 gap-1.5 ${adminBtnOutline}`} onClick={() => abrirCancelar(claim)}>
                        <X className="size-3.5" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              </AdminPanel>
            ))}
          </div>
        )}
      </div>

      <CancelModal claim={cancelling} open={cancelOpen} onClose={() => setCancelOpen(false)} onConfirm={confirmarCancelamento} />
    </AdminLayout>
  );
}