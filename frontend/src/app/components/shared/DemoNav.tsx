import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { Screen } from '../../App';

const screens: { id: Screen; label: string; group: string }[] = [
  { id: 'public-listing', label: 'Listagem Pública', group: 'Público' },
  { id: 'item-detail', label: 'Detalhe do Item', group: 'Público' },
  { id: 'login', label: 'Login', group: 'Auth' },
  { id: 'register', label: 'Cadastro', group: 'Auth' },
  { id: 'reset-password', label: 'Redefinir Senha', group: 'Auth' },
  { id: 'parent-dashboard', label: 'Painel Responsável', group: 'Responsável' },
  { id: 'my-students', label: 'Meus Alunos', group: 'Responsável' },
  { id: 'admin-dashboard', label: 'Dashboard Admin', group: 'Admin' },
  { id: 'register-item', label: 'Cadastrar Item', group: 'Admin' },
  { id: 'available-items', label: 'Itens Disponíveis', group: 'Admin' },
  { id: 'pending-claims', label: 'Pendentes', group: 'Admin' },
  { id: 'in-process', label: 'Em Processo', group: 'Admin' },
  { id: 'finalized', label: 'Finalizados', group: 'Admin' },
  { id: 'reports', label: 'Relatórios', group: 'Admin' },
  { id: 'staff-management', label: 'Gestão de Funcionárias', group: 'Admin' },
];

const groups = ['Público', 'Auth', 'Responsável', 'Admin'];

interface Props {
  current: Screen;
  navigate: (s: Screen) => void;
}

export function DemoNav({ current, navigate }: Props) {
  const [open, setOpen] = useState(false);
  const currentLabel = screens.find(s => s.id === current)?.label ?? '';

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <div className="pointer-events-auto">
        {open && (
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 mb-2 w-[700px] max-w-[calc(100vw-2rem)]">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 text-center">Navegação de Demonstração — 17 Telas</div>
            <div className="grid grid-cols-4 gap-4">
              {groups.map(group => (
                <div key={group}>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{group}</div>
                  <div className="space-y-0.5">
                    {screens.filter(s => s.group === group).map(s => (
                      <button
                        key={s.id}
                        onClick={() => { navigate(s.id); setOpen(false); }}
                        className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors ${
                          s.id === current
                            ? 'bg-[#C8102E] text-white font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-center">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <span className="text-gray-400 text-xs">Tela atual:</span>
            <span>{currentLabel}</span>
            {open ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
