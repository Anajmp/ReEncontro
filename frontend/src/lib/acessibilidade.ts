// =====================================================================
// Acessibilidade — utilitários compartilhados entre as telas.
// =====================================================================

/** id do <main> de cada tela: alvo do "Pular para o conteúdo" e do foco ao trocar de rota. */
export const CONTEUDO_ID = 'conteudo';

/**
 * Leva o foco ao conteúdo principal, para o leitor de tela anunciar a página
 * nova e o Tab recomeçar dali. Se o foco já está dentro dele (ex.: campo com
 * autoFocus), não mexe.
 */
export function focarConteudo() {
  const conteudo = document.getElementById(CONTEUDO_ID);
  if (!conteudo || conteudo.contains(document.activeElement)) return;
  conteudo.focus({ preventScroll: true });
}
