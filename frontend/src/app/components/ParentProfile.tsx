import { useState } from 'react';
import { User, UserRound, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, CheckCircle, BadgeCheck, Loader2, MailWarning } from 'lucide-react';
import { ParentLayout } from './shared/ParentLayout';
import { ParentInputField } from './shared/ParentChrome';
import { BannerIlustracao, BOTAO_PRIMARIO, CARD, PageBanner } from './shared/PageBanner';
import { useAuth } from '../../contexts/AuthContext';
import type { Screen } from '../App';
import { AvatarPicker } from './shared/AvatarPicker';
import { UserAvatar } from './shared/UserAvatar';
import { authApi, usuariosApi } from '../../lib/api';
import { mascararTelefone, validarTelefone } from '../../lib/telefone';
import { VerificarEmailModal } from './shared/VerificarEmailModal';

interface Props {
  navigate: (s: Screen) => void;
}

export function ParentProfile({ navigate }: Props) {
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
    } catch (err: any) {
      setErroVerificacao(err.message || 'Não foi possível enviar o código.');
    } finally {
      setEnviandoCodigo(false);
    }
  }

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showAtual, setShowAtual] = useState(false);
  const [showNova, setShowNova] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passError, setPassError] = useState('');

  const [avatarSeed, setAvatarSeed] = useState(
    usuario?.avatar_seed || usuario?.email || '',
  );
  const [salvandoAvatar, setSalvandoAvatar] = useState(false);

  async function salvarAvatar(seed: string) {
    setSalvandoAvatar(true);
    try {
      await usuariosApi.atualizarAvatar(seed);
      setAvatarSeed(seed);
      atualizarUsuario({ avatar_seed: seed });
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar o avatar');
    } finally {
      setSalvandoAvatar(false);
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
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar');
    }
  };

    const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    if (!senhaAtual) { setPassError('Informe a senha atual.'); return; }
    if (novaSenha.length < 6) { setPassError('Nova senha deve ter ao menos 6 caracteres.'); return; }
    if (novaSenha !== confirmar) { setPassError('As senhas não conferem.'); return; }

    try {
      await usuariosApi.alterarSenha(senhaAtual, novaSenha);
      setPasswordSaved(true);
      setSenhaAtual(''); setNovaSenha(''); setConfirmar('');
      setTimeout(() => setPasswordSaved(false), 2500);
    } catch (err: any) {
      setPassError(err.message || 'Erro ao alterar a senha.');
    }
  };

  return (
    <ParentLayout current="parent-profile" navigate={navigate}>
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
      <PageBanner
        selo="Conta de responsável"
        titulo={`Olá, ${(nome || usuario?.nome || '').split(' ')[0] || 'responsável'}!`}
        ilustracao={<BannerIlustracao Icon={UserRound} />}
      >
        Gerencie seus dados de contato, escolha seu personagem e altere a senha de acesso.
      </PageBanner>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <section className={CARD}>
          <div className="mb-5 flex items-center gap-4">
            <UserAvatar
              usuario={usuario ? { ...usuario, avatar_seed: avatarSeed || usuario.avatar_seed } : null}
              size={56}
            />
            <div className="min-w-0">
              <p className="truncate font-extrabold text-[#1C1917]">{nome || '—'}</p>
              <p className="truncate text-sm text-[#78716C]">{email}</p>
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
        </section>

        <section className={CARD}>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#FEE2E2]">
              <Lock size={16} strokeWidth={1.7} className="text-[#C8102E]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1C1917]">Alterar senha</h2>
              <p className="text-xs text-[#A8A29E]">Escolha uma senha segura</p>
            </div>
          </div>

          <form onSubmit={handleSavePassword} className="space-y-4">
            <ParentInputField
              label="Senha atual"
              leftIcon={<Lock size={15} strokeWidth={1.6} />}
              rightElement={
                <button type="button" onClick={() => setShowAtual(!showAtual)} className="text-[#A8A29E] transition-colors hover:text-[#78716C]">
                  {showAtual ? <EyeOff size={15} strokeWidth={1.6} /> : <Eye size={15} strokeWidth={1.6} />}
                </button>
              }
              type={showAtual ? 'text' : 'password'}
              placeholder="••••••••"
              value={senhaAtual}
              onChange={e => setSenhaAtual(e.target.value)}
            />
            <ParentInputField
              label="Nova senha"
              leftIcon={<Lock size={15} strokeWidth={1.6} />}
              rightElement={
                <button type="button" onClick={() => setShowNova(!showNova)} className="text-[#A8A29E] transition-colors hover:text-[#78716C]">
                  {showNova ? <EyeOff size={15} strokeWidth={1.6} /> : <Eye size={15} strokeWidth={1.6} />}
                </button>
              }
              type={showNova ? 'text' : 'password'}
              placeholder="Mínimo 6 caracteres"
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
            />
            <ParentInputField
              label="Confirmar nova senha"
              leftIcon={<Lock size={15} strokeWidth={1.6} />}
              rightElement={
                <button type="button" onClick={() => setShowConf(!showConf)} className="text-[#A8A29E] transition-colors hover:text-[#78716C]">
                  {showConf ? <EyeOff size={15} strokeWidth={1.6} /> : <Eye size={15} strokeWidth={1.6} />}
                </button>
              }
              type={showConf ? 'text' : 'password'}
              placeholder="Repita a nova senha"
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
            />

            {passError && (
              <div className="flex items-center gap-2 rounded-xl border border-[#FECDD3] bg-[#FFF1F2] px-4 py-3 text-sm text-[#C8102E]">
                <AlertCircle size={14} strokeWidth={1.8} />
                {passError}
              </div>
            )}
            {passwordSaved && (
              <div className="flex items-center gap-2 rounded-xl border border-[#BBF7D0] bg-[#DCFCE7] px-4 py-3 text-sm text-[#15803D]">
                <CheckCircle size={14} strokeWidth={2} />
                Senha alterada com sucesso!
              </div>
            )}

            <button type="submit" className={`w-full ${BOTAO_PRIMARIO} py-3`}>
              Alterar senha
            </button>
          </form>
        </section>

        <section className={`${CARD} lg:col-span-2`}>
          <h2 className="mb-4 text-base font-bold text-[#1C1917]">Personagem</h2>
          <AvatarPicker
            seedAtual={avatarSeed}
            onSelecionar={salvarAvatar}
            salvando={salvandoAvatar}
          />
        </section>
      </div>
    </ParentLayout>
  );
}
