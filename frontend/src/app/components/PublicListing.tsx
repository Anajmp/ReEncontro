import { useState, useEffect} from 'react';
import { Search, MapPin, Calendar, LogIn, Check, User, LogOut  } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { StatusBadge } from './shared/StatusBadge';
import { itensApi, reivindicacoesApi } from '../../lib/api';
import type { Item } from './shared/data';
import type { Screen } from '../App';
import { useNavigate } from 'react-router-dom';
import { getUsuario, logout } from '../../lib/auth';
import Logo from "../../assets/LogoInicial.png";


interface Props {
  navigate: (s: Screen) => void;
}

function ClaimModal({ item, open, onClose }: { item: Item | null; open: boolean; onClose: () => void }) {
  const usuario = getUsuario();
  const [submitted, setSubmitted] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nomeAluno, setNomeAluno] = useState('');
  const [sala, setSala] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Pré-preenche nome e email se estiver logado
  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || '');
      setEmail(usuario.email || '');
    }
  }, [open]);

  if (!item) return null;

  async function enviar() {
    setErro('');
    if (!item) return;   // ← garante que item existe (satisfaz o TypeScript)
    // Validação básica
    if (!nome || !email || !nomeAluno || !sala || !periodo) {
      setErro('Preencha todos os campos obrigatórios (*)');
      return;
    }
    setEnviando(true);
    try {
      await reivindicacoesApi.criar({
        item_id: item.id,
        nome_requerente: nome,
        email_requerente: email,
        telefone_requerente: telefone || undefined,
        nome_aluno: nomeAluno,
        sala_aluno: sala,
        periodo_aluno: periodo,
      });
      setSubmitted(true);
    } catch (err: any) {
      setErro(err.message || 'Erro ao enviar reivindicação');
    } finally {
      setEnviando(false);
    }
  }

  function fechar() {
    onClose();
    setSubmitted(false);
    // limpa os campos (menos os pré-preenchidos)
    setNomeAluno(''); setSala(''); setPeriodo(''); setTelefone(''); setErro('');
    if (!usuario) { setNome(''); setEmail(''); }
  }

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={fechar}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="size-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Reivindicação enviada!</h3>
            <p className="text-sm text-gray-500">Você receberá um e-mail em breve. Nossa equipe entrará em contato para confirmar a retirada.</p>
            <Button className="mt-4 bg-[#C8102E] hover:bg-[#A00D24]" onClick={fechar}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Este item é meu!</DialogTitle>
          <p className="text-sm text-gray-500 mt-0.5">
            Reivindicando: <strong className="text-gray-700">{item.name}</strong>
          </p>
        </DialogHeader>

        {/* Aviso para quem não está logado */}
        {!usuario && (
          <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2.5 text-sm text-amber-800">
            💡 Quer acompanhar o status pelo site? <strong>Cadastre-se</strong> antes de reivindicar!
          </div>
        )}

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="claim-name">Nome completo *</Label>
              <Input id="claim-name" placeholder="Seu nome completo" value={nome} onChange={e => setNome(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="claim-email">E-mail *</Label>
              <Input id="claim-email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="claim-phone">
              Telefone <span className="text-gray-400 font-normal">(opcional)</span>
            </Label>
            <Input id="claim-phone" placeholder="(11) 99999-9999" value={telefone} onChange={e => setTelefone(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="claim-student">Nome do aluno *</Label>
              <Input id="claim-student" placeholder="Nome completo do aluno" value={nomeAluno} onChange={e => setNomeAluno(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="claim-room">Sala *</Label>
              <Input id="claim-room" placeholder="Ex: 5A" value={sala} onChange={e => setSala(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Período *</Label>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manha">Manhã</SelectItem>
                <SelectItem value="tarde">Tarde</SelectItem>
                <SelectItem value="integral">Integral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {erro && (
            <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{erro}</p>
          )}
        </div>
        <div className="flex gap-3 pt-2 border-t border-gray-100 mt-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={enviando}>Cancelar</Button>
          <Button className="flex-1 bg-[#C8102E] hover:bg-[#A00D24]" onClick={enviar} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar reivindicação'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PublicListing({ navigate }: Props) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [claimOpen, setClaimOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const routerNavigate = useNavigate();
  const usuario = getUsuario();

  useEffect(() => {
    itensApi.listar()
      .then(setItems)
      .catch(err => console.error('Erro ao carregar itens:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.location.toLowerCase().includes(q);
    const matchCategory = category === 'all' || item.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <img src={Logo} alt="ReEncontro" className="h-12 w-auto object-contain shrink-0" />
          <span className="text-gray-400 text-m hidden sm:inline">SESI Nova Odessa</span>
        </div>
        {usuario ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(usuario.role === 'funcionaria' ? 'admin-dashboard' : 'parent-dashboard')}
              className="gap-2"
            >
              <User className="size-4" />
              <span className="hidden sm:inline">{usuario.nome.split(' ')[0]}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { logout(); window.location.reload(); }}
              className="gap-2 text-gray-500"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => navigate('login')} className="gap-2">
            <LogIn className="size-4" />
            Entrar
          </Button>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-gray-900">Itens Encontrados</h1>
          <p className="text-gray-500 text-sm mt-1">Reconheceu um item? Clique em "É meu!" para iniciar a reivindicação.</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome, descrição ou local..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="Vestuário">Vestuário</SelectItem>
              <SelectItem value="Acessórios">Acessórios</SelectItem>
              <SelectItem value="Material Escolar">Material Escolar</SelectItem>
              <SelectItem value="Eletrônicos">Eletrônicos</SelectItem>
              <SelectItem value="Calçados">Calçados</SelectItem>
              <SelectItem value="Outros">Outros</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" className="w-44" />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Search className="size-10 mx-auto mb-3 opacity-30" />
            <p>Nenhum item encontrado com esses filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div
                  className="relative h-44 bg-gray-100 overflow-hidden cursor-pointer"
                  onClick={() => routerNavigate(`/item/${item.id}`)}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={item.status} />
                  </div>
                </div>
                <div className="p-3.5">
                  <h3
                    className="font-semibold text-gray-900 truncate cursor-pointer hover:text-[#C8102E] transition-colors"
                    onClick={() => routerNavigate(`/item/${item.id}`)}
                  >
                    {item.name}
                  </h3>
                  <span className="inline-block text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5 mt-1">
                    {item.category}
                  </span>
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin className="size-3 text-gray-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="size-3 text-gray-400 shrink-0" />
                      {item.date}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-3 bg-[#C8102E] hover:bg-[#A00D24]"
                    onClick={() => { setSelectedItem(item); setClaimOpen(true); }}
                    disabled={item.status === 'Entregue' || item.status === 'Descartado'}
                  >
                    É meu!
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ClaimModal item={selectedItem} open={claimOpen} onClose={() => setClaimOpen(false)} />
    </div>
  );
}
