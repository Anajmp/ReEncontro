import { useCallback, useEffect, useState } from 'react';

const CHAVE = 'acessibilidade';

export const ESCALAS = [90, 100, 115, 130, 150] as const;
const INDICE_PADRAO = 1;

interface Config{
  indiceFonte: number;
  altoContraste: boolean;
  fonteLegivel: boolean;
}

const PADRAO: Config = {
  indiceFonte: INDICE_PADRAO,
  altoContraste: false,
  fonteLegivel: false,
}

function carregar(): Config {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) || 'null');
    if(
      salvo &&
      Number.isInteger(salvo.indiceFonte) &&
      salvo.indiceFonte >= 0 &&
      salvo.indiceFonte < ESCALAS.length
    ){
      return {
        indiceFonte: salvo.indiceFonte,
        altoContraste: Boolean(salvo.altoContraste),
        fonteLegivel: Boolean(salvo.fonteLegivel),
      }
    }
  } catch {}

  return PADRAO
}

export function useAcessibilidade(){
  const [config, setConfig] = useState<Config>(carregar);

  useEffect(() => {
    const html = document.documentElement;

    html.style.fontSize = `${ESCALAS[config.indiceFonte]}%`;

    html.classList.toggle('alto-contraste', config.altoContraste);
    html.classList.toggle('fonte-legivel', config.fonteLegivel);

    try {
      localStorage.setItem(CHAVE, JSON.stringify(config));
    } catch {}
  }, [config]);

  const aumentarFonte = useCallback(
    () => setConfig(c => ({ ...c, indiceFonte: Math.min(c.indiceFonte + 1, ESCALAS.length - 1)})),
    []
  );

  const diminuirFonte = useCallback(
    () => setConfig(c => ({ ...c, indiceFonte: Math.max(c.indiceFonte - 1, 0)})),
    []
  );

  const alternarContraste = useCallback(
    () => setConfig(c => ({ ...c, altoContraste: !c.altoContraste})),
    []
  );

  const alternarFonteLegivel = useCallback(
    () => setConfig(c => ({ ...c, fonteLegivel: !c.fonteLegivel})),
    []
  );

  const restaurar = useCallback(() => setConfig(PADRAO), []);

  return {
    config,
    percentual: ESCALAS[config.indiceFonte],
    podeAumentar: config.indiceFonte < ESCALAS.length - 1,
    podeDiminuir: config.indiceFonte > 0,
    aumentarFonte,
    diminuirFonte,
    alternarContraste,
    alternarFonteLegivel,
    restaurar
  }
}

