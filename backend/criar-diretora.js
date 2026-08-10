import "dotenv/config";
import bcrypt from "bcrypt";
import { db } from "./src/config/database.js";

async function criar() {
  const senhaHash = await bcrypt.hash("123456", 10);
  try {
    await db.execute(
      `INSERT INTO users (nome, email, senha_hash, role, is_diretora)
       VALUES (?, ?, ?, 'funcionaria', TRUE)`,
      ["Diretora Teste", "diretora@sesi.br", senhaHash],
    );
    console.log("✅ Diretora criada! diretora@sesi.br / 123456");
  } catch (err) {
    console.error("❌ Erro:", err.message);
  } finally {
    process.exit(0);
  }
}
criar();
