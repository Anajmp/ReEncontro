import { useState } from 'react';
import { Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AdminLayout } from './shared/AdminLayout';
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{member ? 'Editar funcionária' : 'Adicionar funcionária'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Nome completo *</Label>
            <Input placeholder="Nome completo" defaultValue={member?.name} />
          </div>
          <div className="space-y-1.5">
            <Label>E-mail institucional *</Label>
            <Input type="email" placeholder="nome@escola.edu.br" defaultValue={member?.email} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Perfil *</Label>
              <Select defaultValue={member?.role === 'Diretora' ? 'diretora' : 'inspetora'}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inspetora">Inspetora</SelectItem>
                  <SelectItem value="diretora">Diretora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select defaultValue={member?.active ? 'ativo' : 'inativo'}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {!member && (
            <div className="space-y-1.5">
              <Label>Senha inicial *</Label>
              <Input type="password" placeholder="Será enviada por e-mail" />
            </div>
          )}
        </div>
        <div className="flex gap-3 border-t border-gray-100 pt-3 mt-1">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1 bg-[#C8102E] hover:bg-[#A00D24]" onClick={onClose}>
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
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-gray-900">Gestão de Funcionárias</h1>
            <p className="text-sm text-gray-500 mt-1">
              Apenas a diretora pode gerenciar o acesso das funcionárias ao sistema.
            </p>
          </div>
          <Button
            size="sm"
            className="bg-[#C8102E] hover:bg-[#A00D24] gap-2 shrink-0"
            onClick={openAdd}
          >
            <Plus className="size-4" />
            Adicionar funcionária
          </Button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5 text-sm text-amber-800">
          Você está logada como <strong>Diretora</strong>. Esta tela é acessível apenas para o perfil de Diretora.
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Funcionária</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">E-mail</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Perfil</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Desde</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staffMembers.map(member => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                          member.role === 'Diretora' ? 'bg-[#C8102E]/10 text-[#C8102E]' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {member.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-gray-900">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{member.email}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
                        member.role === 'Diretora'
                          ? 'bg-[#C8102E]/10 text-[#C8102E] border-[#C8102E]/20'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
                        member.active
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {member.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">{member.since}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          onClick={() => openEdit(member)}
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        {member.role !== 'Diretora' && (
                          <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                        <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                          <MoreHorizontal className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <StaffModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        member={editing}
      />
    </AdminLayout>
  );
}
