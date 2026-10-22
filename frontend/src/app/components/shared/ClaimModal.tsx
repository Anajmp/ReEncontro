// =====================================================================
// Modal "Este item é meu" — reivindicação de um item. Usado na listagem
// pública e no detalhe do item. Envia de verdade (reivindicacoesApi.criar),
// preenche os dados de quem está logado e deixa escolher o aluno.
// =====================================================================
import { useState, useEffect, useCallback, type MouseEvent } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { reivindicacoesApi, alunosApi } from '../../../lib/api';
import type { ItemTela } from '../../../lib/api';
import { getUsuario } from '../../../lib/auth';
import { mascararTelefone, validarTelefone } from '../../../lib/telefone';
import { getCatConfig } from './categorias';

const FONT = { fontFamily: 'Plus Jakarta Sans, sans-serif' };

// Formato de alunosApi.listarMeus() (traduzirAluno em lib/api.ts)
interface AlunoResumo {
  id: number;
  name: string;
  room: string;
  period: string;
  periodoRaw?: string;
}

const periodoMap: Record<string, string> = {
  Manhã: 'manha',
  Tarde: 'tarde',
  Integral: 'integral',
};

export function ClaimModal({
  item,
  open,
  onClose,
  onCadastrar,
}: {
  // Só o que o modal mostra e envia: serve tanto o item da listagem quanto o do detalhe
  item: Pick<ItemTela, 'id' | 'name' | 'category' | 'location' | 'date'> | null;
  open: boolean;
  onClose: () => void;
  onCadastrar: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
  const usuario = getUsuario();
  const [submitted, setSubmitted] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [telefoneErro, setTelefoneErro] = useState('');
  const [nomeAluno, setNomeAluno] = useState('');
  const [sala, setSala] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [alunos, setAlunos] = useState<AlunoResumo[]>([]);
  const [alunoId, setAlunoId] = useState('');
  const [abertoAntes, setAbertoAntes] = useState(false);

  // Só usa setters (estáveis) e o periodoMap do módulo: identidade fixa,
  // então pode entrar nas deps do efeito sem fazê-lo rodar de novo
  const selecionarAluno = useCallback((aluno: AlunoResumo) => {
    setAlunoId(String(aluno.id));
    setNomeAluno(aluno.name);
    setSala(aluno.room);
    setPeriodo(periodoMap[aluno.period] || aluno.periodoRaw || aluno.period);
  }, [setAlunoId, setNomeAluno, setSala, setPeriodo]);

  function trocarAluno(id: string) {
    if (id === 'outro') {
      setAlunoId('outro');
      setNomeAluno('');
      setSala('');
      setPeriodo('');
      return;
    }
    const aluno = alunos.find(a => String(a.id) === id);
    if (aluno) selecionarAluno(aluno);
  }

  // Ao abrir: preenche com os dados do usuário logado (ou limpa os alunos)
  if (open !== abertoAntes) {
    setAbertoAntes(open);
    if (open) {
      if (usuario) {
        setNome(usuario.nome || '');
        setEmail(usuario.email || '');
        setTelefone(mascararTelefone(usuario.telefone || ''));
      } else {
        setAlunos([]);
        setAlunoId('');
      }
    }
  }

  // Ao abrir com alguém logado: carrega os alunos dele. O usuário é lido do
  // localStorage aqui dentro (getUsuario() devolve um objeto novo a cada
  // render, então como dependência faria o efeito rodar sempre).
  useEffect(() => {
    if (!open || !getUsuario()) return;

    alunosApi.listarMeus()
      .then((lista: AlunoResumo[]) => {
        setAlunos(lista);
        if (lista.length === 1) {
          selecionarAluno(lista[0]);
        }
      })
      .catch(err => console.error('Erro ao carregar alunos:', err));
  }, [open, selecionarAluno]);

  if (!item) return null;

  const cfg = getCatConfig(item.category);
  const CatIcon = cfg.Icon;
  const mostrarSeletor = Boolean(usuario && alunos.length > 1);
  const alunoTravado = Boolean(alunoId && alunoId !== 'outro');

  async function enviar() {
    setErro('');
    if (!item) return;
    if (!nome || !email || !nomeAluno || !sala || !periodo) {
      setErro('Preencha todos os campos obrigatórios (*)');
      return;
    }
    const erroTel = validarTelefone(telefone);
    setTelefoneErro(erroTel ?? '');
    if (erroTel) return;
    setEnviando(true);
    try {
      await reivindicacoesApi.criar({
        item_id: item.id,
        aluno_id: alunoId && alunoId !== 'outro' ? Number(alunoId) : undefined,
        nome_requerente: nome,
        email_requerente: email,
        telefone_requerente: telefone || undefined,
        nome_aluno: nomeAluno,
        sala_aluno: sala,
        periodo_aluno: periodo,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setErro((err instanceof Error && err.message) || 'Erro ao enviar reivindicação');
    } finally {
      setEnviando(false);
    }
  }

  function fechar() {
    onClose();
    setSubmitted(false);
    setErro('');
    setTelefoneErro('');
    if (!usuario) {
      setNome('');
      setEmail('');
      setTelefone('');
    }
    setNomeAluno('');
    setSala('');
    setPeriodo('');
    setAlunoId('');
  }

  const modalClass =
    'max-w-lg rounded-3xl border-0 p-8 shadow-2xl [&_[data-slot=dialog-close]]:top-5 [&_[data-slot=dialog-close]]:right-5 [&_[data-slot=dialog-close]]:flex [&_[data-slot=dialog-close]]:size-8 [&_[data-slot=dialog-close]]:items-center [&_[data-slot=dialog-close]]:justify-center [&_[data-slot=dialog-close]]:rounded-full [&_[data-slot=dialog-close]]:bg-fundo [&_[data-slot=dialog-close]]:text-tinta-suave [&_[data-slot=dialog-close]]:opacity-100 hover:[&_[data-slot=dialog-close]]:bg-fundo-forte';

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={fechar}>
        <DialogContent className={modalClass} style={FONT}>
          <div className="py-4 text-center">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-sucesso-fundo">
              <Check className="size-6 text-sucesso-texto" strokeWidth={2.5} />
            </div>
            <DialogTitle className="text-xl font-bold text-tinta">Reivindicação enviada</DialogTitle>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-tinta-suave">
              Você receberá um e-mail em breve. Nossa equipe vai entrar em contato para confirmar a retirada.
            </p>
            <button
              type="button"
              className="mt-6 rounded-xl bg-[#C8102E] px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#A50D26] active:scale-[0.98]"
              onClick={fechar}
            >
              Fechar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={modalClass} style={FONT}>
        <DialogHeader className="pr-8 text-left">
          <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-marca-clara">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#C8102E" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="10" cy="10" r="7" />
              <path d="M15.5 15.5 L20 20" />
            </svg>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-tinta">Este item é meu</DialogTitle>
          <p className="text-sm leading-relaxed text-tinta-suave">
            Reivindicando: <span className="font-semibold text-tinta">{item.name}</span>
          </p>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-xl border border-contorno p-3" style={{ backgroundColor: `${cfg.bg}55` }}>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
            <CatIcon size={20} strokeWidth={1.6} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-tinta">{item.name}</p>
            <p className="text-xs text-tinta-suave">{item.location} · {item.date}</p>
          </div>
        </div>

        {!usuario && (
          <div className="rounded-xl border border-alerta-borda bg-alerta-fundo px-3.5 py-3 text-sm text-alerta-texto">
            Quer acompanhar o status pelo site?{' '}
            <button
              type="button"
              className="font-semibold text-marca-texto underline-offset-2 hover:underline"
              onClick={onCadastrar}
            >
              Cadastre-se
            </button>{' '}
            antes de reivindicar.
          </div>
        )}

        <div className="space-y-4 py-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="claim-name" className="font-semibold text-tinta">Nome completo *</Label>
              <Input id="claim-name" autoComplete="name" aria-required placeholder="Seu nome completo" value={nome} onChange={e => setNome(e.target.value)} className="rounded-xl border-linha" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="claim-email" className="font-semibold text-tinta">E-mail *</Label>
              <Input id="claim-email" type="email" autoComplete="email" aria-required placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl border-linha" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="claim-phone" className="font-semibold text-tinta">
              Telefone <span className="font-normal text-tinta-suave">(opcional)</span>
            </Label>
            <Input
              id="claim-phone"
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              placeholder="(19) 99999-9999"
              value={telefone}
              onChange={e => {
                setTelefone(mascararTelefone(e.target.value));
                if (telefoneErro) setTelefoneErro('');
              }}
              onBlur={() => setTelefoneErro(validarTelefone(telefone) ?? '')}
              aria-invalid={Boolean(telefoneErro) || undefined}
              aria-describedby={telefoneErro ? 'claim-phone-erro' : undefined}
              className={`rounded-xl ${telefoneErro ? 'border-erro-borda-forte' : 'border-linha'}`}
            />
            {telefoneErro && (
              <div id="claim-phone-erro" role="alert" className="flex items-center gap-1.5 rounded-lg border border-erro-borda bg-erro-fundo px-3 py-1.5">
                <AlertCircle size={12} strokeWidth={2} className="shrink-0 text-marca-texto" />
                <span className="text-xs font-medium text-marca-texto">{telefoneErro}</span>
              </div>
            )}
          </div>

          {mostrarSeletor && (
            <div className="space-y-1.5">
              <Label htmlFor="claim-aluno" className="font-semibold text-tinta">Qual aluno? *</Label>
              <Select value={alunoId} onValueChange={trocarAluno}>
                <SelectTrigger id="claim-aluno" className="rounded-xl border-linha">
                  <SelectValue placeholder="Selecione o aluno" />
                </SelectTrigger>
                <SelectContent>
                  {alunos.map(a => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.name} — {a.room} · {a.period}
                    </SelectItem>
                  ))}
                  <SelectItem value="outro">Outro aluno (preencher manualmente)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="claim-student" className="font-semibold text-tinta">Nome do aluno *</Label>
              <Input
                id="claim-student"
                aria-required
                placeholder="Nome completo do aluno"
                value={nomeAluno}
                onChange={e => setNomeAluno(e.target.value)}
                disabled={alunoTravado}
                className="rounded-xl border-linha disabled:bg-fundo"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="claim-room" className="font-semibold text-tinta">Sala *</Label>
              <Input
                id="claim-room"
                aria-required
                placeholder="Ex: 5A"
                value={sala}
                onChange={e => setSala(e.target.value)}
                disabled={alunoTravado}
                className="rounded-xl border-linha disabled:bg-fundo"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="claim-periodo" className="font-semibold text-tinta">Período *</Label>
            <Select value={periodo} onValueChange={setPeriodo} disabled={alunoTravado}>
              <SelectTrigger id="claim-periodo" aria-required className="rounded-xl border-linha disabled:bg-fundo">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manha">Manhã</SelectItem>
                <SelectItem value="tarde">Tarde</SelectItem>
                <SelectItem value="integral">Integral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {erro && (
            <p role="alert" className="rounded-xl bg-erro-fundo px-3 py-2 text-sm text-marca-texto">{erro}</p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-fundo pt-4 sm:flex-row sm:gap-3">
          <Button variant="outline" className="flex-1 rounded-xl border-linha" onClick={onClose} disabled={enviando}>
            Cancelar
          </Button>
          <Button className="flex-1 rounded-xl bg-[#C8102E] hover:bg-[#A50D26] active:scale-[0.98]" onClick={enviar} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar reivindicação'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
