// =====================================================================
// RotaProtegida — bloqueia o acesso de quem não está autenticado.
//
// Uso:
//   <RotaProtegida><AdminDashboard /></RotaProtegida>
//   <RotaProtegida role="funcionaria"><Reports /></RotaProtegida>
// =====================================================================
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  children: ReactNode;
  role?: 'responsavel' | 'funcionaria';
}

export function RotaProtegida({ children, role }: Props) {
  const { usuario, carregando } = useAuth();
  const location = useLocation();

  // Enquanto a sessão está sendo restaurada do localStorage, não decide nada.
  // Sem isso, o usuário logado seria chutado pro login a cada F5.
  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#C8102E] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Carregando…</p>
        </div>
      </div>
    );
  }

  // Não autenticado → manda pro login, guardando de onde veio
  if (!usuario) {
    return <Navigate to="/login" replace state={{ de: location.pathname }} />;
  }

  // Autenticado, mas com o perfil errado (ex.: responsável tentando abrir /admin)
  if (role && usuario.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
