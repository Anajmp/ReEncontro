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
          className="size-20 rounded-2xl border border-linha bg-superficie"
        />
        <div>
          <p className="text-sm font-bold text-tinta">Seu personagem</p>
          <p className="text-sm text-tinta-suave">Escolha um dos personagens abaixo.</p>
        </div>
      </div>

      {/* Grade de opções */}
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6" role="group" aria-label="Personagens disponíveis">
        {opcoes.map((seed, i) => {
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
                  : 'border-linha hover:border-[#C8102E]/40'
              }`}
              aria-label={`Personagem ${i + 1}`}
              aria-pressed={ativo}
            >
              <img src={urlDoSeed(seed)} alt="" className="size-full bg-superficie" />
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
        className="mt-4 flex items-center gap-2 rounded-xl border border-linha bg-superficie px-4 py-2 text-sm font-semibold text-tinta-suave transition-colors hover:border-[#C8102E]/40 hover:text-tinta"
      >
        <RefreshCw size={14} strokeWidth={1.8} />
        Gerar outros personagens
      </button>
    </div>
  );
}
