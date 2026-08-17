// =====================================================================
// reivindicacoesService — regras de negócio das reivindicações.
// =====================================================================
import { reivindicacoesRepository } from "../repositories/reivindicacoesRepository.js";

export const reivindicacoesService = {
  // Cria uma reivindicação. Recebe os dados do formulário + (opcional) o usuário logado.
  async criar(dados, usuarioLogado) {
    // Se a pessoa está logada, vincula o user_id. Se não, fica anônima (null).
    const userId = usuarioLogado?.id ?? null;

    const reivindicacaoId = await reivindicacoesRepository.criar({
      itemId: dados.item_id,
      userId,
      alunoId: dados.aluno_id ?? null,
      nomeRequerente: dados.nome_requerente,
      emailRequerente: dados.email_requerente,
      telefoneRequerente: dados.telefone_requerente,
      nomeAluno: dados.nome_aluno,
      salaAluno: dados.sala_aluno,
      periodoAluno: dados.periodo_aluno,
    });

    // TODO (depois): disparar e-mail de confirmação pro requerente

    return {
      id: reivindicacaoId,
      mensagem: "Reivindicação registrada! Nossa equipe entrará em contato.",
    };
  },

  async listarPendentes() {
    return reivindicacoesRepository.listarPendentes();
  },

  async aprovar(reivindicacaoId, funcionariaId) {
    return reivindicacoesRepository.aprovar(reivindicacaoId, funcionariaId);
  },

  async rejeitar(reivindicacaoId, funcionariaId, motivo) {
    // Regra: motivo é obrigatório (RN-014)
    if (!motivo || motivo.trim().length < 3) {
      throw { status: 400, mensagem: "Informe o motivo da rejeição" };
    }
    return reivindicacoesRepository.rejeitar(
      reivindicacaoId,
      funcionariaId,
      motivo.trim(),
    );
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
    return reivindicacoesRepository.cancelar(
      reivindicacaoId,
      funcionariaId,
      motivo.trim(),
    );
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
