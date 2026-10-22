// =====================================================================
// Tema claro/escuro — o next-themes põe (ou tira) a classe "dark" no <html>
// e guarda a escolha no localStorage. Sem escolha, é sempre o claro.
// =====================================================================
import { useTheme } from 'next-themes';

/** Chave do localStorage (também lida pelo script do index.html, antes do React). */
export const CHAVE_TEMA = 'reencontro-tema';

export function useTemaEscuro() {
  return useTheme().resolvedTheme === 'dark';
}

/**
 * O recharts grava as cores como atributos do SVG, que não aceitam var(--…):
 * por isso os gráficos pegam as cores do tema por aqui.
 */
export function useCoresGrafico() {
  return useTemaEscuro()
    ? { eixo: '#B3ACA6', grade: '#2A2624', cursor: '#2A2624', barraNeutra: '#57534E', descartados: '#A8A29E' }
    : { eixo: '#6E6762', grade: '#F0EDE8', cursor: '#F5F3F0', barraNeutra: '#E7E5E4', descartados: '#78716C' };
}

/** Balão do gráfico de pizza (aqui é estilo CSS, então var(--…) funciona). */
export const ESTILO_TOOLTIP_GRAFICO = {
  borderRadius: 12,
  border: '1px solid var(--re-linha)',
  background: 'var(--re-superficie)',
  color: 'var(--re-tinta)',
  fontSize: 12,
};
