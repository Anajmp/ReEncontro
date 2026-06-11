import { useState } from 'react';
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { StatusBadge } from './shared/StatusBadge';
import { ParentLayout } from './shared/ParentLayout';
import { claims, myStudents } from './shared/data';
import type { Student } from './shared/data';
import type { Screen } from '../App';

interface Props {
  navigate: (s: Screen) => void;
  activeTab: 'claims' | 'students';
}

function StudentModal({
  open,
  onClose,
  student,
}: {
  open: boolean;
  onClose: () => void;
  student?: Student;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{student ? 'Editar aluno' : 'Adicionar aluno'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Nome do aluno *</Label>
            <Input placeholder="Nome completo" defaultValue={student?.name} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Sala *</Label>
              <Input placeholder="Ex: 5º A" defaultValue={student?.room} />
            </div>
            <div className="space-y-1.5">
              <Label>Período *</Label>
              <Select defaultValue={student?.period === 'Manhã' ? 'manha' : student?.period === 'Tarde' ? 'tarde' : 'noite'}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manha">Manhã</SelectItem>
                  <SelectItem value="tarde">Tarde</SelectItem>
                  <SelectItem value="noite">Noite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 pt-2 border-t border-gray-100 mt-1">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1 bg-[#C8102E] hover:bg-[#A00D24]" onClick={onClose}>
            {student ? 'Salvar alterações' : 'Adicionar aluno'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ParentDashboard({ navigate, activeTab }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>();
  const [tab, setTab] = useState(activeTab === 'students' ? 'students' : 'claims');

  const currentClaims = claims.filter(c => c.status === 'Pendente' || c.status === 'Em Processo');
  const historyClaims = claims.filter(c => c.status === 'Entregue' || c.status === 'Descartado');

  const current = activeTab === 'students' ? 'my-students' : 'parent-dashboard';

  return (
    <ParentLayout current={current} navigate={navigate}>
      <div className="p-6">
        {tab !== 'students' ? (
          <>
            <div className="mb-6">
              <h1 className="text-gray-900">Minhas Reivindicações</h1>
              <p className="text-sm text-gray-500 mt-1">Acompanhe o status das suas reivindicações.</p>
            </div>

            <Tabs
              value={tab}
              onValueChange={v => {
                setTab(v);
                if (v === 'students') navigate('my-students');
              }}
            >
              <TabsList className="mb-5">
                <TabsTrigger value="claims">Em andamento ({currentClaims.length})</TabsTrigger>
                <TabsTrigger value="history">Histórico ({historyClaims.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="claims">
                {currentClaims.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <p>Nenhuma reivindicação em andamento.</p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate('public-listing')}>
                      Buscar itens
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentClaims.map(claim => (
                      <div key={claim.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4 hover:border-gray-300 transition-colors">
                        <img
                          src={claim.itemImage}
                          alt={claim.itemName}
                          className="w-14 h-14 rounded-lg object-cover shrink-0 bg-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">{claim.itemName}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Aluno: {claim.studentName} · {claim.room} · {claim.period}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">Enviado em {claim.date}</div>
                        </div>
                        <StatusBadge status={claim.status} />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history">
                {historyClaims.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <p>Nenhum item no histórico ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historyClaims.map(claim => (
                      <div key={claim.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4 opacity-80">
                        <img
                          src={claim.itemImage}
                          alt={claim.itemName}
                          className="w-14 h-14 rounded-lg object-cover shrink-0 bg-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">{claim.itemName}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Aluno: {claim.studentName} · {claim.room} · {claim.period}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{claim.date}</div>
                        </div>
                        <StatusBadge status={claim.status} />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-gray-900">Meus Alunos</h1>
                <p className="text-sm text-gray-500 mt-1">Gerencie os alunos vinculados à sua conta.</p>
              </div>
              <Button
                size="sm"
                className="bg-[#C8102E] hover:bg-[#A00D24] gap-2"
                onClick={() => { setEditingStudent(undefined); setModalOpen(true); }}
              >
                <Plus className="size-4" />
                Adicionar aluno
              </Button>
            </div>

            <div className="space-y-3">
              {myStudents.map(student => (
                <div key={student.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#C8102E]/10 rounded-full flex items-center justify-center shrink-0">
                    <GraduationCap className="size-5 text-[#C8102E]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{student.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {student.room} · Período {student.period}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      onClick={() => { setEditingStudent(student); setModalOpen(true); }}
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <StudentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        student={editingStudent}
      />
    </ParentLayout>
  );
}
