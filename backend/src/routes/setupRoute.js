import { Router } from "express";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

router.get("/setup-database", async (req, res) => {
  let conn;
  try {
    const schemaPath = path.join(
      __dirname,
      "../../migrations/schema_reencontro.sql",
    );
    let sql = fs.readFileSync(schemaPath, "utf8");

    // Remove CREATE DATABASE e USE (o Aiven já tem defaultdb)
    sql = sql.replace(/CREATE DATABASE[\s\S]*?USE\s+reencontro\s*;/i, "");

    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true,
      ssl:
        process.env.DB_SSL === "true"
          ? { rejectUnauthorized: false }
          : undefined,
    });

    // Desliga checagem de FK pra poder dropar em qualquer ordem
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    const tabelas = [
      "notificacoes",
      "refresh_tokens",
      "password_resets",
      "reivindicacoes",
      "item_fotos",
      "itens",
      "pontos_coleta",
      "categorias",
      "alunos",
      "users",
    ];
    for (const t of tabelas) {
      await conn.query(`DROP TABLE IF EXISTS ${t}`);
    }
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");

    // Cria tudo do zero
    await conn.query(sql);

    const [result] = await conn.query("SHOW TABLES");
    res.json({
      mensagem: "Banco recriado do zero!",
      total: result.length,
      tabelas: result.map((t) => Object.values(t)[0]),
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  } finally {
    if (conn) await conn.end();
  }
});

export default router;
