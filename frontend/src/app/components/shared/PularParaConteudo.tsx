import { CONTEUDO_ID, focarConteudo } from '../../../lib/acessibilidade';

/**
 * Primeiro item do Tab em cada página: some da tela até receber foco e leva
 * direto ao conteúdo, sem passar pelo menu inteiro.
 */
export function PularParaConteudo() {
  return (
    <a
      href={`#${CONTEUDO_ID}`}
      onClick={e => {
        // O hash mudaria a URL e o React Router trataria como navegação
        e.preventDefault();
        focarConteudo();
      }}
      // O not-sr-only zera o padding: por isso o espaçamento vem com focus:
      className="sr-only rounded-xl bg-superficie text-sm font-bold text-marca-texto shadow-lg focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5"
    >
      Pular para o conteúdo
    </a>
  );
}
