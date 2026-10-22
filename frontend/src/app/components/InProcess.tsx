import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, X, User, Mail, Phone, GraduationCap } from 'lucide-react';
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
      <DialogContent className="max-w-md rounded-2xl border-linha">
        <DialogHeader>
          <DialogTitle className="text-tinta">Cancelar reivindicação</DialogTitle>
          <p className="mt-0.5 text-sm text-tinta-suave">
            Item: <strong className="text-tinta">{claim.itemName}</strong>
          </p>
        </DialogHeader>
        <div className="py-2">
          <Label htmlFor="cancel-reason" className="text-sm font-semibold text-tinta">Motivo <span className="text-marca-texto">*</span></Label>
          <textarea
            id="cancel-reason"
            rows={4}
            className={`mt-1.5 w-full resize-none rounded-xl border px-3 py-2 text-sm focus:border-[#C8102E] focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20 ${error ? 'border-erro-borda-forte bg-marca-clara' : 'border-linha bg-fundo'}`}
            placeholder="Ex: Responsável não compareceu no prazo."
            aria-required
            aria-invalid={error || undefined}
            aria-describedby={error ? 'cancel-reason-erro' : undefined}
            value={motivo}
            onChange={e => { setMotivo(e.target.value); setError(false); }}
          />
          {error && <p id="cancel-reason-erro" role="alert" className="text-xs text-marca-texto mt-1">A justificativa é obrigatória.</p>}
        </div>
        <div className="flex gap-3 border-t border-linha pt-2">
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

  // Busca a lista. Quem quiser mostrar o "Carregando..." de novo chama
  // setLoading(true) antes (no handler), não aqui dentro.
  const carregar = useCallback(() => {
    return reivindicacoesApi.listarEmProcesso()
      .then((dados: Claim[]) => setClaims(dados))
      .catch(err => console.error('Erro ao carregar em processo:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const recarregar = () => {
    setLoading(true);
    carregar();
  };

  const entregar = async (id: number) => {
    try {
      await reivindicacoesApi.confirmarEntrega(id);
      recarregar();
    } catch (err: unknown) {
      alert((err instanceof Error && err.message) || 'Erro ao confirmar entrega');
    }
  };

  const abrirCancelar = (claim: Claim) => { setCancelling(claim); setCancelOpen(true); };

  const confirmarCancelamento = async (motivo: string) => {
    if (!cancelling) return;
    try {
      await reivindicacoesApi.cancelar(cancelling.id, motivo);
      setCancelOpen(false); setCancelling(null);
      recarregar();
    } catch (err: unknown) {
      alert((err instanceof Error && err.message) || 'Erro ao cancelar');
    }
  };

  return (
    <AdminLayout current="in-process" navigate={navigate}>
      <div className="space-y-5">
        <div className="flex items-center gap-2 rounded-xl border border-alerta-fundo bg-alerta-fundo/50 px-4 py-3 text-sm text-alerta-texto">
          <GraduationCap className="size-4 shrink-0" />
          Confira a ficha física do aluno e um documento com foto antes de confirmar a entrega.
        </div>

        {loading ? (
          <p className="py-16 text-center text-tinta-suave" role="status">Carregando...</p>
        ) : claims.length === 0 ? (
          <AdminPanel className="py-16 text-center">
            <CheckCircle2 className="mx-auto mb-3 size-10 text-sucesso-texto" aria-hidden />
            <h2 className="font-semibold text-tinta">Nenhum item aguardando retirada.</h2>
          </AdminPanel>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {claims.map(claim => (
              <AdminPanel key={claim.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:gap-0">
                <div className="w-full shrink-0 sm:w-28">
                  <img
                    src={claim.itemImage}
                    alt={claim.itemName}
                    className="aspect-[16/9] w-full object-cover sm:aspect-auto sm:min-h-[160px] sm:max-h-[220px]"
                  />
                </div>
                <div className="min-w-0 flex-1 p-4">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-bold text-tinta">{claim.itemName}</h2>
                      <div className="mt-0.5 text-xs text-tinta-suave">Reivindicado em {claim.date}</div>
                    </div>
                    <StatusBadge status={claim.status} />
                  </div>
                  <div className="mb-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-tinta-suave">
                      <User className="size-3.5 shrink-0 text-tinta-suave" />
                      <span className="truncate font-semibold">{claim.claimantName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-tinta-suave">
                      <Mail className="size-3.5 shrink-0 text-tinta-suave" />
                      <span className="truncate">{claim.claimantEmail}</span>
                    </div>
                    {claim.claimantPhone && (
                      <div className="flex items-center gap-2 text-xs text-tinta-suave">
                        <Phone className="size-3.5 shrink-0 text-tinta-suave" />
                        {claim.claimantPhone}
                      </div>
                    )}
                  </div>

                  <div className="mb-3 rounded-xl bg-fundo px-3 py-2">
                    <div className="flex items-center gap-2 text-xs text-tinta-suave">
                      <GraduationCap className="size-3.5 shrink-0 text-tinta-suave" />
                      <span className="truncate">
                        <strong className="text-tinta">{claim.studentName}</strong> · {claim.studentRoom} · {claim.studentPeriod}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      size="sm"
                      className="w-full gap-1.5 rounded-xl bg-[#047857] font-semibold hover:bg-[#065F46] sm:flex-1"
                      onClick={() => entregar(claim.id)}
                      aria-label={`Confirmar entrega: ${claim.itemName}`}
                    >
                      <CheckCircle2 className="size-3.5" />
                      Confirmar Entrega
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`w-full gap-1.5 sm:flex-1 ${adminBtnOutline}`}
                      onClick={() => abrirCancelar(claim)}
                      aria-label={`Cancelar: ${claim.itemName}`}
                    >
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