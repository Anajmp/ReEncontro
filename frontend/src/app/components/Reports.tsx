import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts';
import { Download, Package, CheckCircle2, Trash2, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AdminLayout } from './shared/AdminLayout';
import type { Screen } from '../App';
import {
  MetricCard, CardHeader, CustomBarTooltip, AdminPanel, adminBtnOutline, adminSelectClass,
} from './shared/AdminChrome';

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
  { name: 'Entregues', value: 117, color: '#059669' },
  { name: 'Disponíveis', value: 23, color: '#2563EB' },
  { name: 'Em Processo', value: 5, color: '#C8102E' },
  { name: 'Descartados', value: 13, color: '#78716C' },
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

export function Reports({ navigate }: Props) {
  return (
    <AdminLayout current="reports" navigate={navigate}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-end gap-3">
          <Select defaultValue="6m">
            <SelectTrigger className={`w-44 ${adminSelectClass}`}>
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
          <Button variant="outline" size="sm" className={`gap-2 ${adminBtnOutline}`}>
            <Download className="size-4" />
            Exportar PDF
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            label="Total de itens (período)"
            value="154"
            context="+12% vs. período anterior"
            icon={<Package size={18} color="#78716C" strokeWidth={1.8} />}
            iconBg="#F5F5F4"
            valueColor="#1C1917"
            trend="up"
          />
          <MetricCard
            label="Total entregues"
            value="117"
            context="76% do total"
            icon={<CheckCircle2 size={18} color="#059669" strokeWidth={1.8} />}
            iconBg="#D1FAE5"
            valueColor="#059669"
          />
          <MetricCard
            label="Taxa de devolução"
            value="76%"
            context="+3pp vs. período anterior"
            icon={<TrendingUp size={18} color="#2563EB" strokeWidth={1.8} />}
            iconBg="#DBEAFE"
            valueColor="#2563EB"
            trend="up"
          />
          <MetricCard
            label="Descartados"
            value="13"
            context="8,4% do total"
            icon={<Trash2 size={18} color="#78716C" strokeWidth={1.8} />}
            iconBg="#F5F5F4"
            valueColor="#78716C"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <AdminPanel className="p-5 lg:col-span-2">
            <CardHeader title="Itens por mês" />
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData} barSize={12} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A8A29E' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A8A29E' }} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#F5F3F0' }} />
                <Bar dataKey="encontrados" fill="#E7E5E4" radius={[4, 4, 0, 0]} name="Encontrados" />
                <Bar dataKey="entregues" fill="#C8102E" radius={[4, 4, 0, 0]} name="Entregues" />
                <Bar dataKey="descartados" fill="#78716C" radius={[4, 4, 0, 0]} name="Descartados" />
              </BarChart>
            </ResponsiveContainer>
          </AdminPanel>

          <AdminPanel className="p-5">
            <CardHeader title="Distribuição por status" />
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
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E7E5E4', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-2">
              {statusData.map(d => (
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

        <AdminPanel className="p-5">
          <CardHeader title="Taxa de devolução mensal (%)" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={returnRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A8A29E' }} />
              <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A8A29E' }} unit="%" />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #E7E5E4', fontSize: 12 }}
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
        </AdminPanel>
      </div>
    </AdminLayout>
  );
}
