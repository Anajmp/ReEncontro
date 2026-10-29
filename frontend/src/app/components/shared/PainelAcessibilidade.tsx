import { useEffect, useState } from 'react';
import {
  Accessibility, Minus, Plus, Contrast, Type, Volume2, Square, RotateCcw, X,
} from 'lucide-react';
import { useAcessibilidade } from '../../../../hooks/useAcessibilidade';
import { useLeituraEmVoz } from '../../../../hooks/useLeituraEmVoz';

// Estilos reaproveitados pelos botões
const base =
  'flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40';
const neutro =
  'border-[#E7E5E4] bg-white text-[#1C1917] hover:bg-[#F5F3F0] dark:border-[#2C2C2E] dark:bg-[#1C1C1E] dark:text-[#F5F5F5] dark:hover:bg-[#2C2C2E]';
const ativo =
  'border-[#C8102E] bg-[#FDECEE] text-[#C8102E] dark:border-[#E5334F] dark:bg-[#3A1A20] dark:text-[#E5334F]';

export function PainelAcessibilidade() {
  const [aberto, setAberto] = useState(false);

  const {
    config, percentual, podeAumentar, podeDiminuir,
    aumentarFonte, diminuirFonte, alternarContraste, alternarFonteLegivel, restaurar,
  } = useAcessibilidade();
  const { suportado, lendo, lerPagina, parar } = useLeituraEmVoz();

  // Esc fecha o painel
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false);
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aberto]);

  function restaurarTudo() {
    parar();
    restaurar();
  }

  return (
    <>
      {aberto && (
        <div
          role="dialog"
          aria-label="Opções de acessibilidade"
          className="fixed right-4 bottom-20 z-50 w-72 rounded-2xl border border-[#E7E5E4] bg-white p-4 shadow-xl dark:border-[#2C2C2E] dark:bg-[#1C1C1E]"
        >
          {/* Cabeçalho do painel */}
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F5F5]">Acessibilidade</h2>
            <button
              type="button"
              onClick={() => setAberto(false)}
              aria-label="Fechar painel de acessibilidade"
              className="rounded-full p-1 text-[#78716C] hover:bg-black/5 dark:text-[#A1A1A6] dark:hover:bg-white/10"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-2">
            {/* 1. Tamanho do texto */}
            <div className={`${base} ${neutro} justify-between`}>
              <span>Texto: {percentual}%</span>
              <span className="flex gap-1.5">
                <button
                  type="button"
                  onClick={diminuirFonte}
                  disabled={!podeDiminuir}
                  aria-label="Diminuir texto"
                  className="rounded-lg border border-current p-1.5 disabled:opacity-40"
                >
                  <Minus className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={aumentarFonte}
                  disabled={!podeAumentar}
                  aria-label="Aumentar texto"
                  className="rounded-lg border border-current p-1.5 disabled:opacity-40"
                >
                  <Plus className="size-4" />
                </button>
              </span>
            </div>

            {/* 2. Alto contraste */}
            <button
              type="button"
              onClick={alternarContraste}
              aria-pressed={config.altoContraste}
              className={`${base} ${config.altoContraste ? ativo : neutro}`}
            >
              <Contrast className="size-4" /> Alto contraste
            </button>

            {/* 3. Fonte legível */}
            <button
              type="button"
              onClick={alternarFonteLegivel}
              aria-pressed={config.fonteLegivel}
              className={`${base} ${config.fonteLegivel ? ativo : neutro}`}
            >
              <Type className="size-4" /> Fonte legível
            </button>

            {/* 4. Leitura em voz alta */}
            {suportado && (
              <button
                type="button"
                onClick={lendo ? parar : lerPagina}
                aria-pressed={lendo}
                className={`${base} ${lendo ? ativo : neutro}`}
              >
                {lendo ? <Square className="size-4" /> : <Volume2 className="size-4" />}
                {lendo ? 'Parar leitura' : 'Ler em voz alta'}
              </button>
            )}

            {/* 5. Restaurar */}
            <button type="button" onClick={restaurarTudo} className={`${base} ${neutro}`}>
              <RotateCcw className="size-4" /> Restaurar configurações
            </button>
          </div>

          {suportado && (
            <p className="mt-3 text-xs leading-relaxed text-[#78716C] dark:text-[#A1A1A6]">
              <strong>Dica:</strong> selecione um trecho antes de clicar em <strong className='text-[#C8102E]'>“Ler em voz alta”</strong> para ouvir só ele.
            </p>
          )}
        </div>
      )}

      {/* Botão flutuante que abre e fecha o painel */}
      <button
        type="button"
        onClick={() => setAberto(a => !a)}
        aria-label="Abrir opções de acessibilidade"
        aria-expanded={aberto}
        className="fixed right-4 bottom-4 z-50 flex size-12 items-center justify-center rounded-full bg-[#C8102E] text-white shadow-lg transition-transform hover:scale-105 active:scale-95 dark:bg-[#E5334F]"
      >
        <Accessibility className="size-6" />
      </button>
    </>
  );
}