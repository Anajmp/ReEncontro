import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { PublicListing } from './components/PublicListing';
import { ItemDetail } from './components/ItemDetail';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ResetPassword } from './components/ResetPassword';
import { ParentDashboard } from './components/ParentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { RegisterItem } from './components/RegisterItem';
import { AvailableItems } from './components/AvailableItems';
import { PendingClaims } from './components/PendingClaims';
import { InProcess } from './components/InProcess';
import { Finalized } from './components/Finalized';
import { Reports } from './components/Reports';
import { StaffManagement } from './components/StaffManagement';
import { DemoNav } from './components/shared/DemoNav';
import { RotaProtegida } from './components/RotaProtegida';

export type Screen =
  | 'public-listing'
  | 'item-detail'
  | 'login'
  | 'register'
  | 'reset-password'
  | 'parent-dashboard'
  | 'my-students'
  | 'admin-dashboard'
  | 'register-item'
  | 'available-items'
  | 'pending-claims'
  | 'in-process'
  | 'finalized'
  | 'reports'
  | 'staff-management';

// Liga cada nome de tela a uma URL de verdade
const screenToPath: Record<Screen, string> = {
  'public-listing': '/',
  'item-detail': '/item',
  'login': '/login',
  'register': '/cadastro',
  'reset-password': '/redefinir-senha',
  'parent-dashboard': '/responsavel/reivindicacoes',
  'my-students': '/responsavel/alunos',
  'admin-dashboard': '/admin',
  'register-item': '/admin/cadastrar-item',
  'available-items': '/admin/itens',
  'pending-claims': '/admin/pendentes',
  'in-process': '/admin/em-processo',
  'finalized': '/admin/finalizados',
  'reports': '/admin/relatorios',
  'staff-management': '/admin/funcionarias',
};

// Hook que devolve a função navigate(screen) usando o React Router por baixo
function useScreenNavigate() {
  const navigate = useNavigate();
  return (s: Screen) => {
    navigate(screenToPath[s]);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
}

// Descobre qual screen corresponde à URL atual (pra DemoNav destacar a tela certa)
function useCurrentScreen(): Screen {
  const location = useLocation();
  const entry = Object.entries(screenToPath).find(([, path]) => path === location.pathname);
  return (entry?.[0] as Screen) ?? 'public-listing';
}

export default function App() {
  const navigate = useScreenNavigate();
  const current = useCurrentScreen();

  return (
    <div className="size-full relative min-h-screen">
      <Routes>
        <Route path="/" element={<PublicListing navigate={navigate} />} />
        <Route path="/item/:id" element={<ItemDetail navigate={navigate} />} />
        <Route path="/login" element={<Login navigate={navigate} />} />
        <Route path="/cadastro" element={<Register navigate={navigate} />} />
        <Route path="/redefinir-senha" element={<ResetPassword navigate={navigate} />} />
        <Route path="/responsavel/reivindicacoes" element={<RotaProtegida role="responsavel"><ParentDashboard navigate={navigate} activeTab="claims" /></RotaProtegida>} />
        <Route path="/responsavel/alunos" element={<RotaProtegida role="responsavel"><ParentDashboard navigate={navigate} activeTab="students" /></RotaProtegida>} />
        <Route path="/admin" element={<RotaProtegida role="funcionaria"><AdminDashboard navigate={navigate} /></RotaProtegida>} />
        <Route path="/admin/cadastrar-item" element={<RotaProtegida role="funcionaria"><RegisterItem navigate={navigate} /></RotaProtegida>} />
        <Route path="/admin/itens" element={<RotaProtegida role="funcionaria"><AvailableItems navigate={navigate} /></RotaProtegida>} />
        <Route path="/admin/pendentes" element={<RotaProtegida role="funcionaria"><PendingClaims navigate={navigate} /></RotaProtegida>} />
        <Route path="/admin/em-processo" element={<RotaProtegida role="funcionaria"><InProcess navigate={navigate} /></RotaProtegida>} />
        <Route path="/admin/finalizados" element={<RotaProtegida role="funcionaria"><Finalized navigate={navigate} /></RotaProtegida>} />
        <Route path="/admin/relatorios" element={<RotaProtegida role="funcionaria"><Reports navigate={navigate} /></RotaProtegida>} />
        <Route path="/admin/funcionarias" element={<RotaProtegida role="funcionaria"><StaffManagement navigate={navigate} /></RotaProtegida>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <DemoNav current={current} navigate={navigate} />
    </div>
  );
}