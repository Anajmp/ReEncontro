// =====================================================================
// Camada de comunicação com o backend (API ReEncontro).
// Todas as chamadas HTTP passam por aqui.
// =====================================================================

// A URL do backend vem da variável de ambiente (Vercel/local)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Função base que faz as requisições e trata erros, tipo fetch
async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Se tiver token, manda no cabeçalho (pras rotas protegidas)
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Se a resposta não for OK, lança erro com a mensagem do backend
  if (!res.ok) {
    const erro = await res.json().catch(() => ({ erro: 'Erro na requisição' }));
    throw new Error(erro.erro || erro.mensagem || 'Erro na requisição');
  }

  return res.json();
}

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
    daysFound: 0,
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
};