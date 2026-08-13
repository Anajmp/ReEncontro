// =====================================================================
// ROTA TEMPORÁRIA — cria a diretora inicial.
// Acesse UMA VEZ e depois REMOVA.
// =====================================================================
import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "../config/database.js";

const router = Router();

router.get("/setup-diretora", async (req, res) => {
  try {
    const senhaHash = await bcrypt.hash("123456", 10);
    await db.execute(
      `INSERT INTO users (nome, email, senha_hash, role, is_diretora)
       VALUES (?, ?, ?, 'funcionaria', TRUE)`,
      ["Diretora Teste", "diretora@sesi.br", senhaHash],
    );
    res.json({ mensagem: "Diretora criada! diretora@sesi.br / 123456" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.json({ mensagem: "Diretora já existe." });
    }
    res.status(500).json({ erro: err.message });
  }
});

export default router;
