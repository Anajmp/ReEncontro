// =====================================================================
// Item — entidade de domínio.
//
// Concentra as regras que dependem do estado do objeto encontrado:
// se está disponível, se ainda pode ser editado e há quantos dias
// está em guarda (RN-012).
// =====================================================================

/** Prazo máximo de guarda antes de o item virar candidato a descarte. */
const DIAS_LIMITE_GUARDA = 90;

export class Item {
  #id;
  #nome;
  #descricao;
  #categoriaId;
  #localEncontrado;
  #pontoColetaId;
  #dataEncontrado;
  #dataDisponibilizacao;
  #status;
  #cadastradoPorUserId;
  #finalizadoPorUserId;
  #finalizadoEm;
  #motivoDescarte;

  constructor(dados) {
    this.#id = dados.id;
    this.#nome = dados.nome ?? dados.descricao;
    this.#descricao = dados.descricao;
    this.#categoriaId = dados.categoria_id;
    this.#localEncontrado = dados.local_encontrado;
    this.#pontoColetaId = dados.ponto_coleta_id;
    this.#dataEncontrado = dados.data_encontrado;
    this.#dataDisponibilizacao = dados.data_disponibilizacao;
    this.#status = dados.status;
    this.#cadastradoPorUserId = dados.cadastrado_por_user_id;
    this.#finalizadoPorUserId = dados.finalizado_por_user_id ?? null;
    this.#finalizadoEm = dados.finalizado_em ?? null;
    this.#motivoDescarte = dados.motivo_descarte ?? null;
  }

  // ─────────────── Getters ───────────────
  get id() { return this.#id; }
  get nome() { return this.#nome; }
  get descricao() { return this.#descricao; }
  get status() { return this.#status; }
  get localEncontrado() { return this.#localEncontrado; }
  get finalizadoEm() { return this.#finalizadoEm; }

  // ─────────────── Regras de domínio ───────────────

  /** Item publicado e ainda sem reivindicação ativa. */
  estaDisponivel() {
    return this.#status === 'disponivel';
  }

  /** Item já encerrado: entregue ao dono ou descartado. */
  estaFinalizado() {
    return this.#status === 'entregue' || this.#status === 'descartado';
  }

  /** A edição é bloqueada depois que o item é finalizado (RN-005). */
  podeSerEditado() {
    return !this.estaFinalizado();
  }

  /** Só faz sentido descartar o que ainda não foi entregue. */
  podeSerDescartado() {
    return this.#status === 'disponivel' || this.#status === 'pendente';
  }

  /** Quantos dias o item está em guarda desde a disponibilização. */
  diasEmGuarda() {
    const referencia = this.#dataDisponibilizacao ?? this.#dataEncontrado;
    if (!referencia) return 0;
    const diff = Date.now() - new Date(referencia).getTime();
    return Math.floor(diff / 86400000);   // 1000 * 60 * 60 * 24
  }

  /** Candidato a descarte por exceder o prazo de guarda (RN-012). */
  excedeuPrazoGuarda() {
    return this.estaDisponivel() && this.diasEmGuarda() > DIAS_LIMITE_GUARDA;
  }

  /**
   * Entrega revertível apenas dentro da janela de 24 horas (RN-015).
   */
  dentroJanelaReversao() {
    if (this.#status !== 'entregue' || !this.#finalizadoEm) return false;
    const horas = (Date.now() - new Date(this.#finalizadoEm).getTime()) / 3600000;
    return horas <= 24;
  }

  /** Representação para envio ao cliente (campos em snake_case). */
  paraResposta() {
    return {
      id: this.#id,
      nome: this.#nome,
      descricao: this.#descricao,
      local_encontrado: this.#localEncontrado,
      data_encontrado: this.#dataEncontrado,
      status: this.#status,
      dias_em_guarda: this.diasEmGuarda(),
      excede_prazo_guarda: this.excedeuPrazoGuarda(),
      finalizado_em: this.#finalizadoEm,
      motivo_descarte: this.#motivoDescarte,
    };
  }
}
