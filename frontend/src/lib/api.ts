// =====================================================================
// Camada de comunicação com o backend (API ReEncontro).
// Todas as chamadas HTTP passam por aqui.
// =====================================================================

// A URL do backend vem da variável de ambiente (Vercel/local)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Função base que faz as requisições e trata erros, tipo fetch
async function request(endpoint: string, options: RequestInit = {}) {
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

  // Se a resposta não for OK, lança erro com a mensagem do backend
  if (!res.ok) {
    const erro = await res.json().catch(() => ({}));
    throw new Error(
      erro.erro || erro.mensagem || `Erro ${res.status} ao comunicar com o servidor`
    );
  }

  return res.json();
}

// Requisição com upload de arquivos (multipart/form-data)
async function requestUpload(endpoint: string, formData: FormData) {
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
    const erro = await res.json().catch(() => ({ erro: 'Erro na requisição' }));
    throw new Error(erro.erro || erro.mensagem || 'Erro na requisição');
  }

  return res.json();
}

// ===== REFERÊNCIAS (categorias e pontos de coleta) =====
export const referenciasApi = {
  categorias: () => request('/api/categorias'),
  pontosColeta: () => request('/api/pontos-coleta'),
};

// ===== AUTENTICAÇÃO =====
export const authApi = {
  login: (email: string, senha: string) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    }),

  register: (dados: any) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),
};

// ===== ITENS =====

// Calcula quantos dias se passaram desde uma data
function calcularDias(data: string): number {
  if (!data) return 0;
  const inicio = new Date(data);
  const hoje = new Date();
  const diff = hoje.getTime() - inicio.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Traduz um item do formato do backend pro formato que as telas usam
function traduzirItem(itemBackend: any) {
  const statusMap: Record<string, string> = {
    disponivel: 'Disponível',
    pendente: 'Pendente',
    em_processo: 'Em Processo',
    entregue: 'Entregue',
    descartado: 'Descartado',
  };

  return {
    id: itemBackend.id,
    name: itemBackend.descricao,
    category: itemBackend.categoria,
    location: itemBackend.local_encontrado,
    date: new Date(itemBackend.data_encontrado).toLocaleDateString('pt-BR'),
    status: statusMap[itemBackend.status] || itemBackend.status,
    image: itemBackend.foto_capa || 'https://via.placeholder.com/400x300?text=Sem+foto',
    description: itemBackend.descricao,
    collectionPoint: itemBackend.ponto_coleta || '',
    daysFound: calcularDias(itemBackend.data_disponibilizacao || itemBackend.data_encontrado),
  };
}

export const itensApi = {
  async listar() {
    const dados = await request('/api/itens');
    return dados.map(traduzirItem);   // traduz cada item
  },
  async detalhe(id: number) {
    const dado = await request(`/api/itens/${id}`);
    return traduzirItem(dado);
  },
  descartar: (id: number) =>
    request(`/api/itens/${id}/descartar`, { method: 'PATCH' }),
  editar: (id: number, dados: any) =>
    request(`/api/itens/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dados),
    }),
  criar: (formData: FormData) => requestUpload('/api/itens', formData),
};

// ===== ALUNOS =====

// Traduz um aluno do backend pro formato da tela
function traduzirAluno(a: any) {
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
    const dados = await request('/api/alunos/meus');
    return dados.map(traduzirAluno);
  },

  criar: (dados: any) =>
    request('/api/alunos', { method: 'POST', body: JSON.stringify(dados) }),

  atualizar: (id: number, dados: any) =>
    request(`/api/alunos/${id}`, { method: 'PATCH', body: JSON.stringify(dados) }),
};

// ===== REIVINDICAÇÕES =====

// Traduz uma reivindicação do backend pro formato da tela
function traduzirReivindicacao(r: any) {
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
function traduzirReivindicacaoCliente(r: any) {
  const statusMap: Record<string, string> = {
    pendente: 'Pendente', aprovada: 'Em Processo', rejeitada: 'Descartado',
    cancelada: 'Descartado', entregue: 'Entregue',
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
    status: statusMap[r.status] || r.status,
    motivoRejeicao: r.motivo_rejeicao || '',
  };
}

export const reivindicacoesApi = {
  criar: (dados: any) =>
    request('/api/reivindicacoes', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  async listarPendentes() {
    const dados = await request('/api/reivindicacoes/pendentes');
    return dados.map(traduzirReivindicacao);
  },

  aprovar: (id: number) =>
    request(`/api/reivindicacoes/${id}/aprovar`, { method: 'PATCH' }),

  rejeitar: (id: number, motivo: string) =>
    request(`/api/reivindicacoes/${id}/rejeitar`, {
      method: 'PATCH',
      body: JSON.stringify({ motivo_rejeicao: motivo }),
    }),

    async listarEmProcesso() {
    const dados = await request('/api/reivindicacoes/em-processo');
    return dados.map(traduzirReivindicacao);
  },

  confirmarEntrega: (id: number) =>
    request(`/api/reivindicacoes/${id}/entregar`, { method: 'PATCH' }),

  cancelar: (id: number, motivo: string) =>
    request(`/api/reivindicacoes/${id}/cancelar`, {
      method: 'PATCH',
      body: JSON.stringify({ motivo }),
    }),

    async listarMinhas() {
    const dados = await request('/api/reivindicacoes/minhas');
    return dados.map(traduzirReivindicacaoCliente);
  },

  
};

