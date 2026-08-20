import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';
import { Package, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { AdminLayout } from './shared/AdminLayout';
import { StatusBadge } from './shared/StatusBadge';
import { claims } from './shared/data';
import type { Screen } from '../App';
import {
  MetricCard, CardHeader, CustomBarTooltip, getCatConfig, AdminPanel,
} from './shared/AdminChrome';

interface Props {
  navigate: (s: Screen) => void;
}

const monthlyData = [
  { month: 'Out', encontrados: 18, entregues: 14 },
  { month: 'Nov', encontrados: 22, entregues: 17 },
  { month: 'Dez', encontrados: 15, entregues: 13 },
  { month: 'Jan', encontrados: 28, entregues: 20 },
  { month: 'Fev', encontrados: 31, entregues: 24 },
  { month: 'Mar', encontrados: 26, entregues: 19 },
];

const categoryData = [
  { name: 'Vestuário', value: 34 },
  { name: 'Material Escolar', value: 28 },
  { name: 'Outros', value: 18 },
  { name: 'Acessórios', value: 12 },
  { name: 'Calçados', value: 8 },
].map(d => ({ ...d, color: getCatConfig(d.name).color }));

export function AdminDashboard({ navigate }: Props) {
  const recentPending = claims.filter(c => c.status === 'Pendente' || c.status === 'Em Processo');

  return (
    <AdminLayout current="admin-dashboard" navigate={navigate}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            label="Itens disponíveis"
            value="23"
            context="+4 essa semana"
            icon={<Package size={18} color="#2563EB" strokeWidth={1.8} />}
            iconBg="#DBEAFE"
            valueColor="#2563EB"
            trend="up"
          />
          <MetricCard
            label="Reivindicações pendentes"
            value="7"
            context="2 novas hoje"
            icon={<AlertCircle size={18} color="#D97706" strokeWidth={1.8} />}
            iconBg="#FEF3C7"
            valueColor="#D97706"
          />
          <MetricCard
            label="Em processo"
            value="5"
            context="3 aguardando retirada"
            icon={<Clock size={18} color="#C8102E" strokeWidth={1.8} />}
            iconBg="#FEE2E2"
            valueColor="#C8102E"
          />
          <MetricCard
            label="Entregues este mês"
            value="19"
            context="↑ 12% vs. mês passado"
            icon={<CheckCircle2 size={18} color="#059669" strokeWidth={1.8} />}
            iconBg="#D1FAE5"
            valueColor="#059669"
            trend="up"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <AdminPanel className="p-5 lg:col-span-2">
            <CardHeader title="Itens por mês" />
            <p className="-mt-3 mb-4 text-xs text-[#A8A29E]">Encontrados vs. entregues</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} barSize={18} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A8A29E' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A8A29E' }} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#F5F3F0' }} />
                <Bar dataKey="encontrados" fill="#E7E5E4" radius={[6, 6, 0, 0]} name="Encontrados" />
                <Bar dataKey="entregues" fill="#C8102E" radius={[6, 6, 0, 0]} name="Entregues" />
              </BarChart>
            </ResponsiveContainer>
          </AdminPanel>

          <AdminPanel className="p-5">
            <CardHeader title="Por categoria" />
            <p className="-mt-3 mb-2 text-xs text-[#A8A29E]">Distribuição atual</p>
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
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E7E5E4', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-2">
              {categoryData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                    <span className="text-[#78716C]">{d.name}</span>
                  </div>
                  <span className="font-semibold text-[#1C1917]">{d.value}</span>
                </div>
              ))}
            </div>
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
          <div className="divide-y divide-[#E7E5E4]">
            {recentPending.map(claim => (
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
        </AdminPanel>
      </div>
    </AdminLayout>
  );
}
