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

// Escapa texto para HTML. Nome do requerente, do aluno e a sala vêm de um
// formulário público: sem isso, qualquer pessoa conseguiria mandar HTML e
// links próprios pelo remetente da escola (phishing).
function escaparHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escaparCampos(dados = {}) {
  return Object.fromEntries(
    Object.entries(dados).map(([chave, valor]) => [chave, escaparHtml(valor)]),
  );
}

const templates = {
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

  // Código de verificação de e-mail (sem link: só o número)
  codigoVerificacao({ nome, codigo }) {
    return {
      assunto: `${codigo} é o seu código de verificação — ReEncontro`,
      html: base(`
        <p>Olá, <strong>${nome}</strong>!</p>
        <p>Use o código abaixo para confirmar o seu e-mail no ReEncontro:</p>
        <p style="margin: 24px 0; text-align: center;">
          <span style="display: inline-block; background: #F5F3F0; border: 2px solid ${cor};
                       border-radius: 12px; padding: 16px 28px; font-size: 32px; font-weight: bold;
                       letter-spacing: 10px; color: ${cor}; font-family: 'Courier New', monospace;">
            ${codigo}
          </span>
        </p>
        <p style="font-size: 13px; color: #78716C;">
          Este código é válido por <strong>15 minutos</strong> e pode ser usado apenas uma vez.
        </p>
        <p style="font-size: 13px; color: #78716C;">
          Se você não pediu este código, ignore este e-mail. Nunca compartilhe o código com ninguém.
        </p>
      `),
    };
  },

    // Aviso interno para a equipe quando chega uma nova reivindicação
  novaReivindicacaoParaEquipe({ descricaoItem, nomeRequerente, nomeAluno, salaAluno, periodoAluno }, bruto) {
    return {
      // O assunto é texto puro (não HTML): usa o valor original
      assunto: `Nova reivindicação: ${bruto.descricaoItem}`,
      html: base(`
        <p>Uma nova reivindicação foi registrada e aguarda análise.</p>
        <div style="background: #F5F3F0; border-radius: 8px; padding: 14px; margin: 16px 0;">
          <p style="margin: 0; font-size: 15px;"><strong>${descricaoItem}</strong></p>
          <p style="margin: 10px 0 0; font-size: 13px; color: #78716C;">
            Solicitado por: <strong>${nomeRequerente}</strong><br>
            Aluno(a): ${nomeAluno} · ${salaAluno} · ${periodoAluno}
          </p>
        </div>
        <p style="font-size: 13px; color: #78716C;">
          Acesse a aba <strong>Pendentes</strong> no painel para aprovar ou rejeitar a solicitação.
        </p>
      `),
    };
  },
};

// Todo template recebe os campos já escapados. O segundo argumento traz os
// valores originais, para os assuntos (texto puro, não HTML).
export const emailTemplates = Object.fromEntries(
  Object.entries(templates).map(([nome, montar]) => [
    nome,
    (dados) => montar(escaparCampos(dados), dados),
  ]),
);
