import { FileText, Users, LogOut, Search } from 'lucide-react';
import type { Screen } from '../../App';

interface Props {
  children: React.ReactNode;
  current: Screen;
  navigate: (s: Screen) => void;
}

export function ParentLayout({ children, current, navigate }: Props) {
  const navItems: { id: Screen; icon: React.ElementType; label: string }[] = [
    { id: 'parent-dashboard', icon: FileText, label: 'Minhas Reivindicações' },
    { id: 'my-students', icon: Users, label: 'Meus Alunos' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F5F7]">
      <aside className="w-[220px] shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#C8102E] rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">R</span>
            </div>
            <div>
              <div className="font-bold text-gray-900 leading-tight">ReEncontro</div>
              <div className="text-[10px] text-gray-400 leading-tight">Área do Responsável</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-[#C8102E]/8 text-[#C8102E] font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`size-4 shrink-0 ${isActive ? 'text-[#C8102E]' : 'text-gray-400'}`} />
                {item.label}
              </button>
            );
          })}
          <button
            onClick={() => navigate('public-listing')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <Search className="size-4 shrink-0 text-gray-400" />
            Buscar Itens
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#C8102E]/10 rounded-full flex items-center justify-center text-xs font-semibold text-[#C8102E] shrink-0">
              MS
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">Maria Santos</div>
              <div className="text-[11px] text-gray-400">Responsável</div>
            </div>
            <button className="text-gray-300 hover:text-gray-600 transition-colors" title="Sair">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 overflow-auto min-w-0">
        {children}
      </div>
    </div>
  );
}
