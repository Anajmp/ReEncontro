import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { itensApi } from '../../lib/api';
import { ArrowLeft, MapPin, Calendar, Package, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { StatusBadge } from './shared/StatusBadge';
import { ClaimModal } from './shared/ClaimModal';
import { SiteFooter, SiteHeader } from './shared/SiteHeader';
import { useLoginSplash } from './LoginSplash';
import type { Screen } from '../App';
import type { Status } from './shared/data';
import { CONTEUDO_ID } from '../../lib/acessibilidade';

const FONT = { fontFamily: 'Plus Jakarta Sans, sans-serif' };

interface Props {
  navigate: (s: Screen) => void;
}

// Item como devolvido por itensApi.detalhe() (já traduzido pro formato da tela)
interface ItemDetalhe {
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
}

export function ItemDetail({ navigate }: Props) {
  const { id } = useParams();
  const [claimOpen, setClaimOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [item, setItem] = useState<ItemDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const { playCadastroTransition } = useLoginSplash();

  useEffect(() => {
    if (id) {
      itensApi.detalhe(Number(id))
        .then(setItem)
        .catch(err => console.error('Erro ao carregar item:', err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Enquanto carrega
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fundo" style={FONT}>
        <p className="text-tinta-suave" role="status">Carregando item...</p>
      </div>
    );
  }

  // Se não encontrou o item
  if (!item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-fundo" style={FONT}>
        <h1 className="text-tinta-suave">Item não encontrado.</h1>
        <Button onClick={() => navigate('public-listing')}>Voltar para a listagem</Button>
      </div>
    );
  }

  const photos = item.images?.length ? item.images : [item.image];
  
  const infoRows = [
    { icon: Package, label: 'Categoria', value: item.category },
    { icon: MapPin, label: 'Local encontrado', value: item.location },
    { icon: Calendar, label: 'Data encontrado', value: item.date },
    { icon: Building2, label: 'Ponto de coleta', value: item.collectionPoint },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-fundo" style={FONT}>
      <SiteHeader navigate={navigate} />

      <main id={CONTEUDO_ID} tabIndex={-1} className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-5 outline-none sm:px-8 sm:py-8">
        <button
          type="button"
          onClick={() => navigate('public-listing')}
          className="mb-6 flex items-center gap-2 text-sm text-tinta-suave transition-colors hover:text-tinta"
        >
          <ArrowLeft className="size-4" />
          Voltar para a listagem
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="aspect-[6/7] bg-fundo rounded-lg overflow-hidden">
              <img
                src={photos[activePhoto]}
                alt={photos.length > 1 ? `${item.name} — foto ${activePhoto + 1} de ${photos.length}` : item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2" role="group" aria-label="Fotos do item">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActivePhoto(i)}
                  aria-label={`Ver foto ${i + 1} de ${photos.length}`}
                  aria-pressed={activePhoto === i}
                  className={`w-20 h-16 rounded-md overflow-hidden border-2 transition-colors shrink-0 ${
                    activePhoto === i ? 'border-[#C8102E]' : 'border-transparent hover:border-linha'
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info card */}
          <div className="space-y-4">
            <div className="bg-superficie rounded-lg border border-linha p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h1 className="text-tinta">{item.name}</h1>
                  <p className="text-tinta-suave text-sm mt-0.5">Ref. #RE-{String(item.id).padStart(4, '0')}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="space-y-3">
                {infoRows.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-fundo rounded-md flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="size-4 text-tinta-suave" aria-hidden />
                    </div>
                    <div>
                      <div className="text-xs text-tinta-suave">{label}</div>
                      <div className="text-sm text-tinta font-medium">{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-linha">
                <div className="text-xs text-tinta-suave mb-1">Descrição</div>
                <p className="text-sm text-tinta-suave leading-relaxed">{item.description}</p>
              </div>

              <Button
                size="lg"
                className="w-full mt-5 bg-[#C8102E] hover:bg-[#A00D24]"
                onClick={() => setClaimOpen(true)}
                disabled={item.status === 'Entregue' || item.status === 'Descartado'}
              >
                Este item é meu!
              </Button>
            </div>

            <div className="bg-alerta-fundo border border-alerta-borda rounded-lg px-4 py-3 text-sm text-alerta-texto">
              <strong>Como funciona?</strong> Após enviar a reivindicação, nossa equipe verificará os dados e entrará em contato em até 2 dias úteis para confirmar a retirada.
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />

      <ClaimModal
        item={item}
        open={claimOpen}
        onClose={() => setClaimOpen(false)}
        onCadastrar={e => {
          setClaimOpen(false);
          playCadastroTransition(e);
        }}
      />
    </div>
  );
}
