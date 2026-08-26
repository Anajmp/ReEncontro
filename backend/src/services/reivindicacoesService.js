// =====================================================================
// reivindicacoesService — regras de negócio das reivindicações.
// =====================================================================
import { reivindicacoesRepository } from "../repositories/reivindicacoesRepository.js";
import { alunosRepository } from "../repositories/alunosRepository.js";
import { enviarEmail } from "../config/email.js";
import { emailTemplates } from "../utils/emailTemplates.js";

export const reivindicacoesService = {
  // Cria uma reivindicação. Recebe os dados do formulário + (opcional) o usuário logado.
  async criar(dados, usuarioLogado) {
    // Se a pessoa está logada, vincula o user_id. Se não, fica anônima (null).
    const userId = usuarioLogado?.id ?? null;

    let alunoId = dados.aluno_id ?? null;
    let nomeAluno = dados.nome_aluno;
    let salaAluno = dados.sala_aluno;
    let periodoAluno = dados.periodo_aluno;

    // Se veio aluno_id, valida que pertence ao responsável e usa o snapshot cadastrado
    if (alunoId) {
      if (!userId) {
        throw { status: 401, mensagem: "É preciso estar logado para vincular um aluno cadastrado" };
      }
      const aluno = await alunosRepository.findByIdDoResponsavel(alunoId, userId);
      if (!aluno) {
        throw { status: 404, mensagem: "Aluno não encontrado ou não pertence a você" };
      }
      nomeAluno = aluno.nome;
      salaAluno = aluno.sala;
      periodoAluno = aluno.periodo;
    }

    const resultado = await reivindicacoesRepository.criar({
      itemId: dados.item_id,
      userId,
      alunoId,
      nomeRequerente: dados.nome_requerente,
      emailRequerente: dados.email_requerente,
      telefoneRequerente: dados.telefone_requerente,
      nomeAluno,
      salaAluno,
      periodoAluno,
    });

    // Dispara o e-mail de confirmação de forma assíncrona.
    // Não usamos await: se o envio falhar, a reivindicação continua salva.
    const template = emailTemplates.reivindicacaoCriada({
      nomeRequerente: dados.nome_requerente,
      descricaoItem: resultado.descricaoItem,
      nomeAluno,
    });

    enviarEmail({
      para: dados.email_requerente,
      assunto: template.assunto,
      html: template.html,
    }).catch((err) => {
      console.error("Falha ao enviar e-mail de confirmação:", err.message);
    });

    return {
      id: resultado.id,
      mensagem: "Reivindicação registrada! Nossa equipe entrará em contato.",
    };
  },

  async listarPendentes() {
    return reivindicacoesRepository.listarPendentes();
  },

  async aprovar(reivindicacaoId, funcionariaId) {
    const resultado = await reivindicacoesRepository.aprovar(
      reivindicacaoId,
      funcionariaId,
    );

    const template = emailTemplates.reivindicacaoAprovada({
      nomeRequerente: resultado.nomeRequerente,
      descricaoItem: resultado.descricaoItem,
      pontoColeta: resultado.pontoColeta,
    });

    enviarEmail({
      para: resultado.emailRequerente,
      assunto: template.assunto,
      html: template.html,
    }).catch((err) =>
      console.error("Falha ao enviar e-mail de aprovação:", err.message),
    );

    return resultado;
  },

  async rejeitar(reivindicacaoId, funcionariaId, motivo) {
    // Regra: motivo é obrigatório (RN-014)
    if (!motivo || motivo.trim().length < 3) {
      throw { status: 400, mensagem: "Informe o motivo da rejeição" };
    }

    const resultado = await reivindicacoesRepository.rejeitar(
      reivindicacaoId,
      funcionariaId,
      motivo.trim(),
    );

    const template = emailTemplates.reivindicacaoRejeitada({
      nomeRequerente: resultado.nomeRequerente,
      descricaoItem: resultado.descricaoItem,
      motivo: motivo.trim(),
    });

    enviarEmail({
      para: resultado.emailRequerente,
      assunto: template.assunto,
      html: template.html,
    }).catch((err) =>
      console.error("Falha ao enviar e-mail de rejeição:", err.message),
    );

    return resultado;
  },

  async confirmarEntrega(reivindicacaoId, funcionariaId) {
    return reivindicacoesRepository.confirmarEntrega(
      reivindicacaoId,
      funcionariaId,
    );
  },

  async cancelar(reivindicacaoId, funcionariaId, motivo) {
    if (!motivo || motivo.trim().length < 3) {
      throw { status: 400, mensagem: "Informe o motivo do cancelamento" };
    }

    const resultado = await reivindicacoesRepository.cancelar(
      reivindicacaoId,
      funcionariaId,
      motivo.trim(),
    );

    const template = emailTemplates.reivindicacaoCancelada({
      nomeRequerente: resultado.nomeRequerente,
      descricaoItem: resultado.descricaoItem,
      motivo: motivo.trim(),
    });

    enviarEmail({
      para: resultado.emailRequerente,
      assunto: template.assunto,
      html: template.html,
    }).catch((err) =>
      console.error("Falha ao enviar e-mail de cancelamento:", err.message),
    );

    return resultado;
  },

  async reverterEntrega(itemId, funcionariaId) {
    return reivindicacoesRepository.reverterEntrega(itemId, funcionariaId);
  },

  async listarEmProcesso() {
    return reivindicacoesRepository.listarEmProcesso();
  },

  async listarMinhas(userId) {
    return reivindicacoesRepository.listarPorUsuario(userId);
  },
};
