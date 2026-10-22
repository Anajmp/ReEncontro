import { useEffect, useRef } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { focarConteudo } from '../lib/acessibilidade';
import { PularParaConteudo } from './components/shared/PularParaConteudo';
import { PublicListing } from './components/PublicListing';
import { ItemDetail } from './components/ItemDetail';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ResetPassword } from './components/ResetPassword';
import { ParentDashboard } from './components/ParentDashboard';
import { ParentProfile } from './components/ParentProfile';
import { AdminDashboard } from './components/AdminDashboard';
import { RegisterItem } from './components/RegisterItem';
import { AvailableItems } from './components/AvailableItems';
import { PendingClaims } from './components/PendingClaims';
import { InProcess } from './components/InProcess';
import { Finalized } from './components/Finalized';
import { Reports } from './components/Reports';
import { StaffManagement } from './components/StaffManagement';
import { RotaProtegida } from './components/RotaProtegida';
import { LoginSplashProvider } from './components/LoginSplashProvider';
import { PortaDeEntrada } from './components/LoadingScreen';
import { Lgpd } from './components/Lgpd';
import { AdminProfile } from './components/AdminProfile';

export type Screen =
  | 'public-listing'
  | 'item-detail'
  | 'login'
  | 'register'
  | 'reset-password'
  | 'parent-dashboard'
  | 'my-students'
  | 'parent-profile'
  | 'completar-cadastro'
  | 'admin-dashboard'
  | 'register-item'
  | 'available-items'
  | 'pending-claims'
  | 'in-process'
  | 'finalized'
  | 'reports'
  | 'staff-management'
  | 'admin-profile'
  | 'lgpd';

// Liga cada nome de tela a uma URL de verdade
const screenToPath: Record<Screen, string> = {
  'public-listing': '/',
  'item-detail': '/item',
  'login': '/login',
  'register': '/cadastro',
  'reset-password': '/redefinir-senha',
  'parent-dashboard': '/responsavel/reivindicacoes',
  'my-students': '/responsavel/alunos',
  'parent-profile': '/responsavel/perfil',
  'completar-cadastro': '/responsavel/completar-cadastro',
  'admin-dashboard': '/admin',
  'register-item': '/admin/cadastrar-item',
  'available-items': '/admin/itens',
  'pending-claims': '/admin/pendentes',
  'in-process': '/admin/em-processo',
  'finalized': '/admin/finalizados',
  'reports': '/admin/relatorios',
  'staff-management': '/admin/funcionarias',
  'admin-profile': '/admin/pessoal',
  'lgpd': '/admin/privacidade'
};

// Título da aba do navegador (e o que o leitor de tela anuncia) em cada tela
const tituloDaTela: Record<Screen, string> = {
  'public-listing': 'Itens encontrados',
  'item-detail': 'Detalhe do item',
  'login': 'Entrar',
  'register': 'Criar conta',
  'reset-password': 'Redefinir senha',
  'parent-dashboard': 'Minhas reivindicações',
  'my-students': 'Meus alunos',
  'parent-profile': 'Meu perfil',
  'completar-cadastro': 'Meus alunos',
  'admin-dashboard': 'Dashboard',
  'register-item': 'Cadastrar item',
  'available-items': 'Itens disponíveis',
  'pending-claims': 'Reivindicações pendentes',
  'in-process': 'Em processo',
  'finalized': 'Finalizados',
  'reports': 'Relatórios',
  'staff-management': 'Gestão de funcionárias',
  'admin-profile': 'Minha conta',
  'lgpd': 'Privacidade (LGPD)',
};

// Hook que devolve a função navigate(screen) usando o React Router por baixo
function useScreenNavigate() {
  const navigate = useNavigate();
  return (s: Screen) => {
    navigate(screenToPath[s]);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
}

// Numa SPA a troca de rota não recarrega a página: sem isso o título da aba
// nunca muda e o leitor de tela não percebe que a tela é outra
function useTituloEFocoDaPagina() {
  const { pathname } = useLocation();
  const primeiraCarga = useRef(true);

  useEffect(() => {
    const tela = (Object.keys(screenToPath) as Screen[]).find(s => screenToPath[s] === pathname)
      ?? (pathname.startsWith('/item/') ? 'item-detail' : undefined);
    document.title = tela ? `${tituloDaTela[tela]} · ReEncontro` : 'ReEncontro';

    // Na primeira carga o navegador já começa do topo da página
    if (primeiraCarga.current) {
      primeiraCarga.current = false;
      return;
    }
    focarConteudo();
  }, [pathname]);
}

export default function App() {
  const navigate = useScreenNavigate();
  useTituloEFocoDaPagina();

  return (
    <LoginSplashProvider>
      <PularParaConteudo />
      <div className="size-full relative min-h-screen">
        <Routes>
          <Route path="/" element={<PortaDeEntrada><PublicListing navigate={navigate} /></PortaDeEntrada>} />
          <Route path="/item/:id" element={<ItemDetail navigate={navigate} />} />
          <Route path="/login" element={<Login navigate={navigate} />} />
          <Route path="/cadastro" element={<Register navigate={navigate} />} />
          <Route path="/redefinir-senha" element={<ResetPassword navigate={navigate} />} />
          <Route path="/responsavel/reivindicacoes" element={<RotaProtegida role="responsavel"><ParentDashboard navigate={navigate} activeTab="claims" /></RotaProtegida>} />
          <Route path="/responsavel/alunos" element={<RotaProtegida role="responsavel"><ParentDashboard navigate={navigate} activeTab="students" /></RotaProtegida>} />
          <Route path="/responsavel/perfil" element={<RotaProtegida role="responsavel"><ParentProfile navigate={navigate} /></RotaProtegida>} />
          <Route path="/responsavel/completar-cadastro" element={<RotaProtegida role="responsavel"><Navigate to="/responsavel/alunos" replace /></RotaProtegida>} />
          <Route path="/admin" element={<RotaProtegida role="funcionaria"><AdminDashboard navigate={navigate} /></RotaProtegida>} />
          <Route path="/admin/cadastrar-item" element={<RotaProtegida role="funcionaria"><RegisterItem navigate={navigate} /></RotaProtegida>} />
          <Route path="/admin/itens" element={<RotaProtegida role="funcionaria"><AvailableItems navigate={navigate} /></RotaProtegida>} />
          <Route path="/admin/pendentes" element={<RotaProtegida role="funcionaria"><PendingClaims navigate={navigate} /></RotaProtegida>} />
          <Route path="/admin/em-processo" element={<RotaProtegida role="funcionaria"><InProcess navigate={navigate} /></RotaProtegida>} />
          <Route path="/admin/finalizados" element={<RotaProtegida role="funcionaria"><Finalized navigate={navigate} /></RotaProtegida>} />
          <Route path="/admin/relatorios" element={<RotaProtegida role="funcionaria" apenasDiretora><Reports navigate={navigate} /></RotaProtegida>} />
          <Route path="/admin/funcionarias" element={<RotaProtegida role="funcionaria" apenasDiretora><StaffManagement navigate={navigate} /></RotaProtegida>} />
          <Route path="/admin/privacidade" element={<RotaProtegida role="funcionaria" apenasDiretora><Lgpd navigate={navigate} /></RotaProtegida>} />
          <Route path="/admin/pessoal" element={<RotaProtegida role="funcionaria" apenasDiretora><AdminProfile navigate={navigate} /></RotaProtegida>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

      </div>
    </LoginSplashProvider>
  );
}