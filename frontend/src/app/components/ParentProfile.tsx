import { useState } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { ParentLayout } from './shared/ParentLayout';
import { ParentInputField } from './shared/ParentChrome';
import { useAuth } from '../../contexts/AuthContext';
import type { Screen } from '../App';
import { AvatarPicker } from './shared/AvatarPicker';
import { UserAvatar } from './shared/UserAvatar';
import { usuariosApi } from '../../lib/api';

interface Props {
  navigate: (s: Screen) => void;
}

export function ParentProfile({ navigate }: Props) {
  const { usuario, atualizarUsuario } = useAuth();
  const [nome, setNome] = useState(usuario?.nome ?? '');
  const [email, setEmail] = useState(usuario?.email ?? '');
  const [telefone, setTelefone] = useState(usuario?.telefone ?? '');
  const [saved, setSaved] = useState(false);

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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    if (!senhaAtual) { setPassError('Informe a senha atual.'); return; }
    if (novaSenha.length < 6) { setPassError('Nova senha deve ter ao menos 6 caracteres.'); return; }
    if (novaSenha !== confirmar) { setPassError('As senhas não conferem.'); return; }
    setPasswordSaved(true);
    setSenhaAtual(''); setNovaSenha(''); setConfirmar('');
    setTimeout(() => setPasswordSaved(false), 2500);
  };

  return (
    <ParentLayout current="parent-profile" navigate={navigate}>
      <div className="max-w-xl">
        <div className="mb-6">
          <h1 className="mb-1 text-xl font-extrabold text-[#1C1917]">Meu Perfil</h1>
          <p className="text-sm text-[#78716C]">Gerencie seus dados e senha de acesso.</p>
        </div>

        <div className="mb-4 rounded-2xl border border-black/[0.05] bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-4">
            <UserAvatar
              usuario={usuario ? { ...usuario, avatar_seed: avatarSeed || usuario.avatar_seed } : null}
              size={56}
            />
            <div>
              <p className="font-extrabold text-[#1C1917]">{nome || '—'}</p>
              <p className="text-sm text-[#78716C]">{email}</p>
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
            <ParentInputField
              label="Telefone"
              leftIcon={<Phone size={15} strokeWidth={1.6} />}
              type="tel"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={e => setTelefone(e.target.value)}
            />

            <div className="pt-1">
              {saved && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#BBF7D0] bg-[#DCFCE7] px-4 py-3 text-sm text-[#15803D]">
                  <CheckCircle size={15} strokeWidth={2} />
                  Dados salvos com sucesso!
                </div>
              )}
              <button
                type="submit"
                className="w-full rounded-xl bg-[#C8102E] py-3 text-sm font-bold text-white transition-all hover:bg-[#A50D26] active:scale-[0.98]"
              >
                Salvar alterações
              </button>
            </div>
          </form>
        </div>

        <div className="mb-4 rounded-2xl border border-black/[0.05] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-[#1C1917]">Personagem</h3>
          <AvatarPicker
            seedAtual={avatarSeed}
            onSelecionar={salvarAvatar}
            salvando={salvandoAvatar}
          />
        </div>

        <div className="rounded-2xl border border-black/[0.05] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#FEE2E2]">
              <Lock size={16} strokeWidth={1.7} className="text-[#C8102E]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1C1917]">Alterar senha</p>
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

            <button
              type="submit"
              className="w-full rounded-xl bg-[#C8102E] py-3 text-sm font-bold text-white transition-all hover:bg-[#A50D26] active:scale-[0.98]"
            >
              Alterar senha
            </button>
          </form>
        </div>
      </div>
    </ParentLayout>
  );
}
