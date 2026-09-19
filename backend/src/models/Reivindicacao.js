// =====================================================================
// Reivindicacao — entidade de domínio.
//
// Guarda o snapshot imutável dos dados informados pelo requerente
// (RN-018) e as regras de transição de status do fluxo de devolução.
// =====================================================================

/** Prazo para o responsável retirar o item após a aprovação (RN-013). */
const DIAS_PARA_RETIRADA = 7;

export class Reivindicacao {
  #id;
  #itemId;
  #userId;
  #alunoId;
  #nomeRequerente;
  #emailRequerente;
  #telefoneRequerente;
  #nomeAluno;
  #salaAluno;
  #periodoAluno;
  #status;
  #processadoPorUserId;
  #dataAprovacao;
  #motivoRejeicao;
  #criadaEm;

  constructor(dados) {
    this.#id = dados.id;
    this.#itemId = dados.item_id;
    this.#userId = dados.user_id ?? null;
    this.#alunoId = dados.aluno_id ?? null;
    this.#nomeRequerente = dados.nome_requerente;
    this.#emailRequerente = dados.email_requerente;
    this.#telefoneRequerente = dados.telefone_requerente ?? null;
    this.#nomeAluno = dados.nome_aluno;
    this.#salaAluno = dados.sala_aluno;
    this.#periodoAluno = dados.periodo_aluno;
    this.#status = dados.status;
    this.#processadoPorUserId = dados.processado_por_user_id ?? null;
    this.#dataAprovacao = dados.data_aprovacao ?? null;
    this.#motivoRejeicao = dados.motivo_rejeicao ?? null;
    this.#criadaEm = dados.created_at ?? null;
  }

  // ─────────────── Getters ───────────────
  get id() { return this.#id; }
  get itemId() { return this.#itemId; }
  get status() { return this.#status; }
  get nomeRequerente() { return this.#nomeRequerente; }
  get emailRequerente() { return this.#emailRequerente; }
  get motivoRejeicao() { return this.#motivoRejeicao; }

  // ─────────────── Regras de domínio ───────────────

  /** Reivindicação anônima: feita sem login (user_id nulo). */
  ehAnonima() {
    return this.#userId === null;
  }

  /**
   * Bloqueia novas reivindicações para o mesmo item (RN-002).
   * Consideram-se ativas as pendentes e as já aprovadas.
   */
  estaAtiva() {
    return this.#status === 'pendente' || this.#status === 'aprovada';
  }

  /** Só é possível aprovar ou rejeitar o que está pendente. */
  podeSerProcessada() {
    return this.#status === 'pendente';
  }

  /** Cancelamento vale para o que ainda está em andamento. */
  podeSerCancelada() {
    return this.estaAtiva();
  }

  /** A entrega exige que a reivindicação já tenha sido aprovada. */
  podeSerEntregue() {
    return this.#status === 'aprovada';
  }

  /** Dias decorridos desde a aprovação. */
  diasDesdeAprovacao() {
    if (!this.#dataAprovacao) return 0;
    const diff = Date.now() - new Date(this.#dataAprovacao).getTime();
    return Math.floor(diff / 86400000);
  }

  /** Requerente não compareceu dentro do prazo previsto (RN-013). */
  prazoRetiradaExpirou() {
    return this.#status === 'aprovada'
      && this.diasDesdeAprovacao() > DIAS_PARA_RETIRADA;
  }

  /** Dados do aluno como informados no momento da solicitação. */
  descricaoAluno() {
    return `${this.#nomeAluno} · ${this.#salaAluno} · ${this.#periodoAluno}`;
  }

  /** Representação para envio ao cliente (campos em snake_case). */
  paraResposta() {
    return {
      id: this.#id,
      item_id: this.#itemId,
      status: this.#status,
      nome_requerente: this.#nomeRequerente,
      email_requerente: this.#emailRequerente,
      telefone_requerente: this.#telefoneRequerente,
      nome_aluno: this.#nomeAluno,
      sala_aluno: this.#salaAluno,
      periodo_aluno: this.#periodoAluno,
      data_aprovacao: this.#dataAprovacao,
      motivo_rejeicao: this.#motivoRejeicao,
      created_at: this.#criadaEm,
    };
  }
}
