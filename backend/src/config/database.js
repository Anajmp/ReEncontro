// Mantido para compatibilidade — a implementação real está em database/Database.js
import Database from '../database/Database.js';

export const db = Database.getInstance().getPool();

/** Testa a conexão com o banco (usado na inicialização do servidor). */
export async function testConnection() {
  return Database.getInstance().testarConexao();
}

export { Database };