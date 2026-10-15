// =====================================================================
// Aluno — entidade de domínio.
//
// Representa um aluno vinculado a uma conta de responsável. A regra de
// posse (pertenceA) é o que sustenta o isolamento entre contas: um
// responsável nunca acessa os alunos de outro.
// =====================================================================

const PERIODOS = {
  manha: 'Manhã',
  tarde: 'Tarde',
  integral: 'Integral',
};

export class Aluno {
  #id;
  #responsavelId;
  #nome;
  #sala;
  #periodo;
  #anoLetivo;
  #ativo;

  constructor(dados) {
    this.#id = dados.id;
    this.#responsavelId = dados.responsavel_id;
    this.#nome = dados.nome;
    this.#sala = dados.sala;
    this.#periodo = dados.periodo;
    this.#anoLetivo = dados.ano_letivo;
    this.#ativo = Boolean(dados.ativo);
  }

  // ─────────────── Getters ───────────────
  get id() { return this.#id; }
  get nome() { return this.#nome; }
  get sala() { return this.#sala; }
  get periodo() { return this.#periodo; }
  get anoLetivo() { return this.#anoLetivo; }
  get ativo() { return this.#ativo; }

  // ─────────────── Regras de domínio ───────────────

  /**
   * Verifica se o aluno pertence ao responsável informado.
   * Base do isolamento entre contas.
   */
  pertenceA(userId) {
    return Number(this.#responsavelId) === Number(userId);
  }

  /** Período por extenso, para exibição. */
  periodoPorExtenso() {
    return PERIODOS[this.#periodo] ?? this.#periodo;
  }

  /** Identificação usada pela funcionária na conferência da ficha física. */
  descricaoCompleta() {
    return `${this.#nome} · ${this.#sala} · ${this.periodoPorExtenso()}`;
  }

  /** Aluno do ano letivo corrente. */
  ehDoAnoAtual() {
    return this.#anoLetivo === new Date().getFullYear();
  }

  /** Representação para envio ao cliente. */
  paraResposta() {
    return {
      id: this.#id,
      nome: this.#nome,
      sala: this.#sala,
      periodo: this.#periodo,
      ano_letivo: this.#anoLetivo,
    };
  }
}
