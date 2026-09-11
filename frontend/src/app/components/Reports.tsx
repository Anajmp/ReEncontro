import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';
import { Package, CheckCircle2, Trash2, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AdminLayout } from './shared/AdminLayout';
import type { Screen } from '../App';
import {
  MetricCard, CardHeader, CustomBarTooltip, AdminPanel, adminSelectClass,
} from './shared/AdminChrome';
import { relatoriosApi } from '../../lib/api';

interface Props {
  navigate: (s: Screen) => void;
}

// Cores e rótulos de cada status
const STATUS_INFO: Record<string, { nome: string; cor: string }> = {
  entregue:    { nome: 'Entregues',   cor: '#059669' },
  disponivel:  { nome: 'Disponíveis', cor: '#2563EB' },
  pendente:    { nome: 'Pendentes',   cor: '#B45309' },
  em_processo: { nome: 'Em Processo', cor: '#C8102E' },
  descartado:  { nome: 'Descartados', cor: '#78716C' },
};

// Converte "2026-09" em "Set/26"
function formatarMes(mes: string): string {
  const [ano, m] = mes.split('-');
  const nomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${nomes[Number(m) - 1]}/${ano.slice(2)}`;
}

export function Reports({ navigate }: Props) {
  const [dias, setDias] = useState('30');
  const [dados, setDados] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setCarregando(true);
    relatoriosApi.gerar(Number(dias))
      .then(setDados)
      .catch(err => console.error('Erro ao carregar relatórios:', err))
      .finally(() => setCarregando(false));
  }, [dias]);

  // Prepara os dados para os gráficos
  const dadosMensais = (dados?.por_mes ?? []).map((m: any) => ({
    month: formatarMes(m.mes),
    encontrados: m.encontrados,
    entregues: m.devolvidos,
    descartados: m.descartados,
  }));

  const dadosStatus = (dados?.por_status ?? []).map((s: any) => ({
    name: STATUS_INFO[s.status]?.nome ?? s.status,
    value: s.total,
    color: STATUS_INFO[s.status]?.cor ?? '#A8A29E',
  }));

  const total = dados?.total_cadastrados ?? 0;
  const entregues = dados?.total_entregues ?? 0;
  const descartados = dados?.total_descartados ?? 0;
  const taxa = dados?.taxa_devolucao ?? 0;

  const pct = (parte: number) =>
    total > 0 ? `${Math.round((parte / total) * 100)}% do total` : '—';

  return (
    <AdminLayout current="reports" navigate={navigate}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-end gap-3">
          <Select value={dias} onValueChange={setDias}>
            <SelectTrigger className={`w-44 ${adminSelectClass}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {carregando ? (
          <AdminPanel className="py-16 text-center text-sm text-[#A8A29E]">
            Carregando relatórios...
          </AdminPanel>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <MetricCard
                label="Total de itens (período)"
                value={String(total)}
                context={`Últimos ${dias} dias`}
                icon={<Package size={18} color="#78716C" strokeWidth={1.8} />}
                iconBg="#F5F5F4"
                valueColor="#1C1917"
              />
              <MetricCard
                label="Total entregues"
                value={String(entregues)}
                context={pct(entregues)}
                icon={<CheckCircle2 size={18} color="#059669" strokeWidth={1.8} />}
                iconBg="#D1FAE5"
                valueColor="#059669"
              />
              <MetricCard
                label="Taxa de devolução"
                value={`${taxa}%`}
                context="Entregues sobre o total"
                icon={<TrendingUp size={18} color="#2563EB" strokeWidth={1.8} />}
                iconBg="#DBEAFE"
                valueColor="#2563EB"
              />
              <MetricCard
                label="Descartados"
                value={String(descartados)}
                context={pct(descartados)}
                icon={<Trash2 size={18} color="#78716C" strokeWidth={1.8} />}
                iconBg="#F5F5F4"
                valueColor="#78716C"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <AdminPanel className="p-5 lg:col-span-2">
                <CardHeader title="Itens por mês" />
                {dadosMensais.length === 0 ? (
                  <p className="py-16 text-center text-sm text-[#A8A29E]">
                    Nenhum item cadastrado neste período.
                  </p>
                ) : (
                  <div className="h-52 w-full sm:h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosMensais} barSize={12} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#A8A29E' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#A8A29E' }} allowDecimals={false} width={32} />
                      <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#F5F3F0' }} />
                      <Bar dataKey="encontrados" fill="#E7E5E4" radius={[4, 4, 0, 0]} name="Encontrados" />
                      <Bar dataKey="entregues" fill="#C8102E" radius={[4, 4, 0, 0]} name="Devolvidos" />
                      <Bar dataKey="descartados" fill="#78716C" radius={[4, 4, 0, 0]} name="Descartados" />
                    </BarChart>
                  </ResponsiveContainer>
                  </div>
                )}
              </AdminPanel>

              <AdminPanel className="p-5">
                <CardHeader title="Distribuição por status" />
                {dadosStatus.length === 0 ? (
                  <p className="py-16 text-center text-sm text-[#A8A29E]">Sem dados.</p>
                ) : (
                  <>
                    <div className="mx-auto h-44 w-full max-w-[220px] sm:h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dadosStatus}
                          cx="50%" cy="50%"
                          innerRadius={36} outerRadius={58}
                          paddingAngle={3} dataKey="value"
                        >
                          {dadosStatus.map((entry: any, i: number) => (
                            <Cell key={`cell-${i}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E7E5E4', fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    </div>
                    <div className="mt-3 space-y-2">
                      {dadosStatus.map((d: any) => (
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
          </>
        )}
      </div>
    </AdminLayout>
  );
}