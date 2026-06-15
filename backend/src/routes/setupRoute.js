// =====================================================================
// ROTA TEMPORÁRIA DE SETUP DO BANCO
// Acesse /api/setup-database UMA VEZ para criar as tabelas.
// REMOVA esta rota depois de usar (por segurança).
// =====================================================================
import { Router } from 'express';
import { db } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

router.get('/setup-database', async (req, res) => {
  try {
    // Lê o arquivo do schema
    const schemaPath = path.join(__dirname, '../../migrations/schema_reencontro.sql');
    let sql = fs.readFileSync(schemaPath, 'utf8');

    // Remove CREATE DATABASE e USE (o banco do Railway já existe)
    sql = sql.replace(/CREATE DATABASE[\s\S]*?USE\s+reencontro\s*;/i, '');

    // Divide em comandos individuais (separados por ;)
    const comandos = sql
      .split(';')
      .map((c) => c.trim())
      .filter((c) => c.length > 0 && !c.startsWith('--'));

    const resultados = [];
    for (const comando of comandos) {
      try {
        await db.query(comando);
        // Pega o início do comando pra mostrar o que rodou
        const preview = comando.substring(0, 60).replace(/\s+/g, ' ');
        resultados.push('OK: ' + preview);
      } catch (err) {
        const preview = comando.substring(0, 60).replace(/\s+/g, ' ');
        resultados.push('ERRO: ' + preview + ' => ' + err.message);
      }
    }

    res.json({
      mensagem: 'Setup do banco executado',
      total_comandos: comandos.length,
      resultados,
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

export default router;
