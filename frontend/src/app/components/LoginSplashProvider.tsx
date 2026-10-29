// =====================================================================
// Transição para Login / Cadastro: "entrar pela lupa".
// A lupa (a mesma da tela de carregamento) sai do botão clicado e voa em
// arco até o centro, sobre um fundo vermelho. O vidro é um buraco nesse
// fundo: através dele já se vê a página de destino. A lente foca (brilho
// atravessando o vidro, faíscas na armação) e cresce até engolir a tela
// — você "entra" na página pela lupa.
// =====================================================================
import {
  useCallback, useEffect, useId, useRef, useState, type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, UserPlus } from 'lucide-react';
import { LoginSplashContext, type Origem } from './LoginSplash';

const FONT = { fontFamily: 'Plus Jakarta Sans, sans-serif' };

type Destino = 'login' | 'cadastro';

const DESTINOS: Record<Destino, { rota: string; legenda: string; Icon: typeof KeyRound }> = {
  login: { rota: '/login', legenda: 'Abrindo o login', Icon: KeyRound },
  cadastro: { rota: '/cadastro', legenda: 'Vamos criar sua conta', Icon: UserPlus },
};

// Linha do tempo (ms)
const T_COBRE = 160;     // fundo vermelho cobre a página atual → troca de rota
const T_CHEGA = 520;     // lupa chega ao centro
const T_FOCO = 820;      // fim do "foco" (brilho + faíscas)
const T_FIM = 1320;      // lente engoliu a tela

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface Ponto { x: number; y: number }

function centroDoClique(e: Origem): Ponto {
  const alvo = e?.currentTarget;
  if (alvo) {
    // Limita à área visível: o botão pode estar parcialmente fora da tela
    const r = alvo.getBoundingClientRect();
    return {
      x: Math.min(window.innerWidth - 16, Math.max(16, r.left + r.width / 2)),
      y: Math.min(window.innerHeight - 16, Math.max(16, r.top + r.height / 2)),
    };
  }
  return { x: window.innerWidth / 2, y: window.innerHeight * 0.85 };
}

export function LoginSplashProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const tocando = useRef(false);
  const [transicao, setTransicao] = useState<{ destino: Destino; origem: Ponto; chave: number } | null>(null);

  const tocar = useCallback((destino: Destino, e?: Origem) => {
    if (tocando.current) return;
    if (deveReduzirMovimento()) {
      navigate(DESTINOS[destino].rota);
      return;
    }
    tocando.current = true;
    setTransicao({ destino, origem: centroDoClique(e), chave: Date.now() });
  }, [navigate]);

  const playLoginTransition = useCallback((e?: Origem) => tocar('login', e), [tocar]);
  const playCadastroTransition = useCallback((e?: Origem) => tocar('cadastro', e), [tocar]);

  const aoTrocarRota = useCallback((destino: Destino) => navigate(DESTINOS[destino].rota), [navigate]);
  const aoTerminar = useCallback(() => {
    setTransicao(null);
    tocando.current = false;
  }, []);

  return (
    <LoginSplashContext.Provider value={{ playLoginTransition, playCadastroTransition }}>
      {children}
      {transicao && (
        <EntradaPelaLupa
          key={transicao.chave}
          destino={transicao.destino}
          origem={transicao.origem}
          aoTrocarRota={aoTrocarRota}
          aoTerminar={aoTerminar}
        />
      )}
    </LoginSplashContext.Provider>
  );
}

const easeOutBack = (t: number) => {
  const c1 = 1.5;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeInCubic = (t: number) => t ** 3;
const limitar = (t: number) => Math.min(1, Math.max(0, t));

function deveReduzirMovimento() {
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('alto-contraste')
  );
}

function EntradaPelaLupa({
  destino, origem, aoTrocarRota, aoTerminar,
}: {
  destino: Destino;
  origem: Ponto;
  aoTrocarRota: (d: Destino) => void;
  aoTerminar: () => void;
}) {
  const id = useId().replace(/:/g, '');
  const [tela] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const [legendaVisivel, setLegendaVisivel] = useState(false);

  const fundoRef = useRef<SVGRectElement>(null);
  const furoRef = useRef<SVGCircleElement>(null);
  const recorteRef = useRef<SVGCircleElement>(null);
  const brilhoRef = useRef<SVGRectElement>(null);
  const aroRef = useRef<SVGCircleElement>(null);
  const caboRef = useRef<SVGLineElement>(null);
  const reflexoRef = useRef<SVGPathElement>(null);
  const faiscasRef = useRef<SVGGElement>(null);

  const centro = { x: tela.w / 2, y: tela.h * 0.44 };
  const raioFoco = Math.max(64, Math.min(110, Math.min(tela.w, tela.h) * 0.16));
  const raioFinal = Math.hypot(tela.w, tela.h) * 1.15;
  const { legenda, Icon } = DESTINOS[destino];

  useEffect(() => {
    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Ponto de controle do arco: acima do meio do caminho
    const controle = {
      x: (origem.x + centro.x) / 2,
      y: Math.min(origem.y, centro.y) - tela.h * 0.18,
    };

    function desenhar(ms: number) {
      // 1) Voo em arco do botão até o centro, crescendo e girando
      const tv = easeOutCubic(limitar(ms / T_CHEGA));
      const u = 1 - tv;
      let x = u * u * origem.x + 2 * u * tv * controle.x + tv * tv * centro.x;
      let y = u * u * origem.y + 2 * u * tv * controle.y + tv * tv * centro.y;
      let raio = 14 + (raioFoco - 14) * easeOutBack(limitar(ms / T_CHEGA));
      const giro = -50 * (1 - tv);

      // 2) Foco: leve "respiração" da lente
      if (ms > T_CHEGA && ms <= T_FOCO) {
        const tf = (ms - T_CHEGA) / (T_FOCO - T_CHEGA);
        raio *= 1 + 0.035 * Math.sin(tf * Math.PI);
      }

      // 3) Mergulho: a lente acelera e engole a tela
      const tm = easeInCubic(limitar((ms - T_FOCO) / (T_FIM - T_FOCO)));
      raio += (raioFinal - raio) * tm;
      x += (tela.w / 2 - x) * tm;
      y += (tela.h / 2 - y) * tm;

      fundoRef.current?.setAttribute('opacity', String(limitar(ms / T_COBRE)));
      for (const c of [furoRef.current, recorteRef.current]) {
        c?.setAttribute('cx', String(x));
        c?.setAttribute('cy', String(y));
        c?.setAttribute('r', String(raio));
      }

      // Armação acompanha o vidro; o cabo sai na diagonal
      const espessura = Math.max(5, raio * 0.11);
      aroRef.current?.setAttribute('cx', String(x));
      aroRef.current?.setAttribute('cy', String(y));
      aroRef.current?.setAttribute('r', String(raio + espessura / 2));
      aroRef.current?.setAttribute('stroke-width', String(espessura));

      const angulo = ((45 + giro) * Math.PI) / 180;
      const ini = raio + espessura * 0.8;
      const fim = raio * 1.75;
      caboRef.current?.setAttribute('x1', String(x + Math.cos(angulo) * ini));
      caboRef.current?.setAttribute('y1', String(y + Math.sin(angulo) * ini));
      caboRef.current?.setAttribute('x2', String(x + Math.cos(angulo) * fim));
      caboRef.current?.setAttribute('y2', String(y + Math.sin(angulo) * fim));
      caboRef.current?.setAttribute('stroke-width', String(Math.max(9, raio * 0.24)));

      // Reflexo fixo no canto do vidro
      const rr = raio * 0.72;
      reflexoRef.current?.setAttribute(
        'd',
        `M${x - rr * 0.9} ${y - rr * 0.42} A${rr} ${rr} 0 0 1 ${x - rr * 0.38} ${y - rr * 0.92}`,
      );
      reflexoRef.current?.setAttribute('stroke-width', String(Math.max(3, raio * 0.08)));

      // Brilho que atravessa o vidro durante o foco
      const tb = limitar((ms - T_CHEGA + 60) / (T_FOCO - T_CHEGA));
      const bx = x - raio * 1.6 + tb * raio * 3.2;
      brilhoRef.current?.setAttribute('x', String(bx - raio * 0.25));
      brilhoRef.current?.setAttribute('y', String(y - raio * 1.5));
      brilhoRef.current?.setAttribute('width', String(raio * 0.5));
      brilhoRef.current?.setAttribute('height', String(raio * 3));
      brilhoRef.current?.setAttribute('transform', `rotate(25 ${bx} ${y})`);
      brilhoRef.current?.setAttribute('opacity', tb > 0 && tb < 1 ? '0.55' : '0');

      // Faíscas: estouram da armação quando a lupa chega
      const tfa = limitar((ms - T_CHEGA) / 420);
      const faiscas = faiscasRef.current?.children;
      if (faiscas) {
        for (let i = 0; i < faiscas.length; i++) {
          const a = (i / faiscas.length) * Math.PI * 2 + 0.3;
          const d = raio + espessura + 6 + easeOutCubic(tfa) * raio * 0.55;
          const el = faiscas[i] as SVGCircleElement;
          el.setAttribute('cx', String(x + Math.cos(a) * d));
          el.setAttribute('cy', String(y + Math.sin(a) * d));
          el.setAttribute('opacity', tfa > 0 && tfa < 1 ? String(1 - tfa) : '0');
        }
      }
    }

    // Quadros via requestAnimationFrame; os marcos importantes também têm
    // setTimeout, para a transição terminar mesmo se a aba ficar em segundo plano
    const inicio = performance.now();
    let quadro = 0;
    const passo = (agora: number) => {
      const ms = agora - inicio;
      desenhar(ms);
      if (ms < T_FIM) quadro = window.requestAnimationFrame(passo);
    };
    desenhar(0);
    quadro = window.requestAnimationFrame(passo);

    const timers = [
      window.setTimeout(() => aoTrocarRota(destino), T_COBRE),
      window.setTimeout(() => setLegendaVisivel(true), T_CHEGA - 80),
      window.setTimeout(() => setLegendaVisivel(false), T_FOCO + 60),
      window.setTimeout(aoTerminar, T_FIM + 40),
    ];

    return () => {
      window.cancelAnimationFrame(quadro);
      timers.forEach(t => window.clearTimeout(t));
      document.body.style.overflow = overflowOriginal;
    };
    // Roda uma vez por transição (o componente é recriado a cada uma)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-[200]"
      style={FONT}
      role="dialog"
      aria-modal="true"
      aria-label={legenda}
    >
      <svg width={tela.w} height={tela.h} className="absolute inset-0" aria-hidden>
        <defs>
          <mask id={`furo-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width={tela.w} height={tela.h}>
            <rect width={tela.w} height={tela.h} fill="white" />
            <circle ref={furoRef} r="0" fill="black" />
          </mask>
          <clipPath id={`vidro-${id}`}>
            <circle ref={recorteRef} r="0" />
          </clipPath>
          <radialGradient id={`fundo-${id}`} cx="50%" cy="44%" r="75%">
            <stop offset="0%" stopColor="#D9183A" />
            <stop offset="100%" stopColor="#A50D26" />
          </radialGradient>
        </defs>

        {/* Fundo vermelho com o vidro "furado": através dele se vê o destino */}
        <rect
          ref={fundoRef}
          width={tela.w}
          height={tela.h}
          fill={`url(#fundo-${id})`}
          mask={`url(#furo-${id})`}
          opacity="0"
        />

        <g clipPath={`url(#vidro-${id})`}>
          <rect ref={brilhoRef} fill="white" opacity="0" />
        </g>

        <g ref={faiscasRef} fill="white">
          {Array.from({ length: 10 }, (_, i) => (
            <circle key={i} r={i % 2 ? 2.5 : 4} opacity="0" />
          ))}
        </g>

        <line ref={caboRef} stroke="white" strokeLinecap="round" />
        <circle ref={aroRef} fill="none" stroke="white" r="0" />
        <path ref={reflexoRef} stroke="white" strokeLinecap="round" fill="none" opacity="0.85" />
      </svg>

      <div
        className={`pointer-events-none absolute right-0 left-0 flex justify-center transition-all duration-300 ease-out ${
          legendaVisivel ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
        style={{ top: centro.y + raioFoco * 1.9 }}
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
          <Icon className="size-4" strokeWidth={2.2} />
          {legenda}
        </span>
      </div>
    </div>
  );
}
