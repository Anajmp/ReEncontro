// =====================================================================
// Templates de e-mail do ReEncontro.
// =====================================================================

const cor = "#C8102E";

function base(conteudo) {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1C1917;">
      <div style="border-bottom: 3px solid ${cor}; padding-bottom: 12px; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 20px; color: ${cor};">ReEncontro</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: #78716C;">Achados e Perdidos — SESI Nova Odessa</p>
      </div>
      ${conteudo}
      <div style="border-top: 1px solid #E7E5E4; margin-top: 28px; padding-top: 14px; font-size: 12px; color: #A8A29E;">
        <p style="margin: 0;">Este é um e-mail automático. Em caso de dúvidas, procure a inspetoria da escola.</p>
      </div>
    </div>
  `;
}

export const emailTemplates = {
  // Enviado ao criar a reivindicação (RF-005)
  reivindicacaoCriada({ nomeRequerente, descricaoItem, nomeAluno }) {
    return {
      assunto: "Recebemos sua reivindicação — ReEncontro",
      html: base(`
        <p>Olá, <strong>${nomeRequerente}</strong>!</p>
        <p>Recebemos sua solicitação para o item abaixo:</p>
        <div style="background: #F5F3F0; border-radius: 8px; padding: 14px; margin: 16px 0;">
          <p style="margin: 0; font-size: 15px;"><strong>${descricaoItem}</strong></p>
          <p style="margin: 6px 0 0; font-size: 13px; color: #78716C;">Aluno(a): ${nomeAluno}</p>
        </div>
        <p>Nossa equipe vai analisar a solicitação e você receberá um novo e-mail com a resposta.</p>
        <p style="font-size: 13px; color: #78716C;">
          <strong>Importante:</strong> ao retirar o item, leve um documento com foto. A funcionária conferirá os dados informados.
        </p>
      `),
    };
  },

  // Enviado quando a funcionária aprova
  reivindicacaoAprovada({ nomeRequerente, descricaoItem, pontoColeta }) {
    return {
      assunto: "Sua reivindicação foi aprovada — ReEncontro",
      html: base(`
        <p>Olá, <strong>${nomeRequerente}</strong>!</p>
        <p>Boa notícia: sua reivindicação foi <strong style="color: #059669;">aprovada</strong>.</p>
        <div style="background: #F5F3F0; border-radius: 8px; padding: 14px; margin: 16px 0;">
          <p style="margin: 0; font-size: 15px;"><strong>${descricaoItem}</strong></p>
          ${pontoColeta ? `<p style="margin: 6px 0 0; font-size: 13px; color: #78716C;">Retirada em: ${pontoColeta}</p>` : ""}
        </div>
        <p>Você tem <strong>7 dias corridos</strong> para retirar o item na escola.</p>
        <p style="font-size: 13px; color: #78716C;">
          <strong>Leve um documento com foto.</strong> A funcionária conferirá os dados informados na solicitação antes de entregar o item.
        </p>
      `),
    };
  },

  // Enviado quando a funcionária rejeita (RN-014)
  reivindicacaoRejeitada({ nomeRequerente, descricaoItem, motivo }) {
    return {
      assunto: "Sobre sua reivindicação — ReEncontro",
      html: base(`
        <p>Olá, <strong>${nomeRequerente}</strong>.</p>
        <p>Sua reivindicação para o item abaixo não pôde ser aprovada:</p>
        <div style="background: #F5F3F0; border-radius: 8px; padding: 14px; margin: 16px 0;">
          <p style="margin: 0; font-size: 15px;"><strong>${descricaoItem}</strong></p>
        </div>
        <div style="background: #FFF1F2; border-left: 3px solid ${cor}; border-radius: 4px; padding: 12px; margin: 16px 0;">
          <p style="margin: 0; font-size: 13px; color: #78716C;">Motivo informado pela equipe:</p>
          <p style="margin: 6px 0 0; font-size: 14px;">${motivo}</p>
        </div>
        <p style="font-size: 13px; color: #78716C;">Em caso de dúvidas, procure a inspetoria da escola.</p>
      `),
    };
  },

  // Enviado quando a funcionária cancela (RN-014)
  reivindicacaoCancelada({ nomeRequerente, descricaoItem, motivo }) {
    return {
      assunto: "Sua reivindicação foi cancelada — ReEncontro",
      html: base(`
        <p>Olá, <strong>${nomeRequerente}</strong>.</p>
        <p>Sua reivindicação para o item abaixo foi cancelada:</p>
        <div style="background: #F5F3F0; border-radius: 8px; padding: 14px; margin: 16px 0;">
          <p style="margin: 0; font-size: 15px;"><strong>${descricaoItem}</strong></p>
        </div>
        <div style="background: #FFF7ED; border-left: 3px solid #C2410C; border-radius: 4px; padding: 12px; margin: 16px 0;">
          <p style="margin: 0; font-size: 13px; color: #78716C;">Motivo informado pela equipe:</p>
          <p style="margin: 6px 0 0; font-size: 14px;">${motivo}</p>
        </div>
        <p>O item voltou a ficar disponível na listagem pública.</p>
      `),
    };
  },

  // Enviado ao solicitar redefinição de senha (RF-016)
  redefinicaoSenha({ nome, link }) {
    return {
      assunto: "Redefinição de senha — ReEncontro",
      html: base(`
        <p>Olá, <strong>${nome}</strong>!</p>
        <p>Recebemos um pedido para redefinir a senha da sua conta.</p>
        <p style="margin: 24px 0;">
          <a href="${link}"
             style="display: inline-block; background: ${cor}; color: #fff; text-decoration: none;
                    padding: 12px 24px; border-radius: 8px; font-weight: bold;">
            Redefinir minha senha
          </a>
        </p>
        <p style="font-size: 13px; color: #78716C;">
          Este link é válido por <strong>1 hora</strong> e pode ser usado apenas uma vez.
        </p>
        <p style="font-size: 13px; color: #78716C;">
          Se você não solicitou a redefinição, ignore este e-mail — sua senha continua a mesma.
        </p>
      `),
    };
  },
};
