import { useState } from 'react';
import { RefreshCw, Check } from 'lucide-react';
import { avatarUrl, gerarSeeds } from '../../../lib/avatar';

const TOTAL_OPCOES = 12;

interface Props {
  seedAtual: string;
  onSelecionar: (seed: string) => void;
  salvando?: boolean;
  /** Monta a URL do personagem a partir do seed (padrão: estilo dos responsáveis). */
  urlDoSeed?: (seed: string) => string;
  /** Seeds sempre exibidos no início da grade (ex.: personagem institucional). */
  opcoesFixas?: string[];
}

export function AvatarPicker({
  seedAtual,
  onSelecionar,
  salvando,
  urlDoSeed = avatarUrl,
  opcoesFixas = [],
}: Props) {
  const quantidade = Math.max(TOTAL_OPCOES - opcoesFixas.length, 0);
  const [aleatorias, setAleatorias] = useState<string[]>(() => gerarSeeds(quantidade));
  const [selecionado, setSelecionado] = useState(seedAtual);
  const opcoes = [...opcoesFixas, ...aleatorias];

  function escolher(seed: string) {
    setSelecionado(seed);
    onSelecionar(seed);
  }

  return (
    <div>
      {/* Avatar atual, em destaque */}
      <div className="mb-5 flex items-center gap-4">
        <img
          src={urlDoSeed(selecionado)}
          alt="Seu avatar"
          className="size-20 rounded-2xl border border-[#E7E5E4] bg-white"
        />
        <div>
          <p className="text-sm font-bold text-[#1C1917]">Seu personagem</p>
          <p className="text-sm text-[#78716C]">Escolha um dos personagens abaixo.</p>
        </div>
      </div>

      {/* Grade de opções */}
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
        {opcoes.map(seed => {
          const ativo = seed === selecionado;
          return (
            <button
              key={seed}
              type="button"
              onClick={() => escolher(seed)}
              disabled={salvando}
              className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                ativo
                  ? 'border-[#C8102E] ring-2 ring-[#C8102E]/20'
                  : 'border-[#E7E5E4] hover:border-[#C8102E]/40'
              }`}
              aria-label="Escolher este personagem"
            >
              <img src={urlDoSeed(seed)} alt="" className="size-full bg-white" />
              {ativo && (
                <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-[#C8102E]">
                  <Check size={12} strokeWidth={3} className="text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Gerar novas opções */}
      <button
        type="button"
        onClick={() => setAleatorias(gerarSeeds(quantidade))}
        disabled={salvando}
        className="mt-4 flex items-center gap-2 rounded-xl border border-[#E7E5E4] bg-white px-4 py-2 text-sm font-semibold text-[#78716C] transition-colors hover:border-[#C8102E]/40 hover:text-[#1C1917]"
      >
        <RefreshCw size={14} strokeWidth={1.8} />
        Gerar outros personagens
      </button>
    </div>
  );
}
