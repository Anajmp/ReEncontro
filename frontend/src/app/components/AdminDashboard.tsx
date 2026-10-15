import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';
import { Package, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { AdminLayout } from './shared/AdminLayout';
import { StatusBadge } from './shared/StatusBadge';
import type { Screen } from '../App';
import {
  MetricCard, CardHeader, CustomBarTooltip, getCatConfig, AdminPanel,
} from './shared/AdminChrome';
import { relatoriosApi } from '../../lib/api';

interface Props {
  navigate: (s: Screen) => void;
}

// Converte "2026-09" em "Set"
function nomeMes(mes: string): string {
  const nomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return nomes[Number(mes.split('-')[1]) - 1];
}

const plural = (n: number, singular: string, pluralForm: string) =>
  `${n} ${n === 1 ? singular : pluralForm}`;

export function AdminDashboard({ navigate }: Props) {
  const [dados, setDados] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    relatoriosApi.dashboard()
      .then(setDados)
      .catch(err => setErro(err.message || 'Erro ao carregar o dashboard'))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando || erro) {
    return (
      <AdminLayout current="admin-dashboard" navigate={navigate}>
        <div className="mx-auto max-w-6xl">
          <AdminPanel className={`py-16 text-center text-sm ${erro ? 'text-[#C8102E]' : 'text-[#A8A29E]'}`}>
            {erro || 'Carregando dashboard...'}
          </AdminPanel>
        </div>
      </AdminLayout>
    );
  }

  const monthlyData = dados.por_mes.map((m: any) => ({
    month: nomeMes(m.mes),
    encontrados: m.encontrados,
    entregues: m.devolvidos,
  }));

  const categoryData = dados.por_categoria.map((c: any) => ({
    name: c.categoria,
    value: c.total,
    color: getCatConfig(c.categoria).color,
  }));

  const recentes: any[] = dados.reivindicacoes_recentes;
  const variacao: number | null = dados.variacao_entregues;

  return (
    <AdminLayout current="admin-dashboard" navigate={navigate}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            label="Itens disponíveis"
            value={dados.itens_disponiveis}
            context={`+${dados.disponiveis_semana} essa semana`}
            icon={<Package size={18} color="#2563EB" strokeWidth={1.8} />}
            iconBg="#DBEAFE"
            valueColor="#2563EB"
            trend={dados.disponiveis_semana > 0 ? 'up' : null}
          />
          <MetricCard
            label="Reivindicações pendentes"
            value={dados.pendentes}
            context={plural(dados.pendentes_hoje, 'nova hoje', 'novas hoje')}
            icon={<AlertCircle size={18} color="#D97706" strokeWidth={1.8} />}
            iconBg="#FEF3C7"
            valueColor="#D97706"
          />
          <MetricCard
            label="Em processo"
            value={dados.em_processo}
            context={
              dados.em_processo_prazo > 0
                ? `${dados.em_processo_prazo} perto do prazo de retirada`
                : 'Aguardando retirada'
            }
            icon={<Clock size={18} color="#C8102E" strokeWidth={1.8} />}
            iconBg="#FEE2E2"
            valueColor="#C8102E"
          />
          <MetricCard
            label="Entregues este mês"
            value={dados.entregues_mes}
            context={
              variacao === null
                ? `${dados.entregues_mes_anterior} no mês passado`
                : variacao === 0
                ? 'Igual ao mês passado'
                : `${variacao >= 0 ? '↑' : '↓'} ${Math.abs(variacao)}% vs. mês passado`
            }
            icon={<CheckCircle2 size={18} color="#059669" strokeWidth={1.8} />}
            iconBg="#D1FAE5"
            valueColor="#059669"
            trend={variacao === null || variacao === 0 ? null : variacao > 0 ? 'up' : 'down'}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <AdminPanel className="p-5 lg:col-span-2">
            <CardHeader title="Itens por mês" />
            <p className="-mt-3 mb-4 text-xs text-[#A8A29E]">Encontrados vs. entregues — últimos 6 meses</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} barSize={18} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A8A29E' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A8A29E' }} allowDecimals={false} width={32} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#F5F3F0' }} />
                <Bar dataKey="encontrados" fill="#E7E5E4" radius={[6, 6, 0, 0]} name="Encontrados" />
                <Bar dataKey="entregues" fill="#C8102E" radius={[6, 6, 0, 0]} name="Entregues" />
              </BarChart>
            </ResponsiveContainer>
          </AdminPanel>

          <AdminPanel className="p-5">
            <CardHeader title="Por categoria" />
            <p className="-mt-3 mb-2 text-xs text-[#A8A29E]">Itens ainda não finalizados</p>
            {categoryData.length === 0 ? (
              <p className="py-16 text-center text-sm text-[#A8A29E]">Nenhum item em aberto.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E7E5E4', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-2">
                  {categoryData.map((d: any) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="size-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                        <span className="text-[#78716C]">{d.name}</span>
                      </div>
                      <span className="font-semibold text-[#1C1917]">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </AdminPanel>
        </div>

        <AdminPanel className="overflow-hidden">
          <div className="border-b border-[#E7E5E4] px-5 py-4">
            <CardHeader
              title="Reivindicações recentes"
              action={
                <button
                  type="button"
                  className="text-xs font-semibold text-[#C8102E] transition-colors hover:text-[#A50D26]"
                  onClick={() => navigate('pending-claims')}
                >
                  Ver todas
                </button>
              }
            />
          </div>
          {recentes.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-[#A8A29E]">
              Nenhuma reivindicação em aberto.
            </p>
          ) : (
            <div className="divide-y divide-[#E7E5E4]">
              {recentes.map(claim => (
                <div key={claim.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#F5F3F0]/60">
                  <img
                    src={claim.itemImage}
                    alt={claim.itemName}
                    className="size-10 shrink-0 rounded-xl object-cover bg-[#F5F3F0]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-[#1C1917]">{claim.itemName}</div>
                    <div className="truncate text-xs text-[#78716C]">
                      {claim.claimantName} · {claim.studentName} ({claim.room})
                    </div>
                  </div>
                  <div className="hidden shrink-0 text-xs text-[#A8A29E] sm:block">{claim.date}</div>
                  <StatusBadge status={claim.status} />
                </div>
              ))}
            </div>
          )}
        </AdminPanel>
      </div>
    </AdminLayout>
  );
}
