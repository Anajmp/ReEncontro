import { useCallback, useEffect, useRef, useState } from "react";

export function useLeituraEmVoz(){
  const suportado = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const [lendo, setLendo] = useState(false);

  const leituraAtual = useRef(0);

  const parar = useCallback(() => {
    if(!suportado) return;
    leituraAtual.current++;
    window.speechSynthesis.cancel();
    setLendo(false);
  }, [suportado]);

  const ler = useCallback(
    (texto: string) => {
      if(!suportado) return;

      const limpo = texto.replace(/\s+/g, '').trim();
      if(!limpo) return;

      window.speechSynthesis.cancel();
      const id = ++leituraAtual.current;

      const trechos = limpo.match(/[^.!?]+[.!?]*/g) ?? [limpo];

      trechos.forEach((trecho, i) => {
        const fala = new SpeechSynthesisUtterance(trecho.trim());
        fala.lang = 'pt-BR';
        fala.rate = 1;

        if(i === trechos.length - 1){
          const terminar = () => {
            if(leituraAtual.current === id) setLendo(false);
          };
          fala.onend = terminar;
          fala.onerror = terminar;
        }
        window.speechSynthesis.speak(fala);
      })
    },
    [suportado]
  );

  const lerPagina = useCallback(() => {
    const selecionado = window.getSelection()?.toString() ?? '';
    const principal = document.querySelector('main') as HTMLElement | null;
    ler(selecionado.trim() ? selecionado : principal?.innerText ?? document.body.innerText);
  }, [ler]);

  useEffect(() => parar, [parar]);

  return { suportado, lendo, lerPagina, parar };
}