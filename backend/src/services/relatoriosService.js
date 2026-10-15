// =====================================================================
// relatoriosService — regras de negócio dos relatórios e do dashboard.
// Monta os números a partir das consultas agregadas do repository.
// =====================================================================
import { relatoriosRepository } from "../repositories/relatoriosRepository.js";

const PERIODOS_PERMITIDOS = [7, 30, 90, 180, 365];
const MESES_DASHBOARD = 6;

// O MySQL devolve SUM() como string (DECIMAL); garante número
const num = (v) => Number(v) || 0;

// Lista de meses "AAAA-MM" de `inicio` até hoje, em ordem
function listarMeses(inicio) {
  const meses = [];
  const atual = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
  const hoje = new Date();
  while (
    atual.getFullYear() < hoje.getFullYear() ||
    (atual.getFullYear() === hoje.getFullYear() && atual.getMonth() <= hoje.getMonth())
  ) {
    meses.push(`${atual.getFullYear()}-${String(atual.getMonth() + 1).padStart(2, "0")}`);
    atual.setMonth(atual.getMonth() + 1);
  }
  return meses;
}

// Junta encontrados e finalizados num único array mês a mês (meses vazios = 0)
async function montarSerieMensal(dias) {
  const [encontrados, finalizados] = await Promise.all([
    relatoriosRepository.encontradosPorMes(dias),
    relatoriosRepository.finalizadosPorMes(dias),
  ]);

  const inicio = new Date();
  inicio.setDate(inicio.getDate() - dias);

  return listarMeses(inicio).map((mes) => {
    const e = encontrados.find((r) => r.mes === mes);
    const f = finalizados.find((r) => r.mes === mes);
    return {
      mes,
      encontrados: num(e?.total),
      devolvidos: num(f?.entregues),
      descartados: num(f?.descartados),
    };
  });
}

export const relatoriosService = {
  // Relatório do período (GET /api/relatorios?dias=30)
  async gerar(diasParam) {
    const dias = Number(diasParam) || 30;
    if (!PERIODOS_PERMITIDOS.includes(dias)) {
      throw {
        status: 400,
        mensagem: `Período inválido. Use: ${PERIODOS_PERMITIDOS.join(", ")} dias`,
      };
    }

    const [resumo, porStatus, porMes, porCategoria] = await Promise.all([
      relatoriosRepository.resumo(dias),
      relatoriosRepository.porStatus(),
      montarSerieMensal(dias),
      relatoriosRepository.porCategoriaNoPeriodo(dias),
    ]);

    const totalEntregues = num(resumo.total_entregues);
    const totalDescartados = num(resumo.total_descartados);
    const totalFinalizados = totalEntregues + totalDescartados;

    return {
      dias,
      total_cadastrados: num(resumo.total_cadastrados),
      total_entregues: totalEntregues,
      total_descartados: totalDescartados,
      // Dos itens que saíram do sistema no período, quantos voltaram ao dono
      taxa_devolucao:
        totalFinalizados > 0 ? Math.round((totalEntregues / totalFinalizados) * 100) : 0,
      por_status: porStatus.map((s) => ({ status: s.status, total: num(s.total) })),
      por_mes: porMes,
      por_categoria: porCategoria.map((c) => ({ categoria: c.categoria, total: num(c.total) })),
    };
  },

  // Dados do dashboard administrativo (GET /api/relatorios/dashboard)
  async dashboard() {
    const diasSerie = new Date().getDate() + 31 * (MESES_DASHBOARD - 1);

    const [contadores, porMes, categorias, recentes] = await Promise.all([
      relatoriosRepository.contadoresDashboard(),
      montarSerieMensal(diasSerie),
      relatoriosRepository.categoriasAtuais(),
      relatoriosRepository.reivindicacoesRecentes(5),
    ]);

    const entreguesMes = num(contadores.entregues_mes);
    const entreguesMesAnterior = num(contadores.entregues_mes_anterior);

    return {
      itens_disponiveis: num(contadores.itens_disponiveis),
      disponiveis_semana: num(contadores.disponiveis_semana),
      pendentes: num(contadores.pendentes),
      pendentes_hoje: num(contadores.pendentes_hoje),
      em_processo: num(contadores.em_processo),
      em_processo_prazo: num(contadores.em_processo_prazo),
      entregues_mes: entreguesMes,
      entregues_mes_anterior: entreguesMesAnterior,
      // null quando não há base de comparação (mês anterior zerado)
      variacao_entregues:
        entreguesMesAnterior > 0
          ? Math.round(((entreguesMes - entreguesMesAnterior) / entreguesMesAnterior) * 100)
          : null,
      por_mes: porMes.slice(-MESES_DASHBOARD),
      por_categoria: categorias.map((c) => ({ categoria: c.categoria, total: num(c.total) })),
      reivindicacoes_recentes: recentes,
    };
  },
};
