// =====================================================================
// Geração de avatares via DiceBear (estilo Open Peeps).
// Guardamos apenas o "seed" no banco; a URL é montada aqui.
// =====================================================================

const BASE = 'https://api.dicebear.com/10.x/open-peeps/svg';

/** Opções padrão para responsáveis (personagem escolhido pelo seed). */
const PARAMS = [
  'backgroundColor=ffe3ea,e3edff,e2f5e9,fdf1d4,efe6ff',
  'backgroundColorFill=radial',
  'scale=0.75',
  'borderRadius=2',
  'accessoriesProbability=25',
  'accessoriesVariant=glasses,glasses2,glasses3,glasses4,glasses5,sunglasses,sunglasses2',
  'expressionVariant=awe,blank,calm,cheeky,concerned,contempt,cute,driven,eatingHappy,explaining,eyesClosed,fear,hectic,lovingGrin1,lovingGrin2,old,smile,smileBig,smileLOL,smileTeethGap,suspicious',
].join('&');

/**
 * Cortes / penteados tipicamente femininos no Open Peeps.
 * Usado para variar o avatar das inspetoras sem gerar aparência masculina.
 */
const HEAD_FEMININO = [
  'bangs', 'bangs2', 'bun', 'bun2', 'buns',
  'grayBun', 'hijab',
  'long', 'longAfro', 'longBangs', 'longCurly',
  'medium1', 'medium2', 'medium3',
  'mediumBangs', 'mediumBangs2', 'mediumBangs3', 'mediumStraight',
].join(',');

/** Avatar aleatório (por seed), restrito a opções femininas — inspetoras. */
const PARAMS_FUNCIONARIA = [
  `headVariant=${HEAD_FEMININO}`,
  'facialHairProbability=0',
  'facialHairVariant=',
  'accessoriesProbability=30',
  'accessoriesVariant=glasses,glasses2,glasses3,glasses4,glasses5,sunglasses,sunglasses2',
  'expressionVariant=awe,blank,calm,cheeky,concerned,contempt,cute,driven,eatingHappy,explaining,eyesClosed,lovingGrin1,lovingGrin2,smile,smileBig,smileLOL,smileTeethGap,suspicious',
  'backgroundColor=ffe3ea,e3edff,e2f5e9,fdf1d4,efe6ff,fbc6c6,c1a0f3',
  'backgroundColorFill=radial',
  'scale=0.75',
  'borderRadius=2',
].join('&');

/**
 * Personagem institucional fixo da diretora.
 * Características definidas explicitamente para sempre idêntico.
 */
const AVATAR_DIRETORA = [
  'accessoriesProbability=0',
  'expressionVariant=calm',
  'facialHairProbability=0',
  'headVariant=bangs',
  'backgroundColor=c1a0f3,ec8989',
  'clothingColor=343045',
  'backgroundColorFill=radial',
  'backgroundColorAngle=-15',
  'backgroundColorFillStops=2',
  'headContrastColor=b58143',
  'skinColor=f7cda6',
  'backgroundColorOrder=fixed',
  'scale=0.75',
  'borderRadius=2',
  'seed=Felix',
].join('&');

/** URL do avatar institucional da diretora. */
export function avatarDiretora(): string {
  return `${BASE}?${AVATAR_DIRETORA}`;
}

/**
 * URL do avatar de uma funcionária (inspetora).
 * Aleatório conforme o seed, mas só com opções femininas.
 */
export function avatarFuncionaria(seed?: string): string {
  const s = seed || 'funcionaria';
  return `${BASE}?${PARAMS_FUNCIONARIA}&seed=${encodeURIComponent(s)}`;
}

/** Monta a URL do avatar a partir de um seed (responsáveis). */
export function avatarUrl(seed: string): string {
  return `${BASE}?${PARAMS}&seed=${encodeURIComponent(seed)}`;
}

/**
 * Retorna a URL do avatar conforme o perfil.
 * - Diretora: personagem institucional fixo
 * - Funcionária/inspetora: aleatório feminino (estável pelo seed)
 * - Responsável: personagem escolhido
 */
export function avatarDoUsuario(usuario: {
  role?: string;
  is_diretora?: boolean | number;
  avatar_seed?: string;
  email?: string;
} | null): string {
  if (!usuario) return avatarUrl('padrao');

  if (usuario.role === 'funcionaria') {
    if (usuario.is_diretora) return avatarDiretora();
    return avatarFuncionaria(usuario.avatar_seed || usuario.email || 'funcionaria');
  }

  return avatarUrl(usuario.avatar_seed || usuario.email || 'padrao');
}

/** Gera um seed aleatório curto. */
export function gerarSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Gera uma lista de seeds aleatórios (para a grade de escolha). */
export function gerarSeeds(quantidade = 12): string[] {
  return Array.from({ length: quantidade }, () => gerarSeed());
}
