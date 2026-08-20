import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { LupaMarca } from './shared/LupaMarca';

const FONT = { fontFamily: 'Plus Jakarta Sans, sans-serif' };

interface LoginSplashContextValue {
  playLoginTransition: () => void;
}

const LoginSplashContext = createContext<LoginSplashContextValue | null>(null);

export function useLoginSplash() {
  const ctx = useContext(LoginSplashContext);
  if (!ctx) {
    throw new Error('useLoginSplash precisa estar dentro de LoginSplashProvider');
  }
  return ctx;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function LoginSplashProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const playing = useRef(false);
  const [aberto, setAberto] = useState(false);

  const playLoginTransition = useCallback(() => {
    if (playing.current) return;

    if (prefersReducedMotion()) {
      navigate('/login');
      return;
    }

    playing.current = true;
    setAberto(true);
  }, [navigate]);

  const onNavigate = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const onDone = useCallback(() => {
    setAberto(false);
    playing.current = false;
  }, []);

  return (
    <LoginSplashContext.Provider value={{ playLoginTransition }}>
      {children}
      <AnimatePresence>
        {aberto && <SplashOverlay onNavigate={onNavigate} onDone={onDone} />}
      </AnimatePresence>
    </LoginSplashContext.Provider>
  );
}

function SplashOverlay({ onNavigate, onDone }: { onNavigate: () => void; onDone: () => void }) {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    onNavigate();

    return () => {
      document.body.style.overflow = original;
    };
  }, [onNavigate]);

  useEffect(() => {
    const encerrar = window.setTimeout(onDone, 1600);
    return () => window.clearTimeout(encerrar);
  }, [onDone]);

  return (
    <motion.div
      role="dialog"
      aria-label="Abrindo login"
      aria-modal="true"
      initial={{ clipPath: 'circle(0% at 92% 6%)' }}
      animate={{ clipPath: 'circle(150% at 92% 6%)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#C8102E]"
      style={FONT}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.16) 0%, rgba(200,16,46,0) 55%)',
        }}
      />

      <div className="relative flex flex-col items-center px-6">
        <div className="relative flex items-center justify-center">
          <div className="pointer-events-none absolute top-1/2 right-full z-0 h-24 w-28 -translate-y-1/2 overflow-hidden sm:h-28 sm:w-36">
            <SpeedTrails />
          </div>

          <div className="relative z-10 flex items-center justify-center">
            <motion.div
              className="absolute size-36 rounded-full border border-white/25 sm:size-44"
              animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.18, 0.4, 0.18] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />

            <motion.div
              className="relative drop-shadow-[0_12px_32px_rgba(0,0,0,0.25)]"
              initial={{ opacity: 0, scale: 0.86 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <LupaMarca size={128} color="#FFFFFF" fill="#C8102E" />
            </motion.div>
          </div>
        </div>

        <motion.p
          className="mt-6 text-[1.65rem] font-extrabold tracking-tight text-white sm:text-[1.85rem]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          ReEncontro
        </motion.p>
      </div>
    </motion.div>
  );
}

function SpeedTrails() {
  const linhas = [52, 86, 38, 72, 46, 64];

  return (
    <div className="pointer-events-none relative flex h-full w-full flex-col items-end justify-center gap-1.5 pr-1">
      {linhas.map((largura, i) => (
        <motion.span
          key={i}
          className="h-1.5 rounded-full bg-white/85"
          style={{ width: largura, transformOrigin: 'right center' }}
          animate={{
            scaleX: [0.15, 1, 0.2],
            opacity: [0, 0.9, 0],
            x: [8, -4, -18],
          }}
          transition={{
            duration: 0.7,
            repeat: Infinity,
            delay: i * 0.09,
            ease: 'easeInOut',
          }}
        />
      ))}
      {[...Array(12)].map((_, i) => (
        <motion.span
          key={`dot-${i}`}
          className="absolute rounded-full bg-white/80"
          style={{
            width: 3 + (i % 3) * 2,
            height: 3 + (i % 3) * 2,
            top: `calc(50% + ${(i - 6) * 6}px)`,
            right: 12 + (i % 5) * 14,
          }}
          animate={{ opacity: [0, 1, 0], x: [8, -6, -22] }}
          transition={{
            duration: 0.75,
            repeat: Infinity,
            delay: i * 0.05,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}
