import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { Download, TrendingUp, Package, CheckCircle2, Trash2, ArrowUpRight } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AdminLayout } from './shared/AdminLayout';
import type { Screen } from '../App';

interface Props {
  navigate: (s: Screen) => void;
}

const monthlyData = [
  { month: 'Set', encontrados: 14, entregues: 10, descartados: 2 },
  { month: 'Out', encontrados: 18, entregues: 14, descartados: 1 },
  { month: 'Nov', encontrados: 22, entregues: 17, descartados: 3 },
  { month: 'Dez', encontrados: 15, entregues: 13, descartados: 0 },
  { month: 'Jan', encontrados: 28, entregues: 20, descartados: 4 },
  { month: 'Fev', encontrados: 31, entregues: 24, descartados: 2 },
  { month: 'Mar', encontrados: 26, entregues: 19, descartados: 1 },
];

const statusData = [
  { name: 'Entregues', value: 117, color: '#16A34A' },
  { name: 'Disponíveis', value: 23, color: '#2563EB' },
  { name: 'Em Processo', value: 5, color: '#C8102E' },
  { name: 'Descartados', value: 13, color: '#6B7280' },
];

const returnRateData = [
  { month: 'Set', taxa: 71 },
  { month: 'Out', taxa: 78 },
  { month: 'Nov', taxa: 77 },
  { month: 'Dez', taxa: 87 },
  { month: 'Jan', taxa: 71 },
  { month: 'Fev', taxa: 77 },
  { month: 'Mar', taxa: 73 },
];

const kpis = [
  { label: 'Total de itens (período)', value: '154', icon: Package, color: 'text-gray-700', bg: 'bg-gray-100', delta: '+12% vs. período anterior' },
  { label: 'Total entregues', value: '117', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', delta: '76% do total' },
  { label: 'Taxa de devolução', value: '76%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', delta: '+3pp vs. período anterior' },
  { label: 'Descartados', value: '13', icon: Trash2, color: 'text-gray-500', bg: 'bg-gray-100', delta: '8,4% do total' },
];

export function Reports({ navigate }: Props) {
  return (
    <AdminLayout current="reports" navigate={navigate}>
      <div className="p-6 max-w-6xl">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-gray-900">Relatórios</h1>
            <p className="text-sm text-gray-500 mt-1">Análise de desempenho do sistema de achados e perdidos.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Select defaultValue="6m">
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Último mês</SelectItem>
                <SelectItem value="3m">Últimos 3 meses</SelectItem>
                <SelectItem value="6m">Últimos 6 meses</SelectItem>
                <SelectItem value="1y">Último ano</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="size-4" />
              Exportar PDF
            </Button>
          </div>
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
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="size-3 text-green-500" />
                <span className="text-xs text-gray-400">{delta}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Bar chart */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-gray-900 mb-4">Itens por mês</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} barSize={12}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} cursor={{ fill: '#F9FAFB' }} />
                <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Bar dataKey="encontrados" fill="#E5E7EB" radius={[3, 3, 0, 0]} name="Encontrados" />
                <Bar dataKey="entregues" fill="#C8102E" radius={[3, 3, 0, 0]} name="Entregues" />
                <Bar dataKey="descartados" fill="#6B7280" radius={[3, 3, 0, 0]} name="Descartados" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-gray-900 mb-4">Distribuição por status</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {statusData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                    <span className="text-gray-600">{d.name}</span>
                  </div>
                  <span className="text-gray-400">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Line chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-gray-900 mb-4">Taxa de devolução mensal (%)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={returnRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F5" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
              <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} unit="%" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                formatter={(v: number) => [`${v}%`, 'Taxa de devolução']}
              />
              <Line
                type="monotone"
                dataKey="taxa"
                stroke="#C8102E"
                strokeWidth={2}
                dot={{ fill: '#C8102E', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}
