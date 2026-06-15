// =====================================================================
// ROTA TEMPORÁRIA DE SETUP DO BANCO (v2 - mais robusta)
// Acesse /api/setup-database UMA VEZ para criar as tabelas.
// REMOVA esta rota depois de usar (por segurança).
// =====================================================================
import { Router } from 'express';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
 
const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
 
router.get('/setup-database', async (req, res) => {
  let conn;
  try {
    // Lê o arquivo do schema
    const schemaPath = path.join(__dirname, '../../migrations/schema_reencontro.sql');
    let sql = fs.readFileSync(schemaPath, 'utf8');
 
    // Remove CREATE DATABASE e USE (o banco do Railway já existe)
    sql = sql.replace(/CREATE DATABASE[\s\S]*?USE\s+reencontro\s*;/i, '');
 
    // Cria uma conexão NOVA com multipleStatements habilitado
    // (permite rodar vários comandos de uma vez)
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true,
    });
 
    // Roda o schema inteiro de uma vez
    await conn.query(sql);
 
    // Confere quais tabelas foram criadas
    const [tabelas] = await conn.query('SHOW TABLES');
 
    res.json({
      mensagem: 'Banco configurado com sucesso!',
      tabelas_criadas: tabelas.map((t) => Object.values(t)[0]),
      total: tabelas.length,
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  } finally {
    if (conn) await conn.end();
  }
});
 
export default router;