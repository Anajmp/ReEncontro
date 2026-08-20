import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { LupaMarca } from './shared/LupaMarca';

const FONT = { fontFamily: 'Plus Jakarta Sans, sans-serif' };
const COR_MARCA = { r: 200, g: 16, b: 46 };
const DURACAO_PADRAO_MS = 2400;
const FADE_SAIDA_MS = 600;
const QTD_BOLHAS = 22;

export interface LoadingScreenProps {
  duration?: number;
  onFinish?: () => void;
}

interface Bolha {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  phase: number;
}

interface PontoMouse {
  x: number;
  y: number;
  ativo: boolean;
}

function aleatorio(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function criarBolhas(largura: number, altura: number): Bolha[] {
  return Array.from({ length: QTD_BOLHAS }, () => ({
    x: aleatorio(0, largura),
    y: aleatorio(0, altura),
    vx: aleatorio(-0.1, 0.1),
    vy: aleatorio(-0.1, 0.1),
    size: aleatorio(8, 48),
    opacity: aleatorio(0.08, 0.22),
    phase: aleatorio(0, Math.PI * 2),
  }));
}

function pointerFino() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function LoadingScreen({ duration = DURACAO_PADRAO_MS, onFinish }: LoadingScreenProps) {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [saindo, setSaindo] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [entrada, setEntrada] = useState(false);

  useEffect(() => {
    const entrar = window.setTimeout(() => setEntrada(true), 40);
    const barra = window.setTimeout(() => setProgresso(1), 80);
    return () => {
      window.clearTimeout(entrar);
      window.clearTimeout(barra);
    };
  }, []);

  useEffect(() => {
    const iniciarSaida = window.setTimeout(() => setSaindo(true), duration);
    return () => window.clearTimeout(iniciarSaida);
  }, [duration]);

  useEffect(() => {
    if (!saindo) return;

    const encerrar = window.setTimeout(() => {
      navigate('/', { replace: true });
      onFinish?.();
    }, FADE_SAIDA_MS);

    return () => window.clearTimeout(encerrar);
  }, [saindo, navigate, onFinish]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const mouse: PontoMouse = { x: 0, y: 0, ativo: false };
    const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const atracaoAtiva = pointerFino() && !reduzMovimento;

    let largura = 0;
    let altura = 0;
    let dpr = 1;
    let bolhas: Bolha[] = [];
    let frame = 0;
    let ultimo = performance.now();

    function redimensionar() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      largura = window.innerWidth;
      altura = window.innerHeight;
      canvas.width = Math.floor(largura * dpr);
      canvas.height = Math.floor(altura * dpr);
      canvas.style.width = `${largura}px`;
      canvas.style.height = `${altura}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (bolhas.length === 0) {
        bolhas = criarBolhas(largura, altura);
      }
    }

    function onMouseMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.ativo = true;
    }

    function onMouseLeave() {
      mouse.ativo = false;
    }

    function desenhar(agora: number) {
      const dt = Math.min(32, agora - ultimo) / 16.67;
      ultimo = agora;
      const t = agora * 0.001;

      ctx.clearRect(0, 0, largura, altura);

      for (const b of bolhas) {
        b.vx += Math.sin(t * 0.32 + b.phase) * 0.007 * dt;
        b.vy += Math.cos(t * 0.26 + b.phase * 1.3) * 0.006 * dt;

        if (mouse.ativo && atracaoAtiva) {
          const dx = mouse.x - b.x;
          const dy = mouse.y - b.y;
          const dist = Math.hypot(dx, dy) || 1;
          const forca = Math.min(0.012, (80 / dist) * 0.008);
          b.vx += dx * forca * dt;
          b.vy += dy * forca * dt;
        }

        b.vx *= 0.945;
        b.vy *= 0.945;
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        const margem = b.size;
        if (b.x < -margem) b.x = largura + margem;
        if (b.x > largura + margem) b.x = -margem;
        if (b.y < -margem) b.y = altura + margem;
        if (b.y > altura + margem) b.y = -margem;

        const raio = b.size / 2;
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, raio);
        grad.addColorStop(0, `rgba(${COR_MARCA.r}, ${COR_MARCA.g}, ${COR_MARCA.b}, ${b.opacity})`);
        grad.addColorStop(1, `rgba(${COR_MARCA.r}, ${COR_MARCA.g}, ${COR_MARCA.b}, 0)`);
        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.arc(b.x, b.y, raio, 0, Math.PI * 2);
        ctx.fill();
      }

      frame = window.requestAnimationFrame(desenhar);
    }

    redimensionar();
    frame = window.requestAnimationFrame(desenhar);
    window.addEventListener('resize', redimensionar);

    if (atracaoAtiva) {
      window.addEventListener('mousemove', onMouseMove, { passive: true });
      document.addEventListener('mouseleave', onMouseLeave);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', redimensionar);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[200] overflow-hidden bg-[#F5F3F0] transition-opacity ease-out ${
        saindo ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ ...FONT, transitionDuration: `${FADE_SAIDA_MS}ms` }}
      role="status"
      aria-live="polite"
      aria-label="Carregando ReEncontro"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[42%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-[640px] sm:w-[640px]"
        style={{
          background:
            'radial-gradient(circle, rgba(254,226,226,0.72) 0%, rgba(254,226,226,0.28) 38%, rgba(245,243,240,0) 70%)',
        }}
      />

      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />

      <div className="relative z-10 flex min-h-full flex-col items-center justify-center px-6">
        <div
          className={`flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            entrada ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div
            className="relative flex items-center justify-center"
            style={{ animation: 'reencontro-respirar 3.2s ease-in-out infinite' }}
          >
            <LupaMarca size={156} />
          </div>

          <h1 className="mt-6 text-[1.85rem] font-extrabold tracking-tight text-[#1C1917] sm:text-[2.15rem]">
            Re<span className="text-[#C8102E]">Encontro</span>
          </h1>
          <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[#A8A29E]">
            SESI Nova Odessa
          </p>

          <div className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-3 py-1 text-xs font-bold text-[#C8102E]">
            <span className="size-1.5 animate-pulse rounded-full bg-[#C8102E]" />
            Preparando o sistema
          </div>

          <div className="mt-8 w-44 sm:w-52">
            <div className="h-[3px] overflow-hidden rounded-full bg-[#E7E5E4]">
              <div
                className="h-full origin-left rounded-full bg-[#C8102E]"
                style={{
                  transform: `scaleX(${progresso})`,
                  transition: `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <p className="pointer-events-none absolute bottom-8 left-0 right-0 text-center text-[11px] font-medium tracking-wide text-[#A8A29E]">
        Achados e perdidos escolar
      </p>

      <style>{`
        @keyframes reencontro-respirar {
          0%, 100% { transform: scale(0.97); opacity: 0.88; }
          50% { transform: scale(1.03); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="reencontro-respirar"] { animation: none !important; }
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
