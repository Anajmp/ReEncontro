// =====================================================================
// Geração de avatares via DiceBear (estilo Open Peeps).
// Guardamos apenas o "seed" no banco; a URL é montada aqui.
// =====================================================================

const BASE = 'https://api.dicebear.com/10.x/open-peeps/svg';

const PARAMS = [
  'backgroundColor=ffe3ea,e3edff,e2f5e9,fdf1d4,efe6ff',
  'backgroundColorFill=radial',
  'scale=0.75',
  'borderRadius=2',
  'accessoriesProbability=25',
  'accessoriesVariant=glasses,glasses2,glasses3,glasses4,glasses5,sunglasses,sunglasses2',
  'expressionVariant=awe,blank,calm,cheeky,concerned,contempt,cute,driven,eatingHappy,explaining,eyesClosed,fear,hectic,lovingGrin1,lovingGrin2,old,smile,smileBig,smileLOL,smileTeethGap,suspicious',
].join('&');

/** Monta a URL do avatar a partir de um seed. */
export function avatarUrl(seed: string): string {
  return `${BASE}?${PARAMS}&seed=${encodeURIComponent(seed)}`;
}

/** Gera um seed aleatório curto. */
export function gerarSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Gera uma lista de seeds aleatórios (para a grade de escolha). */
export function gerarSeeds(quantidade = 12): string[] {
  return Array.from({ length: quantidade }, () => gerarSeed());
}