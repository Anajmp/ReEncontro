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
        <Route path="/item" element={<ItemDetail navigate={navigate} />} />
        <Route path="/login" element={<Login navigate={navigate} />} />
        <Route path="/cadastro" element={<Register navigate={navigate} />} />
        <Route path="/redefinir-senha" element={<ResetPassword navigate={navigate} />} />
        <Route path="/responsavel/reivindicacoes" element={<ParentDashboard navigate={navigate} activeTab="claims" />} />
        <Route path="/responsavel/alunos" element={<ParentDashboard navigate={navigate} activeTab="students" />} />
        <Route path="/admin" element={<AdminDashboard navigate={navigate} />} />
        <Route path="/admin/cadastrar-item" element={<RegisterItem navigate={navigate} />} />
        <Route path="/admin/itens" element={<AvailableItems navigate={navigate} />} />
        <Route path="/admin/pendentes" element={<PendingClaims navigate={navigate} />} />
        <Route path="/admin/em-processo" element={<InProcess navigate={navigate} />} />
        <Route path="/admin/finalizados" element={<Finalized navigate={navigate} />} />
        <Route path="/admin/relatorios" element={<Reports navigate={navigate} />} />
        <Route path="/admin/funcionarias" element={<StaffManagement navigate={navigate} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <DemoNav current={current} navigate={navigate} />
    </div>
  );
}