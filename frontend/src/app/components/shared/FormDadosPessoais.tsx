import { useState, type ReactNode } from 'react';
import { User, Mail, Phone, AlertCircle, CheckCircle, BadgeCheck, Loader2, MailWarning } from 'lucide-react';
import { ParentInputField } from './ParentChrome';
import { BOTAO_PRIMARIO } from './PageBanner';
import { UserAvatar } from './UserAvatar';
import { VerificarEmailModal } from './VerificarEmailModal';
import { useAuth } from '../../../contexts/AuthContext';
import { authApi, usuariosApi } from '../../../lib/api';
import { mascararTelefone, validarTelefone } from '../../../lib/telefone';

interface Props {
  /** Conteúdo extra abaixo do nome/e-mail no cabeçalho (ex.: selo do cargo). */
  selo?: ReactNode;
}

/** Cabeçalho com avatar + formulário de nome, e-mail (com verificação) e telefone. */
export function FormDadosPessoais({ selo }: Props) {
  const { usuario, atualizarUsuario } = useAuth();
  const [nome, setNome] = useState(usuario?.nome ?? '');
  const [email, setEmail] = useState(usuario?.email ?? '');
  const [telefone, setTelefone] = useState(mascararTelefone(usuario?.telefone ?? ''));
  const [telefoneErro, setTelefoneErro] = useState('');
  const [saved, setSaved] = useState(false);

  // Verificação de e-mail (informativa: não bloqueia nada)
  const emailVerificado = Boolean(usuario?.email_verificado_em);
  const emailAlterado = email.trim().toLowerCase() !== (usuario?.email ?? '').toLowerCase();
  const [enviandoCodigo, setEnviandoCodigo] = useState(false);
  const [erroVerificacao, setErroVerificacao] = useState('');
  const [modalCodigoAberto, setModalCodigoAberto] = useState(false);
  const [codigoExpiraEm, setCodigoExpiraEm] = useState(0);

  async function iniciarVerificacao() {
    setEnviandoCodigo(true);
    setErroVerificacao('');
    try {
      const res = await authApi.enviarCodigoVerificacao();
      if (res.ja_verificado) {
        atualizarUsuario({ email_verificado_em: res.email_verificado_em ?? new Date().toISOString() });
        return;
      }
      setCodigoExpiraEm(Date.now() + (res.expira_em_segundos ?? 900) * 1000);
      setModalCodigoAberto(true);
    } catch (err: unknown) {
      setErroVerificacao((err instanceof Error && err.message) || 'Não foi possível enviar o código.');
    } finally {
      setEnviandoCodigo(false);
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const erroTel = validarTelefone(telefone);
    setTelefoneErro(erroTel ?? '');
    if (erroTel) return;
    try {
      const res = await usuariosApi.atualizarPerfil({ nome, email, telefone });
      // O backend devolve os dados gravados (telefone só com dígitos e
      // email_verificado_em zerado se o e-mail mudou)
      if (res?.usuario) {
        atualizarUsuario({
          nome: res.usuario.nome,
          email: res.usuario.email,
          telefone: res.usuario.telefone ?? '',
          email_verificado_em: res.usuario.email_verificado_em,
        });
      } else {
        atualizarUsuario({ nome, email, telefone });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      alert((err instanceof Error && err.message) || 'Erro ao salvar');
    }
  };

  return (
    <>
      {modalCodigoAberto && (
        <VerificarEmailModal
          key={codigoExpiraEm}
          open={modalCodigoAberto}
          email={usuario?.email ?? email}
          expiraEm={codigoExpiraEm}
          onClose={() => setModalCodigoAberto(false)}
          onVerificado={verificadoEm => atualizarUsuario({ email_verificado_em: verificadoEm })}
        />
      )}

      <div className="mb-5 flex items-center gap-4">
        <UserAvatar usuario={usuario} size={56} />
        <div className="min-w-0">
          <p className="truncate font-extrabold text-[#1C1917]">{nome || '—'}</p>
          <p className="truncate text-sm text-[#78716C]">{email}</p>
          {selo && <div className="mt-1">{selo}</div>}
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-4">
        <ParentInputField
          label="Nome completo"
          leftIcon={<User size={15} strokeWidth={1.6} />}
          type="text"
          value={nome}
          onChange={e => setNome(e.target.value)}
        />
        <ParentInputField
          label="E-mail"
          leftIcon={<Mail size={15} strokeWidth={1.6} />}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        {emailVerificado && !emailAlterado ? (
          <p className="-mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#15803D]">
            <BadgeCheck size={14} strokeWidth={2} /> E-mail verificado
          </p>
        ) : (
          <div className="-mt-2 space-y-2">
            {emailAlterado ? (
              <p className="text-xs text-[#78716C]">
                Salve o novo e-mail para poder verificá-lo.
              </p>
            ) : (
              <div className="flex flex-col gap-2 rounded-xl border border-[#FECDD3] bg-[#FFF1F2] px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium text-[#C8102E]">
                  <MailWarning size={14} strokeWidth={2} className="shrink-0" />
                  Seu e-mail ainda não foi verificado.
                </span>
                <button
                  type="button"
                  onClick={iniciarVerificacao}
                  disabled={enviandoCodigo}
                  className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#C8102E] px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-[#A50D26] disabled:opacity-60"
                >
                  {enviandoCodigo && <Loader2 size={13} className="animate-spin" />}
                  Verificar e-mail
                </button>
              </div>
            )}
            {erroVerificacao && (
              <div className="flex items-center gap-1.5 rounded-lg border border-[#FECDD3] bg-[#FFF1F2] px-3 py-1.5">
                <AlertCircle size={12} strokeWidth={2} className="shrink-0 text-[#C8102E]" />
                <span className="text-xs font-medium text-[#C8102E]">{erroVerificacao}</span>
              </div>
            )}
          </div>
        )}
        <ParentInputField
          label="Telefone"
          leftIcon={<Phone size={15} strokeWidth={1.6} />}
          type="tel"
          inputMode="numeric"
          placeholder="(19) 99999-9999"
          value={telefone}
          onChange={e => {
            setTelefone(mascararTelefone(e.target.value));
            if (telefoneErro) setTelefoneErro('');
          }}
          onBlur={() => setTelefoneErro(validarTelefone(telefone) ?? '')}
          error={telefoneErro || undefined}
          aria-invalid={Boolean(telefoneErro) || undefined}
        />

        <div className="pt-1">
          {saved && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#BBF7D0] bg-[#DCFCE7] px-4 py-3 text-sm text-[#15803D]">
              <CheckCircle size={15} strokeWidth={2} />
              Dados salvos com sucesso!
            </div>
          )}
          <button type="submit" className={`w-full ${BOTAO_PRIMARIO} py-3`}>
            Salvar alterações
          </button>
        </div>
      </form>
    </>
  );
}
