import { useState, type ElementType, type ReactNode } from 'react';
import { AtSign, BadgeCheck, KeyRound, MailWarning, ShieldCheck } from 'lucide-react';
import { AdminLayout } from './shared/AdminLayout';
import { CARD } from './shared/PageBanner';
import { AvatarPicker } from './shared/AvatarPicker';
import { FormAlterarSenha } from './shared/FormAlterarSenha';
import { FormDadosPessoais } from './shared/FormDadosPessoais';
import { useAuth } from '../../contexts/AuthContext';
import { usuariosApi } from '../../lib/api';
import { avatarDiretora, SEED_INSTITUCIONAL } from '../../lib/avatar';
import type { Screen } from '../App';

interface Props {
  navigate: (s: Screen) => void;
}

const PERMISSOES = ['Operação de itens', 'Relatórios', 'Gestão de funcionárias', 'Privacidade (LGPD)'];

function Credencial({ Icon, rotulo, children }: { Icon: ElementType; rotulo: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl bg-[#FAFAF8] p-3.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#FEE2E2]">
        <Icon size={15} strokeWidth={1.8} className="text-[#C8102E]" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold tracking-wider text-[#A8A29E] uppercase">{rotulo}</p>
        <div className="mt-0.5 text-sm font-semibold text-[#1C1917]">{children}</div>
      </div>
    </div>
  );
}

/** Área "Pessoal" da diretora: credenciais, dados de contato, senha e personagem. */
export function AdminProfile({ navigate }: Props) {
  const { usuario, atualizarUsuario } = useAuth();
  const [salvandoAvatar, setSalvandoAvatar] = useState(false);
  const emailVerificado = Boolean(usuario?.email_verificado_em);

  async function salvarAvatar(seed: string) {
    setSalvandoAvatar(true);
    try {
      await usuariosApi.atualizarAvatar(seed);
      atualizarUsuario({ avatar_seed: seed });
    } catch (err: unknown) {
      alert((err instanceof Error && err.message) || 'Erro ao salvar o personagem');
    } finally {
      setSalvandoAvatar(false);
    }
  }

  return (
    <AdminLayout current="admin-profile" navigate={navigate}>
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <section className={`${CARD} lg:col-span-2`}>
          <h2 className="mb-4 text-base font-bold text-[#1C1917]">Credenciais de acesso</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Credencial Icon={AtSign} rotulo="Login">
              <span className="block truncate">{usuario?.email ?? '—'}</span>
            </Credencial>
            <Credencial Icon={emailVerificado ? BadgeCheck : MailWarning} rotulo="E-mail">
              {emailVerificado ? (
                <span className="text-[#15803D]">Verificado</span>
              ) : (
                <span className="text-[#C8102E]">Não verificado</span>
              )}
            </Credencial>
            <Credencial Icon={ShieldCheck} rotulo="Perfil de acesso">
              Diretora
            </Credencial>
            <Credencial Icon={KeyRound} rotulo="Senha">
              <span className="tracking-widest">••••••••</span>
            </Credencial>
          </div>
          <p className="mt-4 text-xs text-[#78716C]">
            Acesso completo: {PERMISSOES.join(' · ')}.
          </p>
        </section>

        <section className={CARD}>
          <FormDadosPessoais
            selo={
              <span className="inline-flex rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[10px] font-bold text-[#C8102E]">
                Diretora
              </span>
            }
          />
        </section>

        <section className={CARD}>
          <FormAlterarSenha />
        </section>

        <section className={`${CARD} lg:col-span-2`}>
          <h2 className="mb-1 text-base font-bold text-[#1C1917]">Personagem</h2>
          <p className="mb-4 text-sm text-[#78716C]">
            O primeiro é o personagem institucional. Ele aparece no menu, no cabeçalho e na gestão de funcionárias.
          </p>
          <AvatarPicker
            seedAtual={usuario?.avatar_seed || SEED_INSTITUCIONAL}
            onSelecionar={salvarAvatar}
            salvando={salvandoAvatar}
            urlDoSeed={avatarDiretora}
            opcoesFixas={[SEED_INSTITUCIONAL]}
          />
        </section>
      </div>
    </AdminLayout>
  );
}
