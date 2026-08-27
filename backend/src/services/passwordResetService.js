// =====================================================================
// passwordResetService — regras de redefinição de senha (RF-016).
// =====================================================================
import crypto from "crypto";
import bcrypt from "bcrypt";
import { passwordResetRepository } from "../repositories/passwordResetRepository.js";
import { enviarEmail } from "../config/email.js";
import { emailTemplates } from "../utils/emailTemplates.js";

// Gera o hash do token (o mesmo cálculo na criação e na validação)
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const passwordResetService = {
  async solicitar(email) {
    const usuario = await passwordResetRepository.buscarUsuarioPorEmail(email);

    // Se o usuário existe, gera o token e envia o e-mail.
    // Se não existe, não faz nada — mas a resposta é a mesma (anti-enumeração).
    if (usuario) {
      // Token aleatório de 32 bytes em hexadecimal
      const token = crypto.randomBytes(32).toString("hex");
      await passwordResetRepository.criarToken(usuario.id, hashToken(token));

      const link = `${process.env.FRONTEND_URL}/redefinir-senha?token=${token}`;
      const template = emailTemplates.redefinicaoSenha({
        nome: usuario.nome,
        link,
      });

      enviarEmail({
        para: usuario.email,
        assunto: template.assunto,
        html: template.html,
      }).catch((err) =>
        console.error("Falha ao enviar e-mail de redefinição:", err.message),
      );
    }

    // Mensagem genérica, independente de o e-mail existir ou não
    return {
      mensagem:
        "Se este e-mail estiver cadastrado, você receberá um link para redefinir a senha.",
    };
  },

  async redefinir(token, novaSenha) {
    const reset = await passwordResetRepository.buscarTokenValido(
      hashToken(token),
    );

    if (!reset) {
      throw {
        status: 400,
        mensagem: "Link inválido ou expirado. Solicite um novo.",
      };
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await passwordResetRepository.redefinirSenha(
      reset.id,
      reset.user_id,
      senhaHash,
    );

    return {
      mensagem: "Senha redefinida com sucesso. Faça login com a nova senha.",
    };
  },
};
