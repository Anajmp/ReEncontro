// Estilos compartilhados (objetos e funções) ficam fora dos arquivos de
// componentes para não quebrar o fast refresh do Vite.

export const PARENT_FONT = { fontFamily: 'Plus Jakarta Sans, sans-serif' };

export const ADMIN_FONT = { fontFamily: 'Plus Jakarta Sans, sans-serif' };

/** Classes dos chips (mesmo estilo das categorias da listagem). */
export function chipClasses(ativo: boolean) {
  return `shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-150 ${
    ativo
      ? 'bg-[#C8102E] text-white shadow-sm shadow-[#C8102E]/20'
      : 'border border-[#E7E5E4] bg-white text-[#57534E] hover:border-[#C8102E]/30 hover:text-[#C8102E]'
  }`;
}
