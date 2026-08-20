import { useState, useEffect } from 'react';
import { Check, X, Mail, Phone, User, GraduationCap } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { StatusBadge } from './shared/StatusBadge';
import { AdminLayout } from './shared/AdminLayout';
import { AdminPanel, adminBtnPrimary } from './shared/AdminChrome';
import { reivindicacoesApi } from '../../lib/api';
import type { Screen } from '../App'
import type { Status } from './shared/data';;


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


interface Props {
  navigate: (s: Screen) => void;
}

function RejectionModal({
  claim,
  open,
  onClose,
  onConfirm,
}: {
  claim: Claim | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState(false);

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError(true);
      return;
    }
    onConfirm(reason);
    setReason('');
    setError(false);
  };

  if (!claim) return null;

  return (
    <Dialog open={open} onOpenChange={() => { onClose(); setReason(''); setError(false); }}>
      <DialogContent className="max-w-md rounded-2xl border-[#E7E5E4]">
        <DialogHeader>
          <DialogTitle className="text-[#1C1917]">Rejeitar reivindicação</DialogTitle>
          <p className="mt-0.5 text-sm text-[#78716C]">
            Item: <strong className="text-[#1C1917]">{claim.itemName}</strong>
          </p>
        </DialogHeader>
        <div className="py-2">
          <Label htmlFor="rejection-reason" className="text-sm font-semibold text-[#1C1917]">
            Justificativa <span className="text-[#C8102E]">*</span>
          </Label>
          <textarea
            id="rejection-reason"
            rows={4}
            className={`mt-1.5 w-full resize-none rounded-xl border px-3 py-2 text-sm transition-colors focus:border-[#C8102E] focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20 ${
              error ? 'border-red-300 bg-[#FEE2E2]' : 'border-[#E7E5E4] bg-[#F5F3F0]'
            }`}
            placeholder="Descreva o motivo da rejeição. Esta mensagem será enviada ao responsável por e-mail."
            value={reason}
            onChange={e => { setReason(e.target.value); setError(false); }}
          />
          {error && (
            <p className="text-xs text-red-500 mt-1">A justificativa é obrigatória para rejeitar.</p>
          )}
        </div>
        <div className="mt-1 flex gap-3 border-t border-[#E7E5E4] pt-2">
          <Button variant="outline" className="flex-1 rounded-xl border-[#E7E5E4]" onClick={onClose}>Cancelar</Button>
          <Button className={`flex-1 ${adminBtnPrimary}`} onClick={handleConfirm}>
            Confirmar rejeição
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PendingClaims({ navigate }: Props) {
  const [rejecting, setRejecting] = useState<Claim | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approved, setApproved] = useState<number[]>([]);
  const [rejected, setRejected] = useState<number[]>([]);
  const [pendingClaims, setPendingClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca os pendentes reais do backend
  async function carregar() {
    setLoading(true);
    try {
      const dados = await reivindicacoesApi.listarPendentes();
      setPendingClaims(dados);
    } catch (err) {
      console.error('Erro ao carregar pendentes:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

 const handleApprove = async (id: number) => {
    try {
      await reivindicacoesApi.aprovar(id);
      carregar();  // recarrega a lista (o item aprovado sai dos pendentes)
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar');
    }
  };

  const handleReject = (claim: Claim) => {
    setRejecting(claim);
    setRejectOpen(true);
  };

  const confirmReject = async (reason: string) => {
    if (!rejecting) return;
    try {
      await reivindicacoesApi.rejeitar(rejecting.id, reason);
      setRejectOpen(false);
      setRejecting(null);
      carregar();  // recarrega
    } catch (err: any) {
      alert(err.message || 'Erro ao rejeitar');
    }
  };

  const visibleClaims = pendingClaims;

  return (
    <AdminLayout current="pending-claims" navigate={navigate}>
      <div className="space-y-4">
        <p className="text-sm text-[#78716C]">
          {visibleClaims.length} reivindicação{visibleClaims.length !== 1 ? 'ões' : ''} aguardando análise
        </p>

        {visibleClaims.length === 0 && (
          <AdminPanel className="py-16 text-center">
            <Check className="mx-auto mb-3 size-10 text-[#059669]" />
            <p className="font-semibold text-[#1C1917]">Tudo em dia!</p>
            <p className="mt-1 text-sm text-[#78716C]">Não há reivindicações pendentes no momento.</p>
          </AdminPanel>
        )}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {visibleClaims.map(claim => (
            <AdminPanel key={claim.id} className="overflow-hidden">
              <div className="flex gap-0">
                <div className="w-28 shrink-0">
                  <img
                    src={claim.itemImage}
                    alt={claim.itemName}
                    className="min-h-[140px] w-full object-cover"
                    style={{ maxHeight: 200 }}
                  />
                </div>
                <div className="flex-1 p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="font-bold text-[#1C1917]">{claim.itemName}</div>
                      <div className="mt-0.5 text-xs text-[#A8A29E]">Reivindicado em {claim.date}</div>
                    </div>
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
                      <span>
                        <strong className="text-[#1C1917]">{claim.studentName}</strong> · {claim.studentRoom} · {claim.studentPeriod}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5 rounded-xl bg-[#059669] font-semibold hover:bg-[#047857]"
                      onClick={() => handleApprove(claim.id)}
                    >
                      <Check className="size-3.5" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 rounded-xl border-[#FEE2E2] text-[#C8102E] hover:bg-[#FEE2E2]"
                      onClick={() => handleReject(claim)}
                    >
                      <X className="size-3.5" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </div>
            </AdminPanel>
          ))}
        </div>

        {(approved.length > 0 || rejected.length > 0) && (
          <div className="text-center text-xs text-[#A8A29E]">
            {approved.length > 0 && `${approved.length} aprovada${approved.length > 1 ? 's' : ''} `}
            {rejected.length > 0 && `${rejected.length} rejeitada${rejected.length > 1 ? 's' : ''} nesta sessão`}
          </div>
        )}
      </div>

      <RejectionModal
        claim={rejecting}
        open={rejectOpen}
        onClose={() => { setRejectOpen(false); setRejecting(null); }}
        onConfirm={confirmReject}
      />
    </AdminLayout>
  );
}
