export type Status = 'Disponível' | 'Pendente' | 'Em Processo' | 'Entregue' | 'Descartado';
export type Category = 'Vestuário' | 'Acessórios' | 'Material Escolar' | 'Eletrônicos' | 'Calçados' | 'Outros';
export type Period = 'Manhã' | 'Tarde' | 'Noite';
export type Role = 'Inspetora' | 'Diretora';

export interface Item {
  id: number;
  name: string;
  category: Category;
  location: string;
  date: string;
  status: Status;
  image: string;
  description: string;
  collectionPoint: string;
  daysFound: number;
  staff?: string;
}

export interface Student {
  id: number;
  name: string;
  room: string;
  period: Period;
}

export interface Claim {
  id: number;
  itemId: number;
  itemName: string;
  itemImage: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  studentName: string;
  room: string;
  period: Period;
  date: string;
  status: Status;
}

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  since: string;
}

export const items: Item[] = [
  {
    id: 1,
    name: 'Mochila azul Nike',
    category: 'Vestuário',
    location: 'Pátio Principal',
    date: '15/03/2024',
    status: 'Disponível',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop&auto=format',
    description: 'Mochila azul marinho com alças ajustáveis, sem identificação interna. Contém alguns materiais escolares.',
    collectionPoint: 'Secretaria — Bloco A',
    daysFound: 5,
    staff: 'Ana Paula',
  },
  {
    id: 2,
    name: 'Estojo laranja',
    category: 'Material Escolar',
    location: 'Sala 203',
    date: '14/03/2024',
    status: 'Pendente',
    image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=400&h=300&fit=crop&auto=format',
    description: 'Estojo laranja com canetas coloridas e lápis de cor dentro. Sem etiqueta.',
    collectionPoint: 'Secretaria — Bloco A',
    daysFound: 6,
    staff: 'Cláudia Reis',
  },
  {
    id: 3,
    name: 'Garrafa de água cinza',
    category: 'Outros',
    location: 'Quadra de Esportes',
    date: '13/03/2024',
    status: 'Em Processo',
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=300&fit=crop&auto=format',
    description: 'Garrafa plástica cinza com tampa vermelha, sem nome identificado.',
    collectionPoint: 'Secretaria — Bloco A',
    daysFound: 7,
    staff: 'Ana Paula',
  },
  {
    id: 4,
    name: 'Óculos de grau',
    category: 'Acessórios',
    location: 'Biblioteca',
    date: '12/03/2024',
    status: 'Entregue',
    image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400&h=300&fit=crop&auto=format',
    description: 'Armação preta com lentes de grau, sem estojo. Encontrado entre as prateleiras.',
    collectionPoint: 'Secretaria — Bloco A',
    daysFound: 8,
    staff: 'Fernanda Lima',
  },
  {
    id: 5,
    name: 'Casaco preto',
    category: 'Vestuário',
    location: 'Refeitório',
    date: '11/03/2024',
    status: 'Disponível',
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=300&fit=crop&auto=format',
    description: 'Casaco preto tamanho M sem identificação. Encontrado pendurado no refeitório.',
    collectionPoint: 'Secretaria — Bloco B',
    daysFound: 9,
    staff: 'Cláudia Reis',
  },
  {
    id: 6,
    name: 'Tênis branco',
    category: 'Calçados',
    location: 'Vestiário',
    date: '10/03/2024',
    status: 'Disponível',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&auto=format',
    description: 'Tênis branco número 38, sem cadarço. Encontrado no vestiário após aula de educação física.',
    collectionPoint: 'Secretaria — Bloco B',
    daysFound: 10,
    staff: 'Ana Paula',
  },
  {
    id: 7,
    name: 'Agenda escolar 2024',
    category: 'Material Escolar',
    location: 'Corredor Bloco B',
    date: '09/03/2024',
    status: 'Pendente',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=300&fit=crop&auto=format',
    description: 'Agenda escolar 2024 azul com capa dura. Tem algumas anotações mas sem nome.',
    collectionPoint: 'Secretaria — Bloco A',
    daysFound: 11,
    staff: 'Fernanda Lima',
  },
  {
    id: 8,
    name: 'Guarda-chuva listrado',
    category: 'Outros',
    location: 'Portaria',
    date: '08/03/2024',
    status: 'Disponível',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format',
    description: 'Guarda-chuva listrado azul e branco dobrável. Encontrado na portaria.',
    collectionPoint: 'Portaria — Entrada Principal',
    daysFound: 12,
    staff: 'Cláudia Reis',
  },
  {
    id: 9,
    name: 'Fone de ouvido preto',
    category: 'Eletrônicos',
    location: 'Laboratório de Informática',
    date: '05/12/2023',
    status: 'Descartado',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&auto=format',
    description: 'Fone de ouvido com fio, preto, sem marca identificável.',
    collectionPoint: 'Secretaria — Bloco A',
    daysFound: 97,
    staff: 'Ana Paula',
  },
];

export const claims: Claim[] = [
  {
    id: 1,
    itemId: 2,
    itemName: 'Estojo laranja',
    itemImage: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=100&h=100&fit=crop&auto=format',
    claimantName: 'Maria Santos',
    claimantEmail: 'maria.santos@email.com',
    claimantPhone: '(11) 99123-4567',
    studentName: 'Lucas Santos',
    room: '5º A',
    period: 'Manhã',
    date: '16/03/2024',
    status: 'Pendente',
  },
  {
    id: 2,
    itemId: 7,
    itemName: 'Agenda escolar 2024',
    itemImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100&h=100&fit=crop&auto=format',
    claimantName: 'João Oliveira',
    claimantEmail: 'joao.oliveira@email.com',
    claimantPhone: '(11) 98765-4321',
    studentName: 'Ana Oliveira',
    room: '7º B',
    period: 'Tarde',
    date: '15/03/2024',
    status: 'Pendente',
  },
  {
    id: 3,
    itemId: 3,
    itemName: 'Garrafa de água cinza',
    itemImage: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=100&h=100&fit=crop&auto=format',
    claimantName: 'Carlos Pereira',
    claimantEmail: 'carlos.pereira@email.com',
    claimantPhone: '',
    studentName: 'Pedro Pereira',
    room: '3º C',
    period: 'Manhã',
    date: '14/03/2024',
    status: 'Em Processo',
  },
  {
    id: 4,
    itemId: 1,
    itemName: 'Mochila azul Nike',
    itemImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop&auto=format',
    claimantName: 'Maria Santos',
    claimantEmail: 'maria.santos@email.com',
    claimantPhone: '(11) 99123-4567',
    studentName: 'Lucas Santos',
    room: '5º A',
    period: 'Manhã',
    date: '10/03/2024',
    status: 'Entregue',
  },
];

export const staffMembers: StaffMember[] = [
  { id: 1, name: 'Ana Paula Ferreira', email: 'ana.paula@escola.edu.br', role: 'Diretora', active: true, since: 'Jan 2022' },
  { id: 2, name: 'Cláudia Reis', email: 'claudia.reis@escola.edu.br', role: 'Inspetora', active: true, since: 'Mar 2023' },
  { id: 3, name: 'Fernanda Lima', email: 'fernanda.lima@escola.edu.br', role: 'Inspetora', active: true, since: 'Jun 2023' },
  { id: 4, name: 'Patrícia Souza', email: 'patricia.souza@escola.edu.br', role: 'Inspetora', active: false, since: 'Ago 2021' },
];

export const myStudents: Student[] = [
  { id: 1, name: 'Lucas Santos', room: '5º A', period: 'Manhã' },
  { id: 2, name: 'Beatriz Santos', room: '3º B', period: 'Tarde' },
];
