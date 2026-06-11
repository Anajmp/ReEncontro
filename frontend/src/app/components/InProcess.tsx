import { CheckCircle2, X, Clock, User, Mail, Phone, GraduationCap } from 'lucide-react';
import { Button } from './ui/button';
import { StatusBadge } from './shared/StatusBadge';
import { AdminLayout } from './shared/AdminLayout';
import { claims } from './shared/data';
import type { Screen } from '../App';

interface Props {
  navigate: (s: Screen) => void;
}

const inProcessClaims = claims.filter(c => c.status === 'Em Processo').map(c => ({
  ...c,
  daysRemaining: 3,
  approvedDate: '17/03/2024',
  pickupDeadline: '20/03/2024',
}));

function DaysCounter({ days }: { days: number }) {
  const color = days <= 1 ? 'text-red-600 bg-red-50 border-red-200' : days <= 2 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-blue-600 bg-blue-50 border-blue-200';
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${color}`}>
      <Clock className="size-3.5" />
      {days} {days === 1 ? 'dia restante' : 'dias restantes'}
    </div>
  );
}

export function InProcess({ navigate }: Props) {
  return (
    <AdminLayout current="in-process" navigate={navigate}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-gray-900">Em Processo</h1>
          <p className="text-sm text-gray-500 mt-1">
            Reivindicações aprovadas aguardando retirada pelo responsável.
          </p>
        </div>

        {inProcessClaims.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 py-16 text-center">
            <CheckCircle2 className="size-10 text-green-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum item aguardando retirada.</p>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-5 text-sm text-blue-800 flex items-center gap-2">
              <Clock className="size-4 shrink-0" />
              Itens aprovados têm <strong>5 dias corridos</strong> para retirada. Após esse prazo, retornam para disponível.
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {inProcessClaims.map(claim => (
                <div key={claim.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex gap-0">
                    <div className="w-28 shrink-0">
                      <img
                        src={claim.itemImage}
                        alt={claim.itemName}
                        className="w-full h-full object-cover min-h-[160px]"
                        style={{ maxHeight: 220 }}
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-gray-900">{claim.itemName}</div>
                          <div className="text-xs text-gray-400 mt-0.5">Aprovado em {claim.approvedDate}</div>
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

                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-gray-500">
                          Prazo: <span className="font-medium text-gray-700">{claim.pickupDeadline}</span>
                        </div>
                        <DaysCounter days={claim.daysRemaining} />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-[#C8102E] hover:bg-[#A00D24] gap-1.5"
                        >
                          <CheckCircle2 className="size-3.5" />
                          Confirmar Entrega
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-gray-500 gap-1.5"
                        >
                          <X className="size-3.5" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
