import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';
import { Package, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { AdminLayout } from './shared/AdminLayout';
import { StatusBadge } from './shared/StatusBadge';
import type { Screen } from '../App';
import type { Status } from './shared/data';
import {
  MetricCard, CardHeader, CustomBarTooltip, AdminPanel, TabelaDoGrafico,
} from './shared/AdminChrome';
import { getCatConfig } from './shared/categorias';
import { relatoriosApi } from '../../lib/api';
import { ESTILO_TOOLTIP_GRAFICO, useCoresGrafico } from '../../lib/tema';

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

// Formato devolvido por relatoriosApi.dashboard() (GET /api/relatorios/dashboard),
// só com os campos usados nesta tela
interface ReivindicacaoRecente {
  id: number;
  itemName: string;
  itemImage: string;
  claimantName: string;
  studentName: string;
  room: string;
  date: string;
  status: Status;
}

interface DadosDashboard {
  itens_disponiveis: number;
  disponiveis_semana: number;
  pendentes: number;
  pendentes_hoje: number;
  em_processo: number;
  em_processo_prazo: number;
  entregues_mes: number;
  entregues_mes_anterior: number;
  variacao_entregues: number | null;
  por_mes: { mes: string; encontrados: number; devolvidos: number }[];
  por_categoria: { categoria: string; total: number }[];
  reivindicacoes_recentes: ReivindicacaoRecente[];
}

export function AdminDashboard({ navigate }: Props) {
  const [dados, setDados] = useState<DadosDashboard | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const cores = useCoresGrafico();

  useEffect(() => {
    relatoriosApi.dashboard()
      .then(setDados)
      .catch(err => setErro(err.message || 'Erro ao carregar o dashboard'))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando || erro || !dados) {
    return (
      <AdminLayout current="admin-dashboard" navigate={navigate}>
        <div className="mx-auto max-w-6xl">
          <AdminPanel className={`py-16 text-center text-sm ${erro ? 'text-marca-texto' : 'text-tinta-suave'}`}>
            <span role={erro ? 'alert' : 'status'}>{erro || 'Carregando dashboard...'}</span>
          </AdminPanel>
        </div>
      </AdminLayout>
    );
  }

  const monthlyData = dados.por_mes.map(m => ({
    month: nomeMes(m.mes),
    encontrados: m.encontrados,
    entregues: m.devolvidos,
  }));

  const categoryData = dados.por_categoria.map(c => ({
    name: c.categoria,
    value: c.total,
    color: getCatConfig(c.categoria).color,
  }));

  const recentes: ReivindicacaoRecente[] = dados.reivindicacoes_recentes;
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
            valueColor="var(--re-marca-texto)"
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
            <p className="-mt-3 mb-4 text-xs text-tinta-suave">Encontrados vs. entregues — últimos 6 meses</p>
            <TabelaDoGrafico
              titulo="Itens por mês: encontrados e entregues"
              colunas={[
                { chave: 'month', rotulo: 'Mês' },
                { chave: 'encontrados', rotulo: 'Encontrados' },
                { chave: 'entregues', rotulo: 'Entregues' },
              ]}
              linhas={monthlyData}
            />
            <div aria-hidden>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} barSize={18} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={cores.grade} vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: cores.eixo }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: cores.eixo }} allowDecimals={false} width={32} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: cores.cursor }} />
                <Bar dataKey="encontrados" fill={cores.barraNeutra} radius={[6, 6, 0, 0]} name="Encontrados" />
                <Bar dataKey="entregues" fill="#C8102E" radius={[6, 6, 0, 0]} name="Entregues" />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </AdminPanel>

          <AdminPanel className="p-5">
            <CardHeader title="Por categoria" />
            <p className="-mt-3 mb-2 text-xs text-tinta-suave">Itens ainda não finalizados</p>
            {categoryData.length === 0 ? (
              <p className="py-16 text-center text-sm text-tinta-suave">Nenhum item em aberto.</p>
            ) : (
              <>
                <div aria-hidden>
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
                    <Tooltip contentStyle={ESTILO_TOOLTIP_GRAFICO} />
                  </PieChart>
                </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-2">
                  {categoryData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="size-2.5 rounded-sm" style={{ backgroundColor: d.color }} aria-hidden />
                        <span className="text-tinta-suave">{d.name}</span>
                      </div>
                      <span className="font-semibold text-tinta">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </AdminPanel>
        </div>

        <AdminPanel className="overflow-hidden">
          <div className="border-b border-linha px-5 py-4">
            <CardHeader
              title="Reivindicações recentes"
              action={
                <button
                  type="button"
                  className="text-xs font-semibold text-marca-texto transition-colors hover:text-marca-texto"
                  onClick={() => navigate('pending-claims')}
                  aria-label="Ver todas as reivindicações pendentes"
                >
                  Ver todas
                </button>
              }
            />
          </div>
          {recentes.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-tinta-suave">
              Nenhuma reivindicação em aberto.
            </p>
          ) : (
            <div className="divide-y divide-linha">
              {recentes.map(claim => (
                <div key={claim.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-fundo/60">
                  <img
                    src={claim.itemImage}
                    alt={claim.itemName}
                    className="size-10 shrink-0 rounded-xl object-cover bg-fundo"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-tinta">{claim.itemName}</h3>
                    <div className="truncate text-xs text-tinta-suave">
                      {claim.claimantName} · {claim.studentName} ({claim.room})
                    </div>
                  </div>
                  <div className="hidden shrink-0 text-xs text-tinta-suave sm:block">{claim.date}</div>
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
