// =====================================================================
// VerificarEmailModal — digitação do código de 6 dígitos enviado por e-mail.
// Abre depois que o código já foi enviado (quem abre informa expiraEm).
// =====================================================================
import { useEffect, useRef, useState } from 'react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { AlertCircle, CheckCircle, Clock, Loader2, MailCheck, RotateCw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { authApi } from '../../../lib/api';
import { cn } from '../ui/utils';

const FONT = { fontFamily: 'Plus Jakarta Sans, sans-serif' };
const ESPERA_REENVIO_MS = 60 * 1000;

// Erros que exigem pedir um código novo (o atual não serve mais)
const ERROS_TERMINAIS = ['tentativas_esgotadas', 'codigo_expirado', 'sem_codigo'];

// Erro lançado por request() em lib/api.ts: o corpo da resposta vem em `dados`
type ErroApi = Error & { dados?: { codigo?: string } };

interface Props {
  open: boolean;
  email: string;
  /** Momento (ms) em que o código enviado expira. */
  expiraEm: number;
  onClose: () => void;
  onVerificado: (verificadoEm: string) => void;
}

function formatarTempo(segundos: number) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function VerificarEmailModal({ open, email, expiraEm, onClose, onVerificado }: Props) {
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [tipoErro, setTipoErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [expiraLocal, setExpiraLocal] = useState(expiraEm);
  const [reenvioLiberadoEm, setReenvioLiberadoEm] = useState(() => Date.now() + ESPERA_REENVIO_MS);
  const [agora, setAgora] = useState(() => Date.now());
  const [abertoAntes, setAbertoAntes] = useState(open);
  const [expiraAntes, setExpiraAntes] = useState(expiraEm);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cada abertura começa do zero. Quem usa o modal deve montá-lo só quando
  // abre (com key), para que o primeiro render já tenha o prazo certo — senão
  // o campo nasce desabilitado e o foco automático pula para outro botão.
  if (open !== abertoAntes || expiraEm !== expiraAntes) {
    setAbertoAntes(open);
    setExpiraAntes(expiraEm);
    if (open) {
      setCodigo('');
      setErro('');
      setTipoErro('');
      setAviso('');
      setSucesso(false);
      setExpiraLocal(expiraEm);
    }
  }

  // Os prazos que dependem do relógio são reiniciados fora do render
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      setReenvioLiberadoEm(Date.now() + ESPERA_REENVIO_MS);
      setAgora(Date.now());
    }, 0);
    return () => window.clearTimeout(id);
  }, [open, expiraEm]);

  // Relógio dos contadores
  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setAgora(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [open]);

  const restante = Math.max(0, Math.ceil((expiraLocal - agora) / 1000));
  const esperaReenvio = Math.max(0, Math.ceil((reenvioLiberadoEm - agora) / 1000));
  const expirouLocal = restante === 0;
  const precisaNovoCodigo = expirouLocal || ERROS_TERMINAIS.includes(tipoErro);
  const bloqueado = precisaNovoCodigo || sucesso || verificando;

  async function confirmar(valor: string) {
    if (valor.length !== 6 || bloqueado) return;
    setVerificando(true);
    setErro('');
    setTipoErro('');
    setAviso('');
    try {
      const res = await authApi.confirmarCodigoVerificacao(valor);
      setSucesso(true);
      const verificadoEm = res.email_verificado_em ?? new Date().toISOString();
      window.setTimeout(() => {
        onVerificado(verificadoEm);
        onClose();
      }, 1400);
    } catch (err: unknown) {
      const dados = err instanceof Error ? (err as ErroApi).dados : undefined;
      setTipoErro(dados?.codigo ?? '');
      setErro((err instanceof Error && err.message) || 'Não foi possível verificar o código.');
      setCodigo('');
    } finally {
      setVerificando(false);
    }
  }

  async function reenviar() {
    if (esperaReenvio > 0 || reenviando) return;
    setReenviando(true);
    setErro('');
    setTipoErro('');
    setAviso('');
    try {
      const res = await authApi.enviarCodigoVerificacao();
      if (res.ja_verificado) {
        onVerificado(res.email_verificado_em ?? new Date().toISOString());
        onClose();
        return;
      }
      setCodigo('');
      setExpiraLocal(Date.now() + (res.expira_em_segundos ?? 900) * 1000);
      setReenvioLiberadoEm(Date.now() + ESPERA_REENVIO_MS);
      setAviso('Enviamos um novo código. O anterior não vale mais.');
    } catch (err: unknown) {
      setErro((err instanceof Error && err.message) || 'Não foi possível reenviar o código.');
    } finally {
      setReenviando(false);
    }
  }

  const slotClass =
    'h-12 w-10 rounded-xl border border-[#E7E5E4] bg-[#FAFAF8] text-xl font-bold text-[#1C1917] first:rounded-xl first:border-l last:rounded-xl sm:h-14 sm:w-12 sm:text-2xl data-[active=true]:border-[#C8102E] data-[active=true]:ring-[#C8102E]/20';

  return (
    <Dialog open={open} onOpenChange={aberto => !aberto && !sucesso && onClose()}>
      <DialogContent
        onOpenAutoFocus={e => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
        className="w-[calc(100%-1.5rem)] max-w-md rounded-3xl border-0 p-6 shadow-2xl sm:p-8 [&_[data-slot=dialog-close]]:top-5 [&_[data-slot=dialog-close]]:right-5 [&_[data-slot=dialog-close]]:flex [&_[data-slot=dialog-close]]:size-8 [&_[data-slot=dialog-close]]:items-center [&_[data-slot=dialog-close]]:justify-center [&_[data-slot=dialog-close]]:rounded-full [&_[data-slot=dialog-close]]:bg-[#F5F3F0] [&_[data-slot=dialog-close]]:text-[#78716C] [&_[data-slot=dialog-close]]:opacity-100"
        style={FONT}
      >
        {sucesso ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#DCFCE7]">
              <CheckCircle className="size-7 text-[#16A34A]" strokeWidth={2.2} />
            </div>
            <DialogTitle className="text-xl font-bold text-[#1C1917]">E-mail verificado!</DialogTitle>
            <DialogDescription className="mx-auto mt-2 max-w-xs text-sm text-[#78716C]">
              Tudo certo com <span className="font-semibold text-[#1C1917]">{email}</span>.
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader className="pr-8 text-left">
              <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-[#FEE2E2]">
                <MailCheck className="size-5 text-[#C8102E]" strokeWidth={2} />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight text-[#1C1917]">
                Digite o código
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-[#78716C]">
                Enviamos um código de 6 dígitos para
                <span className="my-0.5 block font-semibold [overflow-wrap:break-word] text-[#1C1917]">{email}</span>
                Confira também a caixa de spam.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4 py-2">
              <InputOTP
                ref={inputRef}
                maxLength={6}
                value={codigo}
                onChange={setCodigo}
                onComplete={confirmar}
                pattern={REGEXP_ONLY_DIGITS}
                pasteTransformer={texto => texto.replace(/\D/g, '').slice(0, 6)}
                autoComplete="one-time-code"
                autoFocus
                disabled={bloqueado}
                aria-label="Código de verificação"
                containerClassName="justify-center"
              >
                <InputOTPGroup className="gap-1.5 sm:gap-2">
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className={slotClass}
                      aria-invalid={Boolean(erro) || undefined}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              <div
                className={cn(
                  'flex items-center gap-1.5 text-sm font-medium',
                  expirouLocal ? 'text-[#C8102E]' : restante <= 60 ? 'text-[#D97706]' : 'text-[#78716C]',
                )}
                aria-live="polite"
              >
                {verificando ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Verificando…
                  </>
                ) : (
                  <>
                    <Clock className="size-4" />
                    {expirouLocal ? 'Código expirado' : `Expira em ${formatarTempo(restante)}`}
                  </>
                )}
              </div>
            </div>

            {erro && (
              <div className="flex items-start gap-2 rounded-xl border border-[#FECDD3] bg-[#FFF1F2] px-3.5 py-2.5" role="alert">
                <AlertCircle size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-[#C8102E]" />
                <span className="text-sm font-medium text-[#C8102E]">{erro}</span>
              </div>
            )}
            {!erro && expirouLocal && (
              <div className="flex items-start gap-2 rounded-xl border border-[#FECDD3] bg-[#FFF1F2] px-3.5 py-2.5" role="alert">
                <AlertCircle size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-[#C8102E]" />
                <span className="text-sm font-medium text-[#C8102E]">
                  Este código expirou. Peça um novo código.
                </span>
              </div>
            )}
            {aviso && !erro && (
              <div className="flex items-start gap-2 rounded-xl border border-[#BBF7D0] bg-[#DCFCE7] px-3.5 py-2.5 text-sm text-[#15803D]">
                <CheckCircle size={15} strokeWidth={2} className="mt-0.5 shrink-0" />
                {aviso}
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#78716C] transition-colors hover:bg-[#F5F3F0]"
              >
                Fazer depois
              </button>
              <button
                type="button"
                onClick={reenviar}
                disabled={esperaReenvio > 0 || reenviando}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all',
                  precisaNovoCodigo
                    ? 'bg-[#C8102E] text-white hover:bg-[#A50D26] disabled:bg-[#E7A3AE]'
                    : 'border border-[#E7E5E4] text-[#1C1917] hover:border-[#C8102E]/40 hover:text-[#C8102E] disabled:text-[#A8A29E]',
                  'disabled:cursor-not-allowed',
                )}
              >
                {reenviando ? <Loader2 className="size-4 animate-spin" /> : <RotateCw className="size-4" />}
                {esperaReenvio > 0 ? `Reenviar código em ${esperaReenvio}s` : 'Reenviar código'}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
