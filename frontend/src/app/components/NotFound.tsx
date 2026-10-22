import { ArrowLeft, SearchX } from 'lucide-react';
import type { Screen } from '../App';
import { CONTEUDO_ID } from '../../lib/acessibilidade';
import { SiteFooter, SiteHeader } from './shared/SiteHeader';
import { BOTAO_PRIMARIO } from './shared/PageBanner';
import { PARENT_FONT } from './shared/estilos';

interface Props {
  navigate: (s: Screen) => void;
}

/**
 * Endereço que não existe (cenário E-05 do UAT). Mesma composição do
 * "Nenhum item encontrado" da listagem, com o título como h1 da página.
 */
export function NotFound({ navigate }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-fundo" style={PARENT_FONT}>
      <SiteHeader navigate={navigate} />

      <main
        id={CONTEUDO_ID}
        tabIndex={-1}
        className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-16 outline-none sm:px-8"
      >
        <div className="flex max-w-md flex-col items-center rounded-3xl border border-contorno bg-superficie px-6 py-12 text-center shadow-sm sm:px-10">
          <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-marca-clara">
            <SearchX className="size-7 text-marca-texto" strokeWidth={1.6} aria-hidden />
          </div>
          <p className="mb-2 text-xs font-bold tracking-widest text-marca-texto uppercase">Erro 404</p>
          <h1 className="mb-2 text-2xl font-extrabold text-tinta">Página não encontrada</h1>
          <p className="text-sm leading-relaxed text-tinta-suave">
            O endereço que você abriu não existe ou foi alterado. Confira o link ou volte para a
            listagem de itens encontrados.
          </p>
          <button type="button" onClick={() => navigate('public-listing')} className={`mt-7 ${BOTAO_PRIMARIO}`}>
            <ArrowLeft size={16} strokeWidth={2} aria-hidden />
            Voltar para a listagem
          </button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
