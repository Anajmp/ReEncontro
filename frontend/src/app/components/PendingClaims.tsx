import { useState } from 'react';
import { Check, X, Mail, Phone, User, GraduationCap } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { StatusBadge } from './shared/StatusBadge';
import { AdminLayout } from './shared/AdminLayout';
import { claims } from './shared/data';
import type { Claim } from './shared/data';
import type { Screen } from '../App';

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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rejeitar reivindicação</DialogTitle>
          <p className="text-sm text-gray-500 mt-0.5">
            Item: <strong className="text-gray-700">{claim.itemName}</strong>
          </p>
        </DialogHeader>
        <div className="py-2">
          <Label htmlFor="rejection-reason">
            Justificativa <span className="text-[#C8102E]">*</span>
          </Label>
          <textarea
            id="rejection-reason"
            rows={4}
            className={`w-full mt-1.5 px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#C8102E]/30 focus:border-[#C8102E] transition-colors ${
              error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
            }`}
            placeholder="Descreva o motivo da rejeição. Esta mensagem será enviada ao responsável por e-mail."
            value={reason}
            onChange={e => { setReason(e.target.value); setError(false); }}
          />
          {error && (
            <p className="text-xs text-red-500 mt-1">A justificativa é obrigatória para rejeitar.</p>
          )}
        </div>
        <div className="flex gap-3 border-t border-gray-100 pt-2 mt-1">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button
            className="flex-1 bg-[#C8102E] hover:bg-[#A00D24]"
            onClick={handleConfirm}
          >
            Confirmar rejeição
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PendingClaims({ navigate }: Props) {
  const pendingClaims = claims.filter(c => c.status === 'Pendente');
  const [rejecting, setRejecting] = useState<Claim | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approved, setApproved] = useState<number[]>([]);
  const [rejected, setRejected] = useState<number[]>([]);

  const handleApprove = (id: number) => {
    setApproved(prev => [...prev, id]);
  };

  const handleReject = (claim: Claim) => {
    setRejecting(claim);
    setRejectOpen(true);
  };

  const confirmReject = (_reason: string) => {
    if (rejecting) setRejected(prev => [...prev, rejecting.id]);
    setRejectOpen(false);
    setRejecting(null);
  };

  const visibleClaims = pendingClaims.filter(c => !approved.includes(c.id) && !rejected.includes(c.id));

  return (
    <AdminLayout current="pending-claims" navigate={navigate}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-gray-900">Reivindicações Pendentes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {visibleClaims.length} reivindicação{visibleClaims.length !== 1 ? 'ões' : ''} aguardando análise
          </p>
        </div>

        {visibleClaims.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 py-16 text-center">
            <Check className="size-10 text-green-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Tudo em dia!</p>
            <p className="text-sm text-gray-400 mt-1">Não há reivindicações pendentes no momento.</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {visibleClaims.map(claim => (
            <div key={claim.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Item photo strip */}
              <div className="flex gap-0">
                <div className="w-28 shrink-0">
                  <img
                    src={claim.itemImage}
                    alt={claim.itemName}
                    className="w-full h-full object-cover min-h-[140px]"
                    style={{ maxHeight: 200 }}
                  />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-gray-900">{claim.itemName}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Reivindicado em {claim.date}</div>
                    </div>
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
                      <span>
                        <strong>{claim.studentName}</strong> · {claim.room} · {claim.period}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 gap-1.5"
                      onClick={() => handleApprove(claim.id)}
                    >
                      <Check className="size-3.5" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                      onClick={() => handleReject(claim)}
                    >
                      <X className="size-3.5" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(approved.length > 0 || rejected.length > 0) && (
          <div className="mt-4 text-xs text-gray-400 text-center">
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
