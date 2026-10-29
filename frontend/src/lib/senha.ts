const SENHAS_COMUNS = [
  '123456', '1234567', '12345678', '123456789', '1234567890', '12345',
  '111111', '000000', '123123', 'senha', 'senha123', 'password',
  'qwerty', 'abc123', 'admin', 'admin123', 'iloveyou',
];

export type NomeNivel = "Ruim" | "Fraco" | "Médio" | "Forte";

export interface Avaliacao{
  indice: 0 | 1 | 2 | 3;
  nome: NomeNivel;
  dica: string;
}

const NOMES: NomeNivel[] = ['Ruim', 'Fraco', 'Médio', 'Forte'];

export function avaliarSenha(senha:string): Avaliacao {
  const efetiva = senha.replace(/(.)\1{2,}/g, '$1$1');
  const unicos = new Set(senha.toLowerCase()).size;

  const criterios = { 
    tamanho: senha.length >= 8,
    minuscula:/[a-z]/.test(senha),
    maiuscula: /[A-Z]/.test(senha),
    numero: /\d/.test(senha),
    especial: /[^A-Za-z0-9]/.test(senha),
  };

  let pontos = Object.values(criterios).filter(Boolean).length;
  if(efetiva.length >= 12) pontos ++;

  const todosTipos = criterios.minuscula && criterios.maiuscula && criterios.numero && criterios.especial;

  if (!todosTipos) pontos = Math.min(pontos, 4);
  if (pontos >= 5 && (efetiva.length < 10 || unicos < 7)) pontos = 4;
  if (unicos < 4) pontos = Math.min(pontos, 1);
  else if (unicos < 6) pontos = Math.min(pontos, 3);
  if (efetiva.length < 6) pontos = Math.min(pontos, 1);
  if (SENHAS_COMUNS.includes(senha.toLowerCase())) pontos = 0;  

  let indice: 0 | 1 | 2 | 3;
  if(pontos <= 1) indice = 0;
  else if(pontos <= 3) indice = 1;
  else if(pontos === 4) indice = 2;
  else indice = 3;

  let dica = '';
  if(!criterios.tamanho) dica = 'Use pelo menos 8 caracteres.';
  else if(!criterios.maiuscula) dica = 'Adicione uma letra maiúscula';
  else if(!criterios.minuscula) dica = 'Adicione uma letra minúscula';
  else if(!criterios.numero) dica = 'Adicione um número';
  else if(!criterios.especial) dica = 'Adicione um símbolo, como ! ou _.';
  else if(senha.length < 10) dica = 'Adicione um símbolo, como ! ou _.';

  return { indice, nome: NOMES[indice], dica };
}