import { avaliarSenha } from '../../../lib/senha';

const ESTILOS = [
  { barra: 'bg-red-500',    texto: 'text-red-600 dark:text-red-400' },       // Ruim
  { barra: 'bg-orange-500', texto: 'text-orange-600 dark:text-orange-400' }, // Fraco
  { barra: 'bg-yellow-500', texto: 'text-yellow-700 dark:text-yellow-400' }, // Médio
  { barra: 'bg-green-500',  texto: 'text-green-600 dark:text-green-400' },   // Forte
];

export function ForcaSenha({ senha }: { senha: string }) {
  if (!senha) return null;

  const { indice, nome, dica } = avaliarSenha(senha);
  const estilo = ESTILOS[indice];
  const largura = (indice + 1) * 25;

  return (
    <div className="mt-1.5">
      <div
        data-forca-trilho
        className="h-1 w-full overflow-hidden rounded-full bg-[#E7E5E4] dark:bg-[#2C2C2E]"
        aria-hidden="true"
      >
        <div
          data-forca-barra
          className={`h-full rounded-full transition-all duration-300 ease-out ${estilo.barra}`}
          style={{ width: `${largura}%` }}
        />
      </div>

      <div
        className="mt-1.5 flex items-start justify-between gap-3 text-xs text-[#78716C] dark:text-[#A1A1A6]"
        aria-live="polite"
      >
        <p className="shrink-0">
          Força da senha:{' '}
          <span data-forca-nivel className={`font-semibold ${estilo.texto}`}>{nome}</span>
        </p>
        {dica && <p className="text-right">{dica}</p>}
      </div>
    </div>
  );
}