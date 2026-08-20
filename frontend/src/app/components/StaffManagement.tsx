import { useState, useEffect } from 'react';
import { Plus, Pencil, Power } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AdminLayout } from './shared/AdminLayout';
import {
  AdminPanel, AdminAvatar, adminBtnPrimary, adminBtnOutline, adminInputClass, adminSelectClass,
} from './shared/AdminChrome';
import type { Screen } from '../App';
import { usuariosApi } from '../../lib/api';

interface Props {
  navigate: (s: Screen) => void;
}

function StaffModal({
  open, onClose, member, onSaved,
}: {
  open: boolean;
  onClose: () => void;
  member?: any;
  onSaved: () => void;
}) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [perfil, setPerfil] = useState('inspetora');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open) {
      setNome(member?.name ?? '');
      setEmail(member?.email ?? '');
      setTelefone(member?.phone ?? '');
      setPerfil(member?.isDiretora ? 'diretora' : 'inspetora');
      setSenha('');
      setErro('');
    }
  }, [open, member]);

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
      const dados: any = {
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
    } catch (err: any) {
      setErro(err.message || 'Erro ao salvar a funcionária.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl border-[#E7E5E4]">
        <DialogHeader>
          <DialogTitle className="text-[#1C1917]">
            {member ? 'Editar funcionária' : 'Adicionar funcionária'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-[#1C1917]">Nome completo *</Label>
            <Input className={adminInputClass} placeholder="Nome completo"
              value={nome} onChange={e => setNome(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-[#1C1917]">E-mail institucional *</Label>
            <Input className={adminInputClass} type="email" placeholder="nome@sesi.br"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-[#1C1917]">Telefone</Label>
              <Input className={adminInputClass} placeholder="(19) 99999-9999"
                value={telefone} onChange={e => setTelefone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-[#1C1917]">Perfil *</Label>
              <Select value={perfil} onValueChange={setPerfil}>
                <SelectTrigger className={adminSelectClass}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inspetora">Inspetora</SelectItem>
                  <SelectItem value="diretora">Diretora</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {!member && (
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-[#1C1917]">Senha inicial *</Label>
              <Input className={adminInputClass} type="password" placeholder="Mínimo 6 caracteres"
                value={senha} onChange={e => setSenha(e.target.value)} />
              <p className="text-xs text-[#A8A29E]">Informe esta senha à funcionária para o primeiro acesso.</p>
            </div>
          )}

          {erro && (
            <p className="rounded-xl bg-[#FFF1F2] px-4 py-2.5 text-sm text-[#C8102E]">{erro}</p>
          )}
        </div>
        <div className="mt-1 flex gap-3 border-t border-[#E7E5E4] pt-3">
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
  const [editing, setEditing] = useState<any | undefined>();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    setLoading(true);
    try {
      setStaff(await usuariosApi.listarFuncionarias());
    } catch (err) {
      console.error('Erro ao carregar funcionárias:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  async function alternarStatus(member: any) {
    const acao = member.active ? 'desativar' : 'ativar';
    if (!confirm(`Deseja ${acao} a conta de ${member.name}?`)) return;
    try {
      await usuariosApi.alterarStatus(member.id, !member.active);
      carregar();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar o status');
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

        <div className="rounded-xl border border-[#FEF3C7] bg-[#FEF3C7]/50 px-4 py-3 text-sm text-[#92400E]">
          Você está logada como <strong>Diretora</strong>. Esta tela é acessível apenas para o perfil de Diretora.
        </div>

        <AdminPanel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E7E5E4] bg-[#F5F3F0]/60">
                  <th className="px-5 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Funcionária</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">E-mail</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Perfil</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Último acesso</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {staff.map(member => {
                  const initials = member.name.split(' ').slice(0, 2).map((n: string) => n[0]).join('');
                  return (
                    <tr key={member.id} className="transition-colors hover:bg-[#F5F3F0]/50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {member.isDiretora ? (
                            <AdminAvatar initials={initials} size={32} />
                          ) : (
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F5F5F4] text-xs font-bold text-[#78716C]">
                              {initials}
                            </div>
                          )}
                          <span className="font-semibold text-[#1C1917]">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[#78716C]">{member.email}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={member.isDiretora
                            ? { backgroundColor: '#FEE2E2', color: '#C8102E' }
                            : { backgroundColor: '#F5F5F4', color: '#78716C' }}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={member.active
                            ? { backgroundColor: '#D1FAE5', color: '#059669' }
                            : { backgroundColor: '#F5F5F4', color: '#A8A29E' }}>
                          {member.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#A8A29E]">{member.lastLogin}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" title="Editar"
                            className="rounded-lg p-1.5 text-[#A8A29E] transition-colors hover:bg-[#F5F3F0] hover:text-[#1C1917]"
                            onClick={() => { setEditing(member); setModalOpen(true); }}>
                            <Pencil className="size-3.5" />
                          </button>
                          <button type="button"
                            title={member.active ? 'Desativar conta' : 'Ativar conta'}
                            className="rounded-lg p-1.5 text-[#A8A29E] transition-colors hover:bg-[#FEE2E2] hover:text-[#C8102E]"
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
            <div className="py-10 text-center text-sm text-[#A8A29E]">Carregando...</div>
          ) : staff.length === 0 && (
            <div className="py-10 text-center text-sm text-[#A8A29E]">Nenhuma funcionária cadastrada.</div>
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
