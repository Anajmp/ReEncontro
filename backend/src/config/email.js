// =====================================================================
// Envio de e-mails via API HTTP do Brevo.
// Usamos a API (porta 443) em vez de SMTP porque as hospedagens
// gratuitas bloqueiam as portas SMTP (25, 465, 587).
// =====================================================================
import dotenv from "dotenv";

dotenv.config();

/**
 * Envia um e-mail transacional pela API do Brevo.
 * Mesma assinatura de antes — nada nos services precisa mudar.
 */
export async function enviarEmail({ para, assunto, html }) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_FROM_EMAIL,
        name: process.env.BREVO_FROM_NAME || "ReEncontro",
      },
      to: [{ email: para }],
      subject: assunto,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const erro = await res.text();
    throw new Error(`Brevo respondeu ${res.status}: ${erro}`);
  }

  return res.json();
}
