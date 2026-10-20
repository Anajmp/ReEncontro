// =====================================================================
// Camada de comunicação com o backend (API ReEncontro).
// Todas as chamadas HTTP passam por aqui.
// =====================================================================

import type { Usuario } from '../contexts/AuthContext';
import type { Status } from '../app/components/shared/data';

// A URL do backend vem da variável de ambiente (Vercel/local)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Corpo de erro devolvido pelo backend (errorMiddleware)
interface RespostaErro {
  erro?: string;
  mensagem?: string;
  codigo?: string;
  [campo: string]: unknown;
}

// Resposta padrão das rotas de ação (ex.: { mensagem: "Item descartado", id })
interface RespostaMensagem {
  mensagem: string;
}

// Função base que faz as requisições e trata erros, tipo fetch.
// T é o formato do JSON devolvido pela rota.
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  let res: Response;

  try {
    res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        // Se tiver token, manda no cabeçalho (pras rotas protegidas)
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    // Servidor fora do ar, sem internet, CORS bloqueado, cold start do Render...
    throw new Error(
      'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
    );
  }

  // Token expirado ou inválido numa rota protegida: derruba a sessão.
  // O AuthContext escuta esse evento e limpa o usuário logado.
  if (res.status === 401 && token) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.dispatchEvent(new Event('auth:expirado'));
  }

  // Se a resposta não for OK, lança erro com a mensagem do backend.
  // status e dados ficam no erro para quem precisa reagir a casos
  // específicos (ex.: dados.codigo === 'codigo_expirado').
  if (!res.ok) {
    const erro: RespostaErro = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error(
        erro.erro || erro.mensagem || `Erro ${res.status} ao comunicar com o servidor`
      ),
      { status: res.status, dados: erro }
    );
  }

  return res.json();
}

// Requisição com upload de arquivos (multipart/form-data)
async function requestUpload<T>(endpoint: string, formData: FormData): Promise<T> {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      // NÃO definir Content-Type aqui — o navegador define sozinho com o boundary
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const erro: RespostaErro = await res.json().catch(() => ({ erro: 'Erro na requisição' }));
    throw new Error(erro.erro || erro.mensagem || 'Erro na requisição');
  }

  return res.json();
}

// ===== REFERÊNCIAS (categorias e pontos de coleta) =====

// Linha de categorias / pontos_coleta (SELECT id, nome)
export interface Referencia {
  id: number;
  nome: string;
}

export const referenciasApi = {
  categorias: () => request<Referencia[]>('/api/categorias'),
  pontosColeta: () => request<Referencia[]>('/api/pontos-coleta'),
};

// ===== AUTENTICAÇÃO =====

// Resposta de login, registro e login com Google
export interface ResultadoLogin {
  token: string;
  usuario: Usuario;
}

// Aluno enviado no cadastro e em POST/PATCH /api/alunos (alunoSchema)
export interface DadosAluno {
  nome: string;
  sala: string;
  periodo: string; // 'integral' | 'manha' | 'tarde'
  ano_letivo: number;
}

// Corpo de POST /api/auth/registrar (registroSchema)
export interface DadosRegistro {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  alunos: DadosAluno[];
}

// Resposta de enviar/confirmar código de verificação de e-mail
export interface RespostaVerificacaoEmail {
  ja_verificado: boolean;
  mensagem: string;
  email?: string;
  email_verificado_em?: string | null;
  expira_em_segundos?: number;
}

export const authApi = {
  login: (email: string, senha: string) =>
    request<ResultadoLogin>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    }),

  register: (dados: DadosRegistro) =>
    request<ResultadoLogin>('/api/auth/registrar', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  // Verificação de e-mail (o próprio usuário logado)
  enviarCodigoVerificacao: () =>
    request<RespostaVerificacaoEmail>('/api/auth/enviar-codigo-verificacao', { method: 'POST' }),

  confirmarCodigoVerificacao: (codigo: string) =>
    request<RespostaVerificacaoEmail>('/api/auth/confirmar-codigo-verificacao', {
      method: 'POST',
      body: JSON.stringify({ codigo }),
    }),

      esqueciSenha: (email: string) =>
    request<RespostaMensagem>('/api/auth/esqueci-senha', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  redefinirSenha: (token: string, novaSenha: string) =>
    request<RespostaMensagem>('/api/auth/redefinir-senha', {
      method: 'POST',
      body: JSON.stringify({ token, novaSenha }),
    }),

  loginGoogle: (credential: string) =>
    request<ResultadoLogin>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    }),
};

// ===== ITENS =====

// Converte uma coluna DATE ('YYYY-MM-DD' ou o ISO antigo 'YYYY-MM-DDT00:00:00.000Z')
// em data local. new Date('YYYY-MM-DD') seria meia-noite UTC, que no Brasil
// (UTC-3) cai no dia anterior.
function dataLocal(data: string): Date {
  const [ano, mes, dia] = data.slice(0, 10).split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

function formatarDataSimples(data: string | null | undefined): string {
  return data ? dataLocal(data).toLocaleDateString('pt-BR') : '';
}

// Calcula quantos dias se passaram desde uma data
function calcularDias(data: string): number {
  if (!data) return 0;
  const inicio = dataLocal(data);
  const hoje = new Date();
  const diff = hoje.getTime() - inicio.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Foto de um item (detalhe: SELECT id, url, is_capa, ordem FROM item_fotos)
interface FotoBackend {
  id: number;
  url: string;
  is_capa: boolean | number;
  ordem: number;
}

// Item como vem do backend: a listagem (findDisponiveis) traz categoria,
// ponto_coleta e foto_capa; o detalhe (findById) traz categoria_nome,
// ponto_coleta_nome e fotos
interface ItemBackend {
  id: number;
  nome: string | null;
  descricao: string;
  local_encontrado: string;
  data_encontrado: string;
  data_disponibilizacao?: string | null;
  status: string;
  categoria?: string;
  categoria_nome?: string;
  ponto_coleta?: string;
  ponto_coleta_nome?: string;
  foto_capa?: string | null;
  fotos?: FotoBackend[];
}

// Item finalizado (findFinalizados)
interface ItemFinalizadoBackend {
  id: number;
  nome: string | null;
  descricao: string;
  local_encontrado: string;
  data_encontrado: string;
  status: string;
  finalizado_em: string | null;
  motivo_descarte: string | null;
  // LEFT JOIN, mas categoria_id e ponto_coleta_id são NOT NULL no banco
  categoria: string;
  ponto_coleta: string;
  finalizado_por: string | null;
  foto_capa: string | null;
}

// Item no formato das telas (traduzirItem)
export interface ItemTela {
  id: number;
  name: string;
  category: string;
  location: string;
  date: string;
  status: Status;
  image: string;
  images: string[];
  description: string;
  collectionPoint: string;
  daysFound: number;
}

// Item finalizado no formato das telas (traduzirItemFinalizado)
export interface ItemFinalizadoTela {
  id: number;
  name: string;
  category: string;
  location: string;
  date: string;
  status: Status;
  image: string;
  collectionPoint: string;
  finalizadoEmRaw: string | null;
  finalizadoEm: string;
  finalizadoPor: string;
  motivoDescarte: string;
}

// Corpo de PATCH /api/itens/:id (editarItemSchema)
export interface DadosEdicaoItem {
  nome: string;
  descricao: string;
  categoria_id: number;
  local_encontrado: string;
  ponto_coleta_id: number;
}

// Traduz um item do formato do backend pro formato que as telas usam
function traduzirItem(itemBackend: ItemBackend): ItemTela {
  const statusMap: Record<string, Status> = {
    disponivel: 'Disponível',
    pendente: 'Pendente',
    em_processo: 'Em Processo',
    entregue: 'Entregue',
    descartado: 'Descartado',
  };

  // Listagem devolve foto_capa; detalhe devolve fotos[{ url, is_capa }]
  const urlsFotos: string[] = Array.isArray(itemBackend.fotos)
    ? itemBackend.fotos.map((f) => f.url).filter(Boolean)
    : [];
  const fotoCapa =
    itemBackend.foto_capa
    || itemBackend.fotos?.find((f) => f.is_capa)?.url
    || urlsFotos[0]
    || 'https://via.placeholder.com/400x300?text=Sem+foto';

  return {
    id: itemBackend.id,
    name: itemBackend.nome || itemBackend.descricao, // fallback pros antigos
    // listagem traz categoria, detalhe traz categoria_nome: sempre vem um dos dois
    category: (itemBackend.categoria || itemBackend.categoria_nome) as string,
    location: itemBackend.local_encontrado,
    date: formatarDataSimples(itemBackend.data_encontrado),
    status: statusMap[itemBackend.status] || (itemBackend.status as Status),
    image: fotoCapa,
    images: urlsFotos.length > 0 ? urlsFotos : [fotoCapa],
    description: itemBackend.descricao,
    collectionPoint: itemBackend.ponto_coleta || itemBackend.ponto_coleta_nome || '',
    daysFound: calcularDias(itemBackend.data_disponibilizacao || itemBackend.data_encontrado),
  };
}
// Traduz um item finalizado (inclui dados de finalização)
function traduzirItemFinalizado(i: ItemFinalizadoBackend): ItemFinalizadoTela {
  const statusMap: Record<string, Status> = {
    entregue: 'Entregue',
    descartado: 'Descartado',
  };
  return {
    id: i.id,
    name: i.nome || i.descricao,
    category: i.categoria,
    location: i.local_encontrado,
    date: formatarDataSimples(i.data_encontrado),
    status: statusMap[i.status] || (i.status as Status),
    image: i.foto_capa || 'https://via.placeholder.com/200?text=Sem+foto',
    collectionPoint: i.ponto_coleta || '',
    finalizadoEmRaw: i.finalizado_em,
    finalizadoEm: i.finalizado_em ? new Date(i.finalizado_em).toLocaleDateString('pt-BR') : '',
    finalizadoPor: i.finalizado_por || '—',
    motivoDescarte: i.motivo_descarte || '',
  };
  
}

// Resposta paginada das listagens (GET /api/itens e /api/itens/finalizados)
interface PaginaBackend<T> {
  itens: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

// Página já traduzida pro formato das telas
export interface Pagina<T> {
  itens: T[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

// Filtros da listagem pública; a busca e os filtros rodam no servidor
export type OrdemListagem = 'recentes' | 'antigos' | 'nome';
export interface FiltrosListagem {
  q?: string;
  categoriaId?: number;
  dataInicio?: string;
  dataFim?: string;
  ordem?: OrdemListagem;
  pagina?: number;
  limite?: number;
}

// Monta a query string ignorando vazios e os valores padrão do backend
// (assim a primeira página sem filtros sempre vira a mesma URL)
function queryString(params: Record<string, string | number | undefined>) {
  const padroes: Record<string, string> = { ordem: 'recentes', pagina: '1' };
  const busca = new URLSearchParams();
  for (const [chave, valor] of Object.entries(params)) {
    if (valor === undefined || valor === '') continue;
    if (padroes[chave] === String(valor)) continue;
    busca.set(chave, String(valor));
  }
  const texto = busca.toString();
  return texto ? `?${texto}` : '';
}

function traduzirPagina<T, R>(dados: PaginaBackend<T>, traduzir: (item: T) => R): Pagina<R> {
  return {
    itens: dados.itens.map(traduzir),
    total: dados.total,
    pagina: dados.pagina,
    totalPaginas: dados.totalPaginas,
  };
}

async function buscarItensDisponiveis(filtros: FiltrosListagem = {}) {
  const dados = await request<PaginaBackend<ItemBackend>>(`/api/itens${queryString({ ...filtros })}`);
  return traduzirPagina(dados, traduzirItem);   // traduz cada item
}

// Fotos do Cloudinary em tamanho de miniatura: o card mostra a foto pequena,
// então pedimos uma versão redimensionada (e em WebP/AVIF quando o navegador
// aceitar) em vez do original da câmera. URLs de fora do Cloudinary passam direto.
export function fotoMiniatura(url: string, largura = 400) {
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/w_${largura},c_limit,q_auto,f_auto/`);
}

// A tela de carregamento já dispara a busca da listagem; a primeira chamada
// de itensApi.listar() sem filtros reaproveita essa mesma requisição.
let listagemPrefetch: Promise<Pagina<ItemTela>> | null = null;

export function prefetchListagem() {
  if (!listagemPrefetch) listagemPrefetch = buscarItensDisponiveis();
  return listagemPrefetch;
}

export const itensApi = {
  // Uma página de itens disponíveis (24 por padrão)
  listar(filtros: FiltrosListagem = {}) {
    const semFiltros = queryString({ ...filtros }) === '';
    if (listagemPrefetch && semFiltros) {
      const emAndamento = listagemPrefetch;
      listagemPrefetch = null;
      return emAndamento;
    }
    return buscarItensDisponiveis(filtros);
  },
  async detalhe(id: number) {
    const dado = await request<ItemBackend>(`/api/itens/${id}`);
    return traduzirItem(dado);
  },
  descartar: (id: number, motivo: string) =>
    request<RespostaMensagem & { reivindicacoes_rejeitadas: number }>(`/api/itens/${id}/descartar`, {
      method: 'PATCH',
      body: JSON.stringify({ motivo }),
    }),
  editar: (id: number, dados: DadosEdicaoItem) =>
    request<RespostaMensagem>(`/api/itens/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dados),
    }),
  criar: (formData: FormData) => requestUpload<{ id: number }>('/api/itens', formData),
  // Uma página de finalizados; "todos" junta entregues e descartados
  async listarFinalizados(
    status: 'entregue' | 'descartado' | 'todos',
    { q, pagina }: { q?: string; pagina?: number } = {},
  ) {
    const dados = await request<PaginaBackend<ItemFinalizadoBackend>>(
      `/api/itens/finalizados${queryString({ status, q, pagina })}`,
    );
    return traduzirPagina(dados, traduzirItemFinalizado);
  },
};

// ===== ALUNOS =====

// Aluno como vem de GET /api/alunos/meus
interface AlunoBackend {
  id: number;
  nome: string;
  sala: string;
  periodo: string;
  ano_letivo: number;
  created_at: string;
}

// Traduz um aluno do backend pro formato da tela
function traduzirAluno(a: AlunoBackend) {
  const periodoMap: Record<string, string> = {
    manha: 'Manhã', tarde: 'Tarde', integral: 'Integral',
  };
  return {
    id: a.id,
    name: a.nome,
    room: a.sala,
    period: periodoMap[a.periodo] || a.periodo,
    periodoRaw: a.periodo,        // valor cru, útil pro form de edição
    anoLetivo: a.ano_letivo,
  };
}

export const alunosApi = {
  async listarMeus() {
    const dados = await request<AlunoBackend[]>('/api/alunos/meus');
    return dados.map(traduzirAluno);
  },

  criar: (dados: DadosAluno) =>
    request<RespostaMensagem>('/api/alunos', { method: 'POST', body: JSON.stringify(dados) }),

  atualizar: (id: number, dados: DadosAluno) =>
    request<RespostaMensagem>(`/api/alunos/${id}`, { method: 'PATCH', body: JSON.stringify(dados) }),
};

// ===== REIVINDICAÇÕES =====

// Reivindicação como vem de /pendentes e /em-processo (painel da funcionária)
interface ReivindicacaoBackend {
  id: number;
  item_id: number;
  nome_requerente: string;
  email_requerente: string;
  telefone_requerente: string | null;
  nome_aluno: string;
  sala_aluno: string;
  periodo_aluno: string;
  user_id: number | null;
  created_at: string;
  data_aprovacao?: string | null; // só em /em-processo
  item_descricao: string;
  item_foto: string | null;
}

// Reivindicação como vem de /minhas (painel do responsável)
interface ReivindicacaoClienteBackend {
  id: number;
  item_id: number;
  status: string;
  nome_aluno: string;
  sala_aluno: string;
  periodo_aluno: string;
  motivo_rejeicao: string | null;
  created_at: string;
  data_aprovacao: string | null;
  item_descricao: string;
  item_foto: string | null;
}

// Reivindicação no formato da tela da funcionária (traduzirReivindicacao)
export interface ReivindicacaoTela {
  id: number;
  itemId: number;
  itemName: string;
  itemImage: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  studentName: string;
  studentRoom: string;
  studentPeriod: string;
  date: string;
  status: Status;
}

// Reivindicação no formato do painel do responsável (traduzirReivindicacaoCliente)
export interface ReivindicacaoClienteTela {
  id: number;
  itemId: number;
  itemName: string;
  itemImage: string;
  studentName: string;
  studentRoom: string;
  studentPeriod: string;
  date: string;
  status: Status;
  motivoRejeicao: string;
}

// Corpo de POST /api/reivindicacoes (criarReivindicacaoSchema)
export interface DadosReivindicacao {
  item_id: number;
  aluno_id?: number;
  nome_requerente: string;
  email_requerente: string;
  telefone_requerente?: string;
  nome_aluno: string;
  sala_aluno: string;
  periodo_aluno: string; // 'integral' | 'manha' | 'tarde'
}

// Traduz uma reivindicação do backend pro formato da tela
function traduzirReivindicacao(r: ReivindicacaoBackend): ReivindicacaoTela {
  const periodoMap: Record<string, string> = {
    manha: 'Manhã', tarde: 'Tarde', integral: 'Integral',
  };
  return {
    id: r.id,
    itemId: r.item_id,
    itemName: r.item_descricao,
    itemImage: r.item_foto || 'https://via.placeholder.com/200?text=Sem+foto',
    claimantName: r.nome_requerente,
    claimantEmail: r.email_requerente,
    claimantPhone: r.telefone_requerente || '',
    studentName: r.nome_aluno,
    studentRoom: r.sala_aluno,
    studentPeriod: periodoMap[r.periodo_aluno] || r.periodo_aluno,
    date: r.created_at ? new Date(r.created_at).toLocaleDateString('pt-BR') : '',
    status: 'Pendente',
  };
}

// Tradução para o painel do cliente (inclui status variável)
function traduzirReivindicacaoCliente(r: ReivindicacaoClienteBackend): ReivindicacaoClienteTela {
  const statusMap: Record<string, Status> = {
    pendente: 'Pendente',
    aprovada: 'Em Processo',
    rejeitada: 'Rejeitada',
    cancelada: 'Cancelada',
    entregue: 'Entregue',
  };
  const periodoMap: Record<string, string> = {
    manha: 'Manhã', tarde: 'Tarde', integral: 'Integral',
  };
  return {
    id: r.id,
    itemId: r.item_id,
    itemName: r.item_descricao,
    itemImage: r.item_foto || 'https://via.placeholder.com/200?text=Sem+foto',
    studentName: r.nome_aluno,
    studentRoom: r.sala_aluno,
    studentPeriod: periodoMap[r.periodo_aluno] || r.periodo_aluno,
    date: r.created_at ? new Date(r.created_at).toLocaleDateString('pt-BR') : '',
    status: statusMap[r.status] || (r.status as Status),
    motivoRejeicao: r.motivo_rejeicao || '',
  };
}

export const reivindicacoesApi = {
  criar: (dados: DadosReivindicacao) =>
    request<RespostaMensagem & { id: number }>('/api/reivindicacoes', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  async listarPendentes() {
    const dados = await request<ReivindicacaoBackend[]>('/api/reivindicacoes/pendentes');
    return dados.map(traduzirReivindicacao);
  },

  aprovar: (id: number) =>
    request<RespostaMensagem>(`/api/reivindicacoes/${id}/aprovar`, { method: 'PATCH' }),

  rejeitar: (id: number, motivo: string) =>
    request<RespostaMensagem>(`/api/reivindicacoes/${id}/rejeitar`, {
      method: 'PATCH',
      body: JSON.stringify({ motivo_rejeicao: motivo }),
    }),

    async listarEmProcesso() {
    const dados = await request<ReivindicacaoBackend[]>('/api/reivindicacoes/em-processo');
    return dados.map(traduzirReivindicacao);
  },

  confirmarEntrega: (id: number) =>
    request<RespostaMensagem>(`/api/reivindicacoes/${id}/entregar`, { method: 'PATCH' }),

  cancelar: (id: number, motivo: string) =>
    request<RespostaMensagem>(`/api/reivindicacoes/${id}/cancelar`, {
      method: 'PATCH',
      body: JSON.stringify({ motivo }),
    }),

    async listarMinhas() {
    const dados = await request<ReivindicacaoClienteBackend[]>('/api/reivindicacoes/minhas');
    return dados.map(traduzirReivindicacaoCliente);
  },

    reverterEntrega: (itemId: number) =>
    request<RespostaMensagem>(`/api/reivindicacoes/reverter/${itemId}`, { method: 'PATCH' }),
  

  
};


// ===== USUÁRIOS (gestão de funcionárias) =====
// Funcionária como vem de GET /api/usuarios/funcionarias
interface FuncionariaBackend {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  is_diretora: boolean | number;
  ativo: boolean | number;
  avatar_seed: string | null;
  ultimo_login_em: string | null;
  created_at: string;
}

// Corpo de PATCH /api/usuarios/funcionarias/:id (editarFuncionariaSchema)
export interface DadosFuncionaria {
  nome: string;
  email: string;
  telefone?: string;
  is_diretora?: boolean;
}

// Corpo de POST /api/usuarios/funcionarias (criarFuncionariaSchema)
export interface DadosNovaFuncionaria extends DadosFuncionaria {
  senha: string;
}

// Resposta de PATCH /api/usuarios/perfil
export interface RespostaPerfil {
  mensagem: string;
  usuario: {
    nome: string;
    email: string;
    telefone: string | null;
    email_verificado_em: string | null;
  };
}

function traduzirFuncionaria(u: FuncionariaBackend) {
  return {
    id: u.id,
    name: u.nome,
    email: u.email,
    phone: u.telefone || '',
    isDiretora: !!u.is_diretora,
    avatarSeed: u.avatar_seed,
    role: u.is_diretora ? 'Diretora' : 'Inspetora',
    active: !!u.ativo,
    lastLogin: u.ultimo_login_em
      ? new Date(u.ultimo_login_em).toLocaleDateString('pt-BR')
      : 'Nunca acessou',
  };
}

export const usuariosApi = {
  async listarFuncionarias() {
    const dados = await request<FuncionariaBackend[]>('/api/usuarios/funcionarias');
    return dados.map(traduzirFuncionaria);
  },

  criar: (dados: DadosNovaFuncionaria) =>
    request<RespostaMensagem>('/api/usuarios/funcionarias', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  atualizar: (id: number, dados: DadosFuncionaria) =>
    request<RespostaMensagem>(`/api/usuarios/funcionarias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dados),
    }),

  alterarStatus: (id: number, ativo: boolean) =>
    request<RespostaMensagem>(`/api/usuarios/funcionarias/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ ativo }),
    }),

    atualizarAvatar: (avatarSeed: string) =>
      request<RespostaMensagem & { avatar_seed: string }>('/api/usuarios/avatar', {
        method: 'PATCH',
        body: JSON.stringify({ avatar_seed: avatarSeed }),
      }),

      alterarSenha: (senhaAtual: string, novaSenha: string) =>
    request<RespostaMensagem>('/api/usuarios/senha', {
      method: 'PATCH',
      body: JSON.stringify({ senhaAtual, novaSenha }),
    }),

      atualizarPerfil: (dados: { nome: string; email: string; telefone?: string }) =>
    request<RespostaPerfil>('/api/usuarios/perfil', {
      method: 'PATCH',
      body: JSON.stringify(dados),
    }),
};

// ===== RELATÓRIOS =====

// Resposta de GET /api/relatorios?dias=N (relatoriosService.gerar)
export interface Relatorio {
  total_cadastrados: number;
  total_entregues: number;
  total_descartados: number;
  taxa_devolucao: number;
  por_status: { status: string; total: number }[];
  por_mes: { mes: string; encontrados: number; devolvidos: number; descartados: number }[];
  por_categoria: { categoria: string; total: number }[];
}

// Reivindicação recente do dashboard (relatoriosRepository.reivindicacoesRecentes)
interface ReivindicacaoRecenteBackend {
  id: number;
  status: string;
  created_at: string;
  nome_requerente: string;
  nome_aluno: string;
  sala_aluno: string;
  item_nome: string;
  item_foto: string | null;
}

// Resposta de GET /api/relatorios/dashboard (relatoriosService.dashboard)
interface DashboardBackend {
  itens_disponiveis: number;
  disponiveis_semana: number;
  pendentes: number;
  pendentes_hoje: number;
  em_processo: number;
  em_processo_prazo: number;
  entregues_mes: number;
  entregues_mes_anterior: number;
  variacao_entregues: number | null;
  por_mes: { mes: string; encontrados: number; devolvidos: number; descartados: number }[];
  por_categoria: { categoria: string; total: number }[];
  reivindicacoes_recentes: ReivindicacaoRecenteBackend[];
}

export const relatoriosApi = {
  gerar: (dias: number) => request<Relatorio>(`/api/relatorios?dias=${dias}`),

  async dashboard() {
    const dados = await request<DashboardBackend>('/api/relatorios/dashboard');
    const statusMap: Record<string, Status> = {
      pendente: 'Pendente',
      aprovada: 'Em Processo',
    };
    return {
      ...dados,
      reivindicacoes_recentes: dados.reivindicacoes_recentes.map((r) => ({
        id: r.id,
        itemName: r.item_nome,
        itemImage: r.item_foto || 'https://via.placeholder.com/200?text=Sem+foto',
        claimantName: r.nome_requerente,
        studentName: r.nome_aluno,
        room: r.sala_aluno,
        date: r.created_at ? new Date(r.created_at).toLocaleDateString('pt-BR') : '',
        status: statusMap[r.status] || (r.status as Status),
      })),
    };
  },
};

// ===== LGPD =====

// Responsável encontrado por GET /api/lgpd/buscar
export interface ResponsavelLgpd {
  id: number;
  nome: string;
  email: string;
}

export const lgpdApi = {
  buscar: (email: string) =>
    request<ResponsavelLgpd>(`/api/lgpd/buscar?email=${encodeURIComponent(email)}`),

  anonimizar: (email: string, confirmacao: string) =>
    request<RespostaMensagem>('/api/lgpd/anonimizar', {
      method: 'POST',
      body: JSON.stringify({ email, confirmacao }),
    }),
};