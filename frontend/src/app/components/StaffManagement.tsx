import { useState, useEffect } from 'react';
import { Plus, Pencil, Power } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AdminLayout } from './shared/AdminLayout';
import {
  AdminPanel, adminBtnPrimary, adminBtnOutline, adminInputClass, adminSelectClass,
} from './shared/AdminChrome';
import { avatarDiretora, avatarFuncionaria } from '../../lib/avatar';
import type { Screen } from '../App';
import { usuariosApi } from '../../lib/api';

interface Props {
  navigate: (s: Screen) => void;
}

// Funcionária no formato da tela (usuariosApi.listarFuncionarias → traduzirFuncionaria)
interface Funcionaria {
  id: number;
  name: string;
  email: string;
  phone: string;
  isDiretora: boolean;
  avatarSeed: string | null;
  role: string;
  active: boolean;
  lastLogin: string;
}

// Corpo enviado ao criar/editar funcionária
interface DadosFuncionaria {
  nome: string;
  email: string;
  telefone?: string;
  is_diretora: boolean;
}

function StaffModal({
  open, onClose, member, onSaved,
}: {
  open: boolean;
  onClose: () => void;
  member?: Funcionaria;
  onSaved: () => void;
}) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [perfil, setPerfil] = useState('inspetora');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Preenche o formulário ao abrir (ou ao trocar a funcionária editada).
  // Ajuste durante o render comparando com o valor anterior, sem efeito.
  const [anterior, setAnterior] = useState<{ open: boolean; member?: Funcionaria }>({ open: false });
  if (open !== anterior.open || member !== anterior.member) {
    setAnterior({ open, member });
    if (open) {
      setNome(member?.name ?? '');
      setEmail(member?.email ?? '');
      setTelefone(member?.phone ?? '');
      setPerfil(member?.isDiretora ? 'diretora' : 'inspetora');
      setSenha('');
      setErro('');
    }
  }

  async function salvar() {
    setErro('');
    if (!nome.trim() || !email.trim()) {
      setErro('Preencha o nome e o e-mail.');
      return;
    }
    if (!member && senha.length < 6) {
      setErro('A senha inicial deve ter ao menos 6 caracteres.');
      return;
    }

    setSalvando(true);
    try {
      const dados: DadosFuncionaria = {
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim() || undefined,
        is_diretora: perfil === 'diretora',
      };

      if (member?.id) {
        await usuariosApi.atualizar(member.id, dados);
      } else {
        await usuariosApi.criar({ ...dados, senha });
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      setErro((err instanceof Error && err.message) || 'Erro ao salvar a funcionária.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl border-linha">
        <DialogHeader>
          <DialogTitle className="text-tinta">
            {member ? 'Editar funcionária' : 'Adicionar funcionária'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="func-nome" className="text-sm font-semibold text-tinta">Nome completo *</Label>
            <Input id="func-nome" autoComplete="off" className={adminInputClass} placeholder="Nome completo"
              value={nome} onChange={e => setNome(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="func-email" className="text-sm font-semibold text-tinta">E-mail institucional *</Label>
            <Input id="func-email" autoComplete="off" className={adminInputClass} type="email" placeholder="nome@sesi.br"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="func-telefone" className="text-sm font-semibold text-tinta">Telefone</Label>
              <Input id="func-telefone" type="tel" autoComplete="off" className={adminInputClass} placeholder="(19) 99999-9999"
                value={telefone} onChange={e => setTelefone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="func-perfil" className="text-sm font-semibold text-tinta">Perfil *</Label>
              <Select value={perfil} onValueChange={setPerfil}>
                <SelectTrigger id="func-perfil" className={adminSelectClass}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inspetora">Inspetora</SelectItem>
                  <SelectItem value="diretora">Diretora</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {!member && (
            <div className="space-y-1.5">
              <Label htmlFor="func-senha" className="text-sm font-semibold text-tinta">Senha inicial *</Label>
              <Input id="func-senha" aria-describedby="func-senha-dica" autoComplete="new-password" className={adminInputClass} type="password" placeholder="Mínimo 6 caracteres"
                value={senha} onChange={e => setSenha(e.target.value)} />
              <p id="func-senha-dica" className="text-xs text-tinta-suave">Informe esta senha à funcionária para o primeiro acesso.</p>
            </div>
          )}

          {erro && (
            <p role="alert" className="rounded-xl bg-erro-fundo px-4 py-2.5 text-sm text-marca-texto">{erro}</p>
          )}
        </div>
        <div className="mt-1 flex gap-3 border-t border-linha pt-3">
          <Button variant="outline" className={`flex-1 ${adminBtnOutline}`} onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button className={`flex-1 ${adminBtnPrimary}`} onClick={salvar} disabled={salvando}>
            {salvando ? 'Salvando...' : member ? 'Salvar alterações' : 'Adicionar funcionária'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function StaffManagement({ navigate }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Funcionaria | undefined>();
  const [staff, setStaff] = useState<Funcionaria[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca a lista; só mexe no estado depois da resposta
  function buscar() {
    return usuariosApi.listarFuncionarias()
      .then((lista: Funcionaria[]) => setStaff(lista))
      .catch(err => console.error('Erro ao carregar funcionárias:', err))
      .finally(() => setLoading(false));
  }

  async function carregar() {
    setLoading(true);
    await buscar();
  }

  // loading já começa true, então a primeira carga não precisa ligá-lo
  useEffect(() => { buscar(); }, []);

  async function alternarStatus(member: Funcionaria) {
    const acao = member.active ? 'desativar' : 'ativar';
    if (!confirm(`Deseja ${acao} a conta de ${member.name}?`)) return;
    try {
      await usuariosApi.alterarStatus(member.id, !member.active);
      carregar();
    } catch (err: unknown) {
      alert((err instanceof Error && err.message) || 'Erro ao alterar o status');
    }
  }

  return (
    <AdminLayout current="staff-management" navigate={navigate}>
      <div className="space-y-5">
        <div className="flex items-center justify-end">
          <Button size="sm" className={`gap-2 ${adminBtnPrimary}`}
            onClick={() => { setEditing(undefined); setModalOpen(true); }}>
            <Plus className="size-4" />
            Adicionar funcionária
          </Button>
        </div>

        <div className="rounded-xl border border-alerta-fundo bg-alerta-fundo/50 px-4 py-3 text-sm text-alerta-texto">
          Você está logada como <strong>Diretora</strong>. Esta tela é acessível apenas para o perfil de Diretora.
        </div>

        <AdminPanel className="overflow-hidden">
          {/* Lista em cards — mobile */}
          <div className="divide-y divide-linha lg:hidden">
            {staff.map(member => (
              <div key={member.id} className="flex items-center gap-3 p-4">
                <img
                  src={member.isDiretora ? avatarDiretora(member.avatarSeed) : avatarFuncionaria(member.avatarSeed || member.email || String(member.id))}
                  alt=""
                  className="size-10 shrink-0 rounded-full border border-linha bg-superficie"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-tinta">{member.name}</p>
                  <p className="truncate text-xs text-tinta-suave">{member.email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={member.isDiretora
                        ? { backgroundColor: '#FEE2E2', color: '#C8102E' }
                        : { backgroundColor: '#F5F5F4', color: '#6E6762' }}>
                      {member.role}
                    </span>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={member.active
                        ? { backgroundColor: '#D1FAE5', color: '#047857' }
                        : { backgroundColor: '#F5F5F4', color: '#6E6762' }}>
                      {member.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-tinta-suave">Último acesso: {member.lastLogin}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" title="Editar" aria-label={`Editar ${member.name}`}
                    className="rounded-lg p-1.5 text-tinta-suave transition-colors hover:bg-fundo hover:text-tinta"
                    onClick={() => { setEditing(member); setModalOpen(true); }}>
                    <Pencil className="size-3.5" />
                  </button>
                  <button type="button"
                    title={member.active ? 'Desativar conta' : 'Ativar conta'}
                    aria-label={`${member.active ? 'Desativar' : 'Ativar'} a conta de ${member.name}`}
                    className="rounded-lg p-1.5 text-tinta-suave transition-colors hover:bg-marca-clara hover:text-marca-texto"
                    onClick={() => alternarStatus(member)}>
                    <Power className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tabela — desktop */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <caption className="sr-only">Funcionárias</caption>
              <thead>
                <tr className="border-b border-linha bg-fundo/60">
                  <th className="px-5 py-3 text-left text-[11px] font-bold tracking-wide text-tinta-suave uppercase">Funcionária</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-tinta-suave uppercase">E-mail</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-tinta-suave uppercase">Perfil</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-tinta-suave uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-tinta-suave uppercase">Último acesso</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold tracking-wide text-tinta-suave uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linha">
                {staff.map(member => {
                  return (
                    <tr key={member.id} className="transition-colors hover:bg-fundo/50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.isDiretora ? avatarDiretora(member.avatarSeed) : avatarFuncionaria(member.avatarSeed || member.email || String(member.id))}
                            alt=""
                            className="size-8 shrink-0 rounded-full border border-linha bg-superficie"
                          />
                          <span className="font-semibold text-tinta">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-tinta-suave">{member.email}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={member.isDiretora
                            ? { backgroundColor: '#FEE2E2', color: '#C8102E' }
                            : { backgroundColor: '#F5F5F4', color: '#6E6762' }}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={member.active
                            ? { backgroundColor: '#D1FAE5', color: '#047857' }
                            : { backgroundColor: '#F5F5F4', color: '#6E6762' }}>
                          {member.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-tinta-suave">{member.lastLogin}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" title="Editar" aria-label={`Editar ${member.name}`}
                            className="rounded-lg p-1.5 text-tinta-suave transition-colors hover:bg-fundo hover:text-tinta"
                            onClick={() => { setEditing(member); setModalOpen(true); }}>
                            <Pencil className="size-3.5" />
                          </button>
                          <button type="button"
                            title={member.active ? 'Desativar conta' : 'Ativar conta'}
                            aria-label={`${member.active ? 'Desativar' : 'Ativar'} a conta de ${member.name}`}
                            className="rounded-lg p-1.5 text-tinta-suave transition-colors hover:bg-marca-clara hover:text-marca-texto"
                            onClick={() => alternarStatus(member)}>
                            <Power className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-tinta-suave" role="status">Carregando...</div>
          ) : staff.length === 0 && (
            <div className="py-10 text-center text-sm text-tinta-suave">Nenhuma funcionária cadastrada.</div>
          )}
        </AdminPanel>
      </div>

      <StaffModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        member={editing}
        onSaved={carregar}
      />
    </AdminLayout>
  );
}
