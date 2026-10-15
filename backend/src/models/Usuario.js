// =====================================================================
// Usuario — entidade de domínio.
//
// Encapsula os dados de uma conta e as regras que dependem apenas dela:
// verificação de senha e permissões por perfil. Os atributos são privados
// (#) e expostos por getters, garantindo que não sejam alterados por
// engano fora da classe.
// =====================================================================
import bcrypt from 'bcrypt';

export class Usuario {
  #id;
  #nome;
  #email;
  #googleId;
  #senhaHash;
  #telefone;
  #avatarSeed;
  #role;
  #isDiretora;
  #ativo;
  #cadastroCompleto;
  #ultimoLoginEm;

  /**
   * @param {object} dados Linha vinda do banco (snake_case).
   */
  constructor(dados) {
    this.#id = dados.id;
    this.#nome = dados.nome;
    this.#email = dados.email;
    this.#googleId = dados.google_id ?? null;
    this.#senhaHash = dados.senha_hash ?? null;
    this.#telefone = dados.telefone ?? null;
    this.#avatarSeed = dados.avatar_seed ?? null;
    this.#role = dados.role;
    this.#isDiretora = Boolean(dados.is_diretora);
    this.#ativo = Boolean(dados.ativo);
    this.#cadastroCompleto = Boolean(dados.cadastro_completo);
    this.#ultimoLoginEm = dados.ultimo_login_em ?? null;
  }

  // ─────────────── Getters ───────────────
  get id() { return this.#id; }
  get nome() { return this.#nome; }
  get email() { return this.#email; }
  get telefone() { return this.#telefone; }
  get avatarSeed() { return this.#avatarSeed; }
  get role() { return this.#role; }
  get isDiretora() { return this.#isDiretora; }
  get ativo() { return this.#ativo; }
  get cadastroCompleto() { return this.#cadastroCompleto; }

  // ─────────────── Regras de domínio ───────────────

  /** Confere a senha informada contra o hash armazenado. */
  async verificarSenha(senha) {
    if (!this.#senhaHash) return false;   // conta criada apenas pelo Google
    return bcrypt.compare(senha, this.#senhaHash);
  }

  /** Indica se a conta pertence à equipe da escola. */
  ehFuncionaria() {
    return this.#role === 'funcionaria';
  }

  /** Indica se a conta é da diretora. */
  ehDiretora() {
    return this.ehFuncionaria() && this.#isDiretora;
  }

  /** Apenas a diretora administra contas de funcionárias (RF-017). */
  podeGerenciarContas() {
    return this.ehDiretora();
  }

  /** Conta criada pelo Google que ainda não vinculou nenhum aluno. */
  precisaCompletarCadastro() {
    return this.#role === 'responsavel' && !this.#cadastroCompleto;
  }

  /** Define se a conta pode autenticar no sistema. */
  podeAutenticar() {
    return this.#ativo;
  }

  /**
   * Representação segura para enviar ao cliente.
   * O hash da senha nunca é exposto.
   */
  paraResposta() {
    return {
      id: this.#id,
      nome: this.#nome,
      email: this.#email,
      telefone: this.#telefone,
      role: this.#role,
      is_diretora: this.#isDiretora,
      avatar_seed: this.#avatarSeed,
      cadastro_completo: this.#cadastroCompleto,
    };
  }
}
