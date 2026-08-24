// Script temporário para testar o envio de e-mail.
// Rode com: node testar-email.js
// Depois pode apagar.
import "dotenv/config";
import { enviarEmail } from "./src/config/email.js";

async function testar() {
  console.log("Enviando e-mail de teste...");
  try {
    const info = await enviarEmail({
      para: "anajmp11@gmail.com", // ← troca pelo seu e-mail
      assunto: "Teste — ReEncontro",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #C8102E;">ReEncontro</h2>
          <p>Este é um e-mail de teste do sistema.</p>
          <p>Se você recebeu esta mensagem, o Nodemailer está configurado corretamente.</p>
        </div>
      `,
    });
    console.log("✅ E-mail enviado com sucesso!");
    console.log("   ID:", info.messageId);
  } catch (err) {
    console.error("❌ Erro ao enviar:");
    console.error("   ", err.message);
  } finally {
    process.exit(0);
  }
}

testar();
