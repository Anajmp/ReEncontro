// =====================================================================
// itensService — regras de negócio dos itens.
// Não conhece req/res (isso é do controller) nem escreve SQL (isso é
// do repository). Aqui ficam as regras e a orquestração.
// =====================================================================
import { itensRepository } from "../repositories/itensRepository.js";
import { enviarEmail } from "../config/email.js";
import { emailTemplates } from "../utils/emailTemplates.js";

// Converte página/limite em offset e devolve a resposta paginada padrão
async function paginar({ pagina = 1, limite = 24 }, buscar) {
  const { itens, total } = await buscar((pagina - 1) * limite);
  return {
    itens,
    total,
    pagina,
    limite,
    totalPaginas: Math.ceil(total / limite),
  };
}

export const itensService = {
  // Lista uma página de itens disponíveis aplicando os filtros recebidos
  async listarDisponiveis({ pagina, limite, ...filtros } = {}) {
    return paginar({ pagina, limite }, (offset) =>
      itensRepository.findDisponiveis({ ...filtros, limite, offset }),
    );
  },

  // Busca um item; lança erro 404 se não existir
  async buscarPorId(id, { incluirInternos = false } = {}) {
    const item = await itensRepository.findById(id, { incluirInternos });
    if (!item) {
      throw { status: 404, mensagem: "Item não encontrado" };
    }
    return item;
  },

  // Cria um item com suas fotos.
  // RN-006: pelo menos uma foto é obrigatória.
  async criar(dados, fotos, cadastradoPorUserId) {
    if (!fotos || fotos.length === 0) {
      throw { status: 400, mensagem: "Pelo menos uma foto é obrigatória" };
    }

    const itemId = await itensRepository.create({
      ...dados,
      cadastradoPorUserId,
    });

    // Salva cada foto; a primeira vira a capa
    for (let i = 0; i < fotos.length; i++) {
      await itensRepository.addFoto({
        itemId,
        url: fotos[i].path, // URL devolvida pelo Cloudinary
        cloudinaryPublicId: fotos[i].filename,
        isCapa: i === 0,
        ordem: i,
      });
    }

    return itensRepository.findById(itemId, { incluirInternos: true });
  },

  async descartar(id, funcionariaId, motivo) {
    // Regra: motivo é obrigatório (RN-012)
    if (!motivo || motivo.trim().length < 3) {
      throw { status: 400, mensagem: "Informe o motivo do descarte" };
    }

    const resultado = await itensRepository.descartar(
      id,
      funcionariaId,
      motivo.trim(),
    );

    // Avisa quem tinha reivindicação pendente de que ela foi encerrada
    for (const reiv of resultado.reivindicacoesRejeitadas) {
      const template = emailTemplates.reivindicacaoRejeitada({
        nomeRequerente: reiv.nomeRequerente,
        descricaoItem: resultado.descricaoItem,
        motivo: `Item descartado: ${motivo.trim()}`,
      });
      enviarEmail({
        para: reiv.emailRequerente,
        assunto: template.assunto,
        html: template.html,
      }).catch((err) =>
        console.error("Falha ao enviar e-mail de descarte:", err.message),
      );
    }

    return {
      id,
      reivindicacoes_rejeitadas: resultado.reivindicacoesRejeitadas.length,
    };
  },

  async editar(id, dados) {
    const ok = await itensRepository.update(id, {
      nome: dados.nome,
      descricao: dados.descricao,
      categoriaId: dados.categoria_id,
      localEncontrado: dados.local_encontrado,
      pontoColetaId: dados.ponto_coleta_id,
    });
    if (!ok) {
      throw {
        status: 409,
        mensagem: "Item não pode ser editado (não existe ou já foi finalizado)",
      };
    }
    return { id };
  },

  async listarFinalizados({ status = "entregue", q, pagina, limite } = {}) {
    // só aceita esses status (proteção); "todos" junta os dois
    const statuses =
      status === "todos" ? ["entregue", "descartado"] : [status];
    if (!statuses.every((s) => ["entregue", "descartado"].includes(s))) {
      throw { status: 400, mensagem: "Status inválido" };
    }
    return paginar({ pagina, limite }, (offset) =>
      itensRepository.findFinalizados({ statuses, q, limite, offset }),
    );
  },
};
