// =====================================================================
// Database — implementação do padrão Singleton.
//
// Garante que exista uma ÚNICA instância do pool de conexões em toda a
// aplicação. Sem isso, cada módulo que importasse este arquivo poderia
// abrir um novo pool, esgotando o limite de conexões do banco.
// =====================================================================
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  // Guarda a única instância criada
  static #instancia = null;

  #pool;

  constructor() {
    // Bloqueia a criação de uma segunda instância
    if (Database.#instancia) {
      throw new Error('Use Database.getInstance() para obter a conexão.');
    }

    this.#pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });

    Database.#instancia = this;
  }

  /**
   * Ponto único de acesso à instância (padrão Singleton).
   * Na primeira chamada cria o objeto; nas seguintes devolve o mesmo.
   */
  static getInstance() {
    if (!Database.#instancia) {
      new Database();
    }
    return Database.#instancia;
  }

  /** Devolve o pool de conexões para uso nos repositories. */
  getPool() {
    return this.#pool;
  }

  /** Testa a conexão com o banco (usado na inicialização do servidor). */
  async testarConexao() {
    const conexao = await this.#pool.getConnection();
    await conexao.ping();
    conexao.release();
    return true;
  }
}

// Exporta o pool da instância única, mantendo compatibilidade com o código atual
export const db = Database.getInstance().getPool();
export default Database;