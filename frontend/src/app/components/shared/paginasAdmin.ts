import type { Screen } from '../../App';

/** Título e subtítulo de cada tela, exibidos no cabeçalho do AdminLayout. */
export const PAGE_INFO: Record<Screen, { title: string; subtitle: string }> = {
  'public-listing': { title: 'Listagem', subtitle: '' },
  'item-detail': { title: 'Detalhe', subtitle: '' },
  login: { title: 'Login', subtitle: '' },
  register: { title: 'Cadastro', subtitle: '' },
  'reset-password': { title: 'Redefinir senha', subtitle: '' },
  'parent-dashboard': { title: 'Painel', subtitle: '' },
  'my-students': { title: 'Alunos', subtitle: '' },
  'parent-profile': { title: 'Meu Perfil', subtitle: '' },
  'completar-cadastro': { title: 'Completar cadastro', subtitle: 'Cadastre o primeiro aluno para continuar' },
  'admin-dashboard': { title: 'Dashboard', subtitle: 'Visão geral dos achados e perdidos' },
  'register-item': { title: 'Cadastrar Item', subtitle: 'Adicione um novo item encontrado ao sistema' },
  'available-items': { title: 'Itens Disponíveis', subtitle: 'Gerencie os itens aguardando retirada' },
  'pending-claims': { title: 'Pendentes', subtitle: 'Reivindicações aguardando validação' },
  'in-process': { title: 'Em Processo', subtitle: 'Reivindicações aprovadas aguardando entrega' },
  finalized: { title: 'Finalizados', subtitle: 'Histórico de itens entregues e descartados' },
  reports: { title: 'Relatórios', subtitle: 'Análise e exportação de dados' },
  'staff-management': { title: 'Gestão de Funcionárias', subtitle: 'Contas com acesso ao sistema administrativo' },
  'lgpd': { title: 'Privacidade (LGPD)', subtitle: 'Exclusão de dados pessoais a pedido do titular' },
};
