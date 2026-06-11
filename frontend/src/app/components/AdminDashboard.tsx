import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Package, AlertCircle, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { AdminLayout } from './shared/AdminLayout';
import { StatusBadge } from './shared/StatusBadge';
import { claims } from './shared/data';
import type { Screen } from '../App';

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
  { name: 'Vestuário', value: 34, color: '#C8102E' },
  { name: 'Material Escolar', value: 28, color: '#2563EB' },
  { name: 'Outros', value: 18, color: '#6B7280' },
  { name: 'Acessórios', value: 12, color: '#D97706' },
  { name: 'Calçados', value: 8, color: '#16A34A' },
];

const kpis = [
  { label: 'Itens disponíveis', value: '23', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', delta: '+4 essa semana' },
  { label: 'Reivindicações pendentes', value: '7', icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', delta: '2 novas hoje' },
  { label: 'Em processo', value: '5', icon: Clock, color: 'text-[#C8102E]', bg: 'bg-red-50', delta: '3 aguardando retirada' },
  { label: 'Entregues este mês', value: '19', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', delta: '↑ 12% vs. mês passado' },
];

export function AdminDashboard({ navigate }: Props) {
  const recentPending = claims.filter(c => c.status === 'Pendente' || c.status === 'Em Processo');

  return (
    <AdminLayout current="admin-dashboard" navigate={navigate}>
      <div className="p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Visão geral do sistema — março 2024</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map(({ label, value, icon: Icon, color, bg, delta }) => (
            <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{label}</span>
                <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
                  <Icon className={`size-4 ${color}`} />
                </div>
              </div>
              <div className={`text-2xl font-semibold ${color}`}>{value}</div>
              <div className="text-xs text-gray-400 mt-1">{delta}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Bar chart */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-900">Itens por mês</h3>
                <p className="text-xs text-gray-400 mt-0.5">Encontrados vs. entregues</p>
              </div>
              <TrendingUp className="size-4 text-gray-300" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barSize={16}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                  cursor={{ fill: '#F9FAFB' }}
                />
                <Bar dataKey="encontrados" fill="#E5E7EB" radius={[4, 4, 0, 0]} name="Encontrados" />
                <Bar dataKey="entregues" fill="#C8102E" radius={[4, 4, 0, 0]} name="Entregues" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="mb-4">
              <h3 className="text-gray-900">Por categoria</h3>
              <p className="text-xs text-gray-400 mt-0.5">Distribuição atual</p>
            </div>
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
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {categoryData.slice(0, 3).map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                    <span className="text-gray-600">{d.name}</span>
                  </div>
                  <span className="text-gray-400">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent pending */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-gray-900">Reivindicações recentes</h3>
            <button
              className="text-xs text-[#C8102E] hover:underline font-medium"
              onClick={() => navigate('pending-claims')}
            >
              Ver todas
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentPending.map(claim => (
              <div key={claim.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <img
                  src={claim.itemImage}
                  alt={claim.itemName}
                  className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{claim.itemName}</div>
                  <div className="text-xs text-gray-500">
                    {claim.claimantName} · {claim.studentName} ({claim.room})
                  </div>
                </div>
                <div className="text-xs text-gray-400 hidden sm:block shrink-0">{claim.date}</div>
                <StatusBadge status={claim.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
