import { useState } from 'react';
import { UserRound } from 'lucide-react';
import { ParentLayout } from './shared/ParentLayout';
import { BannerIlustracao, CARD, PageBanner } from './shared/PageBanner';
import { useAuth } from '../../contexts/AuthContext';
import type { Screen } from '../App';
import { AvatarPicker } from './shared/AvatarPicker';
import { usuariosApi } from '../../lib/api';
import { FormAlterarSenha } from './shared/FormAlterarSenha';
import { FormDadosPessoais } from './shared/FormDadosPessoais';

interface Props {
  navigate: (s: Screen) => void;
}

export function ParentProfile({ navigate }: Props) {
  const { usuario, atualizarUsuario } = useAuth();
  const [salvandoAvatar, setSalvandoAvatar] = useState(false);

  async function salvarAvatar(seed: string) {
    setSalvandoAvatar(true);
    try {
      await usuariosApi.atualizarAvatar(seed);
      atualizarUsuario({ avatar_seed: seed });
    } catch (err: unknown) {
      alert((err instanceof Error && err.message) || 'Erro ao salvar o avatar');
    } finally {
      setSalvandoAvatar(false);
    }
  }

  return (
    <ParentLayout current="parent-profile" navigate={navigate}>
      <PageBanner
        selo="Conta de responsável"
        titulo={`Olá, ${(usuario?.nome ?? '').split(' ')[0] || 'responsável'}!`}
        ilustracao={<BannerIlustracao Icon={UserRound} />}
      >
        Gerencie seus dados de contato, escolha seu personagem e altere a senha de acesso.
      </PageBanner>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <section className={CARD}>
          <FormDadosPessoais />
        </section>

        <section className={CARD}>
          <FormAlterarSenha />
        </section>

        <section className={`${CARD} lg:col-span-2`}>
          <h2 className="mb-4 text-base font-bold text-tinta">Personagem</h2>
          <AvatarPicker
            seedAtual={usuario?.avatar_seed || usuario?.email || ''}
            onSelecionar={salvarAvatar}
            salvando={salvandoAvatar}
          />
        </section>
      </div>
    </ParentLayout>
  );
}
