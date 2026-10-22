// =====================================================================
// Tela de carregamento da listagem pública.
// Uma lupa varre uma cena de objetos perdidos (cinzas e desfocados);
// cada objeto que passa sob a lente é "encontrado" e ganha cor. A cena
// colorindo é o indicador de progresso. Enquanto isso, a listagem é
// buscada de verdade (prefetchListagem): a tela só termina quando os
// dados chegaram, e mostra quantos itens esperam seus donos.
// =====================================================================
import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';
import {
  Backpack, BookOpen, Footprints, Glasses, IdCard, Key, Pencil, Shirt, Umbrella, Watch,
} from 'lucide-react';
import { getCatConfig } from './shared/categorias';
import { prefetchListagem } from '../../lib/api';

const FONT = { fontFamily: 'Plus Jakarta Sans, sans-serif' };
const VERMELHO = '#C8102E';

// Cena (unidades do viewBox)
const LARGURA = 600;
const ALTURA = 300;
const CENTRO_X = LARGURA / 2;
const CENTRO_Y = ALTURA / 2;
const RAIO_LENTE = 46;
const DISTANCIA_ACHOU = 34;

// Tempos
const MINIMO_MS = 2200;        // deixa a busca acontecer mesmo com rede rápida
const AVISO_LENTO_MS = 4500;   // servidor dormindo (cold start do Render)
const MAXIMO_MS = 12000;       // depois disso abre a listagem de qualquer jeito
const POUSO_MS = 750;          // lupa volta ao centro
const REVELACAO_MS = 1300;     // tempo para ler a contagem
const SAIDA_MS = 550;
const VELOCIDADE = 1.9;        // radianos por segundo ao longo do trajeto

// Trajeto da lupa: um "oito" deitado (curva de Lissajous 1:2)
function trajeto(a: number) {
  return {
    x: CENTRO_X + 228 * Math.sin(a),
    y: CENTRO_Y + 92 * Math.sin(2 * a + 0.5),
  };
}

const OBJETOS_BASE: { Icon: ElementType; categoria: string }[] = [
  { Icon: Glasses, categoria: 'Acessório' },
  { Icon: Key, categoria: 'Outros' },
  { Icon: BookOpen, categoria: 'Material Escolar' },
  { Icon: Shirt, categoria: 'Vestuário' },
  { Icon: Watch, categoria: 'Acessório' },
  { Icon: Umbrella, categoria: 'Outros' },
  { Icon: IdCard, categoria: 'Documento' },
  { Icon: Pencil, categoria: 'Material Escolar' },
  { Icon: Footprints, categoria: 'Calçados' },
  { Icon: Backpack, categoria: 'Material Escolar' },
];

// Cada objeto fica sobre o trajeto (com um leve desvio), então uma volta
// completa da lupa encontra todos
const OBJETOS = OBJETOS_BASE.map((o, i) => {
  const p = trajeto(0.31 + i * ((2 * Math.PI) / OBJETOS_BASE.length));
  const cfg = getCatConfig(o.categoria);
  return {
    ...o,
    id: i,
    x: p.x,
    y: p.y + (i % 2 ? 15 : -15),
    giro: ((i % 3) - 1) * 14,
    cor: cfg.color,
    fundo: cfg.bg,
  };
});

type Fase = 'buscando' | 'pousando' | 'saindo';

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function mensagemFinal(total: number | null) {
  if (total === null) return 'Abrindo a listagem…';
  if (total === 0) return 'Nenhum item perdido no momento';
  if (total === 1) return '1 item esperando o dono';
  return `${total} itens esperando seus donos`;
}

function Objeto({ obj, cor, fundo, escala = 1 }: {
  obj: (typeof OBJETOS)[number]; cor: string; fundo?: string; escala?: number;
}) {
  const { Icon } = obj;
  return (
    <g transform={`translate(${obj.x} ${obj.y}) rotate(${obj.giro}) scale(${escala})`}>
      {fundo && <circle r="25" fill={fundo} />}
      <Icon x={-13} y={-13} width={26} height={26} color={cor} strokeWidth={1.7} />
    </g>
  );
}

export interface LoadingScreenProps {
  onFinish?: () => void;
}

export function LoadingScreen({ onFinish }: LoadingScreenProps) {
  const [fase, setFase] = useState<Fase>('buscando');
  const [achados, setAchados] = useState<Set<number>>(() => new Set());
  const [dadosProntos, setDadosProntos] = useState(false);
  const [minimoCumprido, setMinimoCumprido] = useState(false);
  const [lento, setLento] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [entrada, setEntrada] = useState(false);

  const faseRef = useRef<Fase>('buscando');
  const achadosRef = useRef<Set<number>>(new Set());
  const posicaoRef = useRef(trajeto(0));
  const pousoRef = useRef({ de: trajeto(0), inicio: 0 });
  const lenteRef = useRef<SVGGElement>(null);
  const recorteRef = useRef<SVGCircleElement>(null);
  const vidroRef = useRef<SVGCircleElement>(null);
  // Lido uma vez só, na montagem
  const [reduzMovimento] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  function marcarAchado(id: number) {
    if (achadosRef.current.has(id)) return;
    achadosRef.current.add(id);
    setAchados(new Set(achadosRef.current));
  }

  // Busca real da listagem + temporizadores de mínimo, aviso e máximo
  useEffect(() => {
    let ativo = true;
    prefetchListagem()
      .then(pagina => {
        // a listagem pública só traz disponíveis; o total vem do servidor
        if (ativo) setTotal(pagina.total);
      })
      .catch(() => {
        // a listagem mostra o próprio erro; aqui só seguimos em frente
      })
      .finally(() => {
        if (ativo) setDadosProntos(true);
      });

    const timers = [
      window.setTimeout(() => setEntrada(true), 30),
      window.setTimeout(() => setMinimoCumprido(true), reduzMovimento ? 400 : MINIMO_MS),
      window.setTimeout(() => setLento(true), AVISO_LENTO_MS),
      window.setTimeout(() => setDadosProntos(true), MAXIMO_MS),
    ];
    return () => {
      ativo = false;
      timers.forEach(t => window.clearTimeout(t));
    };
  }, [reduzMovimento]);

  // Timers do encerramento ficam num ref: mudar de fase não pode cancelá-los,
  // só desmontar a tela
  const timersSaidaRef = useRef<number[]>([]);
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  });
  useEffect(() => () => timersSaidaRef.current.forEach(t => window.clearTimeout(t)), []);

  // Dados chegaram e a busca já teve seu tempo: a lupa pousa no centro,
  // os objetos restantes são encontrados em cascata (isso também cobre aba
  // em segundo plano, onde o requestAnimationFrame fica pausado), a contagem
  // aparece e a tela sai
  useEffect(() => {
    if (faseRef.current !== 'buscando' || !dadosProntos || !minimoCumprido) return;

    faseRef.current = 'pousando';
    pousoRef.current = { de: { ...posicaoRef.current }, inicio: performance.now() };
    setFase('pousando');

    const agendar = (fn: () => void, ms: number) =>
      timersSaidaRef.current.push(window.setTimeout(fn, ms));

    OBJETOS.filter(o => !achadosRef.current.has(o.id)).forEach((o, i) =>
      agendar(() => marcarAchado(o.id), reduzMovimento ? 0 : 120 + i * 70),
    );
    agendar(() => {
      faseRef.current = 'saindo';
      setFase('saindo');
    }, POUSO_MS + REVELACAO_MS);
    agendar(() => onFinishRef.current?.(), POUSO_MS + REVELACAO_MS + SAIDA_MS);
  }, [dadosProntos, minimoCumprido, reduzMovimento]);

  // Animação da lupa: atualiza o SVG direto pelos refs, sem re-render por quadro
  useEffect(() => {
    function aplicar(p: { x: number; y: number }) {
      posicaoRef.current = p;
      lenteRef.current?.setAttribute('transform', `translate(${p.x} ${p.y})`);
      recorteRef.current?.setAttribute('cx', String(p.x));
      recorteRef.current?.setAttribute('cy', String(p.y));
      vidroRef.current?.setAttribute('cx', String(p.x));
      vidroRef.current?.setAttribute('cy', String(p.y));
    }

    if (reduzMovimento) {
      aplicar({ x: CENTRO_X, y: CENTRO_Y });
      OBJETOS.forEach(o => marcarAchado(o.id));
      return;
    }

    let angulo = 0;
    let ultimo = performance.now();
    let quadro = 0;

    function passo(agora: number) {
      const dt = Math.min(50, agora - ultimo) / 1000;
      ultimo = agora;

      let p: { x: number; y: number };
      if (faseRef.current === 'buscando') {
        angulo += VELOCIDADE * dt;
        p = trajeto(angulo);
      } else {
        const { de, inicio } = pousoRef.current;
        const t = easeOutCubic(Math.min(1, (agora - inicio) / POUSO_MS));
        p = { x: de.x + (CENTRO_X - de.x) * t, y: de.y + (CENTRO_Y - de.y) * t };
      }
      aplicar(p);

      for (const o of OBJETOS) {
        if (!achadosRef.current.has(o.id) && Math.hypot(o.x - p.x, o.y - p.y) < DISTANCIA_ACHOU) {
          marcarAchado(o.id);
        }
      }
      quadro = window.requestAnimationFrame(passo);
    }

    aplicar(trajeto(0));
    quadro = window.requestAnimationFrame(passo);
    return () => window.cancelAnimationFrame(quadro);
  }, [reduzMovimento]);

  const status =
    fase === 'buscando'
      ? lento
        ? 'Acordando o servidor… pode levar alguns segundos'
        : 'Procurando os itens achados…'
      : mensagemFinal(total);

  const saindo = fase === 'saindo';

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-fundo px-4 transition-opacity ease-out ${
        saindo ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ ...FONT, transitionDuration: `${SAIDA_MS}ms` }}
      role="status"
      aria-label="Carregando ReEncontro"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[42%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full lg:h-[min(1000px,110vw)] lg:w-[min(1000px,110vw)]"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--re-marca-clara) 70%, transparent) 0%, color-mix(in srgb, var(--re-marca-clara) 20%, transparent) 40%, transparent 70%)' }}
      />

      {/* No celular a cena passa um pouco da tela (só as margens vazias do
          viewBox ficam de fora) para os objetos não ficarem minúsculos.
          No computador ela cresce com a tela, limitada pela altura para
          sobrar espaço ao título */}
      <div
        className={`relative w-[min(112vw,640px)] shrink-0 md:w-[min(88vw,1200px,calc((100vh-240px)*2))] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          entrada ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        } ${saindo ? 'scale-[1.06]' : 'scale-100'}`}
      >
        <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} className="h-auto w-full overflow-visible" aria-hidden>
          <defs>
            <filter id="rl-desfoque" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.4" />
            </filter>
            <clipPath id="rl-recorte">
              <circle ref={recorteRef} r={RAIO_LENTE - 3} />
            </clipPath>
            <filter id="rl-sombra" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#7F1D1D" floodOpacity="0.16" />
            </filter>
          </defs>

          {/* Perdidos: cinzas e fora de foco */}
          <g filter="url(#rl-desfoque)" opacity="0.75">
            {OBJETOS.filter(o => !achados.has(o.id)).map(o => (
              <Objeto key={o.id} obj={o} cor="#A8A29E" />
            ))}
          </g>

          {/* Encontrados: ganham cor e um selo de confirmação */}
          {OBJETOS.filter(o => achados.has(o.id)).map(o => (
            <g key={o.id} transform={`translate(${o.x} ${o.y})`}>
              <g className="rl-achado">
                <g transform={`rotate(${o.giro})`}>
                  <circle r="25" fill={o.fundo} />
                  <o.Icon x={-13} y={-13} width={26} height={26} color={o.cor} strokeWidth={1.7} />
                </g>
                <g transform="translate(18 -18)">
                  <circle r="8" fill="#047857" style={{ stroke: 'var(--re-fundo)' }} strokeWidth="2.5" />
                  <path d="M-3.4 0.2 L-1 2.6 L3.6 -2.2" stroke="white" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </g>
            </g>
          ))}

          {/* Vidro da lupa: fundo claro e tudo nítido, colorido e ampliado */}
          <circle ref={vidroRef} r={RAIO_LENTE - 3} style={{ fill: 'var(--re-superficie)' }} fillOpacity="0.92" />
          <g clipPath="url(#rl-recorte)">
            {OBJETOS.map(o => (
              <Objeto key={o.id} obj={o} cor={o.cor} fundo={o.fundo} escala={1.18} />
            ))}
          </g>

          {/* Armação da lupa */}
          <g ref={lenteRef} filter="url(#rl-sombra)">
            <path d="M33 33 L64 64" stroke={VERMELHO} strokeWidth="10" strokeLinecap="round" />
            <circle r={RAIO_LENTE} fill="none" stroke={VERMELHO} strokeWidth="5" />
            <path d="M-30 -14 A33 33 0 0 1 -12 -31" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.9" />
          </g>
        </svg>
      </div>

      <div
        className={`relative mt-4 flex flex-col items-center lg:mt-6 text-center transition-all delay-150 duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          entrada ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        }`}
      >
        <h1 className="text-[1.7rem] font-extrabold tracking-tight text-tinta sm:text-[2rem] lg:text-[2.75rem]">
          Re<span className="text-marca-texto">Encontro</span>
        </h1>
        <p
          key={status}
          aria-live="polite"
          className={`rl-status mt-2 min-h-[1.5rem] text-sm font-semibold lg:text-base ${
            fase === 'buscando' ? 'text-tinta-suave' : 'text-marca-texto'
          }`}
        >
          {status}
        </p>
      </div>

      <p className="pointer-events-none absolute right-0 bottom-8 left-0 text-center text-[11px] font-medium tracking-[0.18em] text-tinta-suave uppercase">
        SESI Nova Odessa · Achados e perdidos
      </p>

      <style>{`
        .rl-achado {
          transform-box: fill-box;
          transform-origin: center;
          animation: rl-achou 520ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes rl-achou {
          from { transform: scale(0.4); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        .rl-status { animation: rl-status 420ms ease-out both; }
        @keyframes rl-status {
          from { transform: translateY(6px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .rl-achado, .rl-status { animation: none; }
        }
      `}</style>
    </div>
  );
}

let splashJaExibida = false;

interface PortaDeEntradaProps {
  children: ReactNode;
}

export function PortaDeEntrada({ children }: PortaDeEntradaProps) {
  const [pronto, setPronto] = useState(splashJaExibida);

  if (!pronto) {
    return (
      <LoadingScreen
        onFinish={() => {
          splashJaExibida = true;
          setPronto(true);
        }}
      />
    );
  }

  return <>{children}</>;
}
