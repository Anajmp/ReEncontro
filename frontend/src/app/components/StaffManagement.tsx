import { useState } from 'react';
import { Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AdminLayout } from './shared/AdminLayout';
import {
  AdminPanel, AdminAvatar, adminBtnPrimary, adminBtnOutline, adminInputClass, adminSelectClass,
} from './shared/AdminChrome';
import { staffMembers } from './shared/data';
import type { StaffMember } from './shared/data';
import type { Screen } from '../App';

interface Props {
  navigate: (s: Screen) => void;
}

function StaffModal({
  open,
  onClose,
  member,
}: {
  open: boolean;
  onClose: () => void;
  member?: StaffMember;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl border-[#E7E5E4]">
        <DialogHeader>
          <DialogTitle className="text-[#1C1917]">{member ? 'Editar funcionária' : 'Adicionar funcionária'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-[#1C1917]">Nome completo *</Label>
            <Input className={adminInputClass} placeholder="Nome completo" defaultValue={member?.name} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-[#1C1917]">E-mail institucional *</Label>
            <Input className={adminInputClass} type="email" placeholder="nome@escola.edu.br" defaultValue={member?.email} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-[#1C1917]">Perfil *</Label>
              <Select defaultValue={member?.role === 'Diretora' ? 'diretora' : 'inspetora'}>
                <SelectTrigger className={adminSelectClass}><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inspetora">Inspetora</SelectItem>
                  <SelectItem value="diretora">Diretora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-[#1C1917]">Status</Label>
              <Select defaultValue={member?.active ? 'ativo' : 'inativo'}>
                <SelectTrigger className={adminSelectClass}><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {!member && (
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-[#1C1917]">Senha inicial *</Label>
              <Input className={adminInputClass} type="password" placeholder="Será enviada por e-mail" />
            </div>
          )}
        </div>
        <div className="mt-1 flex gap-3 border-t border-[#E7E5E4] pt-3">
          <Button variant="outline" className={`flex-1 ${adminBtnOutline}`} onClick={onClose}>Cancelar</Button>
          <Button className={`flex-1 ${adminBtnPrimary}`} onClick={onClose}>
            {member ? 'Salvar alterações' : 'Adicionar funcionária'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function StaffManagement({ navigate }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | undefined>();

  const openEdit = (member: StaffMember) => {
    setEditing(member);
    setModalOpen(true);
  };

  const openAdd = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  return (
    <AdminLayout current="staff-management" navigate={navigate}>
      <div className="space-y-5">
        <div className="flex items-center justify-end">
          <Button size="sm" className={`gap-2 ${adminBtnPrimary}`} onClick={openAdd}>
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
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Desde</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold tracking-wide text-[#78716C] uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {staffMembers.map(member => {
                  const initials = member.name.split(' ').slice(0, 2).map(n => n[0]).join('');
                  return (
                    <tr key={member.id} className="transition-colors hover:bg-[#F5F3F0]/50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {member.role === 'Diretora' ? (
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
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={
                            member.role === 'Diretora'
                              ? { backgroundColor: '#FEE2E2', color: '#C8102E' }
                              : { backgroundColor: '#F5F5F4', color: '#78716C' }
                          }
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={
                            member.active
                              ? { backgroundColor: '#D1FAE5', color: '#059669' }
                              : { backgroundColor: '#F5F5F4', color: '#A8A29E' }
                          }
                        >
                          {member.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#A8A29E]">{member.since}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            className="rounded-lg p-1.5 text-[#A8A29E] transition-colors hover:bg-[#F5F3F0] hover:text-[#1C1917]"
                            onClick={() => openEdit(member)}
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          {member.role !== 'Diretora' && (
                            <button type="button" className="rounded-lg p-1.5 text-[#A8A29E] transition-colors hover:bg-[#FEE2E2] hover:text-[#C8102E]">
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                          <button type="button" className="rounded-lg p-1.5 text-[#A8A29E] transition-colors hover:bg-[#F5F3F0] hover:text-[#1C1917]">
                            <MoreHorizontal className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AdminPanel>
      </div>

      <StaffModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        member={editing}
      />
    </AdminLayout>
  );
}
