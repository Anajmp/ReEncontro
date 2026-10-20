import { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { ParentInputField } from './ParentChrome';
import { BOTAO_PRIMARIO } from './PageBanner';
import { usuariosApi } from '../../../lib/api';

function BotaoMostrar({ visivel, onClick }: { visivel: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[#A8A29E] transition-colors hover:text-[#78716C]"
      aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
    >
      {visivel ? <EyeOff size={15} strokeWidth={1.6} /> : <Eye size={15} strokeWidth={1.6} />}
    </button>
  );
}

/** Cabeçalho + formulário de troca da própria senha (confere a senha atual). */
export function FormAlterarSenha() {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showAtual, setShowAtual] = useState(false);
  const [showNova, setShowNova] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passError, setPassError] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    if (!senhaAtual) { setPassError('Informe a senha atual.'); return; }
    if (novaSenha.length < 6) { setPassError('Nova senha deve ter ao menos 6 caracteres.'); return; }
    if (novaSenha !== confirmar) { setPassError('As senhas não conferem.'); return; }

    setSalvando(true);
    try {
      await usuariosApi.alterarSenha(senhaAtual, novaSenha);
      setPasswordSaved(true);
      setSenhaAtual(''); setNovaSenha(''); setConfirmar('');
      setTimeout(() => setPasswordSaved(false), 2500);
    } catch (err: unknown) {
      setPassError((err instanceof Error && err.message) || 'Erro ao alterar a senha.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
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
          rightElement={<BotaoMostrar visivel={showAtual} onClick={() => setShowAtual(!showAtual)} />}
          type={showAtual ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          value={senhaAtual}
          onChange={e => setSenhaAtual(e.target.value)}
        />
        <ParentInputField
          label="Nova senha"
          leftIcon={<Lock size={15} strokeWidth={1.6} />}
          rightElement={<BotaoMostrar visivel={showNova} onClick={() => setShowNova(!showNova)} />}
          type={showNova ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          value={novaSenha}
          onChange={e => setNovaSenha(e.target.value)}
        />
        <ParentInputField
          label="Confirmar nova senha"
          leftIcon={<Lock size={15} strokeWidth={1.6} />}
          rightElement={<BotaoMostrar visivel={showConf} onClick={() => setShowConf(!showConf)} />}
          type={showConf ? 'text' : 'password'}
          autoComplete="new-password"
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

        <button type="submit" disabled={salvando} className={`w-full ${BOTAO_PRIMARIO} py-3`}>
          Alterar senha
        </button>
      </form>
    </>
  );
}
