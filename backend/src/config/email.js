// =====================================================================
// Configuração do Nodemailer (envio de e-mails via SMTP/Gmail)
// =====================================================================
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true para porta 465, false para 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Função utilitária para enviar e-mail
export async function enviarEmail({ para, assunto, html }) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: para,
    subject: assunto,
    html,
  });
}
