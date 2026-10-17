import { BookOpen, Shirt, Watch, Footprints, Package, FileText } from 'lucide-react';

// Cores de texto com contraste ≥ 4.5:1 sobre o fundo (WCAG AA).
// Usado tanto na área admin quanto na listagem pública.
const CAT_CFG: Record<string, { color: string; bg: string; Icon: typeof BookOpen }> = {
  'Material Escolar': { color: '#B45309', bg: '#FEF3C7', Icon: BookOpen },
  'Vestuário': { color: '#047857', bg: '#D1FAE5', Icon: Shirt },
  'Acessórios': { color: '#7C3AED', bg: '#EDE9FE', Icon: Watch },
  'Acessório': { color: '#7C3AED', bg: '#EDE9FE', Icon: Watch },
  'Documento': { color: '#1D4ED8', bg: '#DBEAFE', Icon: FileText },
  'Calçados': { color: '#B45309', bg: '#FEF9C3', Icon: Footprints },
  'Outros': { color: '#57534E', bg: '#F5F5F4', Icon: Package },
};

export function getCatConfig(category: string) {
  return CAT_CFG[category] ?? { color: '#57534E', bg: '#F5F5F4', Icon: Package };
}
