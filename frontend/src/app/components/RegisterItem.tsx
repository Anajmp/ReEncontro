import { useState, useRef } from 'react';
import { Upload, X, ImagePlus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AdminLayout } from './shared/AdminLayout';
import type { Screen } from '../App';
import { AdminPanel, adminBtnOutline, adminBtnPrimary, adminInputClass, adminSelectClass } from './shared/AdminChrome';
import { cn } from './ui/utils';
import { itensApi } from '../../lib/api';
import { useEffect } from 'react';
import { referenciasApi } from '../../lib/api';


interface PhotoPreview {
  id: number;
  url: string;
  name: string;
  file: File;        // ← guarda o arquivo real
}

interface Props {
  navigate: (s: Screen) => void;
}

export function RegisterItem({ navigate }: Props) {
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [descricao, setDescricao] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [local, setLocal] = useState('');
  const [pontoColetaId, setPontoColetaId] = useState('');
  const [dataEncontrado, setDataEncontrado] = useState(new Date().toISOString().split('T')[0]);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
    const [categorias, setCategorias] = useState<any[]>([]);
  const [pontosColeta, setPontosColeta] = useState<any[]>([]);

  useEffect(() => {
    referenciasApi.categorias().then(setCategorias).catch(console.error);
    referenciasApi.pontosColeta().then(setPontosColeta).catch(console.error);
  }, []);

    const addPhoto = (file: File) => {
    const url = URL.createObjectURL(file);
    setPhotos(prev => [...prev, { id: Date.now() + Math.random(), url, name: file.name, file }]);
  };

  const removePhoto = (id: number) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    Array.from(e.dataTransfer.files)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, 5 - photos.length)
      .forEach(addPhoto);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files)
      .slice(0, 5 - photos.length)
      .forEach(addPhoto);
  };

    async function cadastrar() {
    setErro('');
    if (photos.length === 0) {
      setErro('Adicione ao menos uma foto do item.');
      return;
    }
    if (!descricao.trim() || !categoriaId || !local || !pontoColetaId || !dataEncontrado) {
      setErro('Preencha todos os campos obrigatórios (*).');
      return;
    }

    setSalvando(true);
    try {
      const formData = new FormData();
      formData.append('descricao', descricao.trim());
      formData.append('categoriaId', categoriaId);
      formData.append('localEncontrado', local);
      formData.append('pontoColetaId', pontoColetaId);
      formData.append('dataEncontrado', dataEncontrado);
      photos.forEach(p => formData.append('fotos', p.file));

      await itensApi.criar(formData);

      // limpa o formulário e mostra sucesso
      setPhotos([]); setDescricao(''); setCategoriaId('');
      setLocal(''); setPontoColetaId('');
      setSaved(true);
    } catch (err: any) {
      setErro(err.message || 'Erro ao cadastrar o item.');
    } finally {
      setSalvando(false);
    }
  }

  if (saved) {
    return (
      <AdminLayout current="register-item" navigate={navigate}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[#D1FAE5]">
              <svg className="size-8 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-1 text-xl font-bold text-[#1C1917]">Item cadastrado com sucesso!</h2>
            <p className="mb-5 text-sm text-[#78716C]">O item já está disponível na listagem pública.</p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" className={adminBtnOutline} onClick={() => navigate('available-items')}>
                Ver itens disponíveis
              </Button>
              <Button className={adminBtnPrimary} onClick={() => setSaved(false)}>
                Cadastrar outro
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout current="register-item" navigate={navigate}>
      <div className="mx-auto max-w-3xl space-y-5">
        <AdminPanel className="p-5">
          <h3 className="mb-3 text-base font-bold text-[#1C1917]">Fotos do item</h3>
          <div
            className={cn(
              'cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors',
              isDragging
                ? 'border-[#C8102E] bg-[#FEE2E2]/40'
                : 'border-[#E7E5E4] hover:border-[#C8102E]/40 hover:bg-[#F5F3F0]',
            )}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto mb-2 size-8 text-[#A8A29E]" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-[#78716C]">Arraste fotos aqui ou clique para selecionar</p>
            <p className="mt-1 text-xs text-[#A8A29E]">PNG, JPG até 10MB · Máximo 5 fotos</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {photos.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {photos.map(photo => (
                <div key={photo.id} className="group relative size-20 overflow-hidden rounded-xl border border-[#E7E5E4]">
                  <img src={photo.url} alt={photo.name} className="size-full object-cover" />
                  <button
                    type="button"
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={e => { e.stopPropagation(); removePhoto(photo.id); }}
                  >
                    <X className="size-4 text-white" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <button
                  type="button"
                  className="flex size-20 items-center justify-center rounded-xl border-2 border-dashed border-[#E7E5E4] text-[#A8A29E] transition-colors hover:border-[#C8102E]/40 hover:text-[#78716C]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="size-5" />
                </button>
              )}
            </div>
          )}
        </AdminPanel>

        <AdminPanel className="p-5">
          <h3 className="mb-4 text-base font-bold text-[#1C1917]">Informações do item</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-[#1C1917]">Descrição *</Label>
              <Input className={adminInputClass} placeholder="Ex: Mochila azul marinho..." value={descricao} onChange={e => setDescricao(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#1C1917]">Categoria *</Label>
                <Select value={categoriaId} onValueChange={setCategoriaId}>
  <SelectTrigger className={adminSelectClass}><SelectValue placeholder="Selecione" /></SelectTrigger>
  <SelectContent>
    {categorias.map(c => (
      <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>
    ))}
  </SelectContent>
</Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#1C1917]">Data encontrado *</Label>
                <Input type="date" className={adminInputClass} value={dataEncontrado} onChange={e => setDataEncontrado(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#1C1917]">Local encontrado *</Label>
                <Select value={local} onValueChange={setLocal}>
  <SelectTrigger className={adminSelectClass}><SelectValue placeholder="Selecione" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="Pátio Principal">Pátio Principal</SelectItem>
    <SelectItem value="Refeitório">Refeitório</SelectItem>
    <SelectItem value="Biblioteca">Biblioteca</SelectItem>
    <SelectItem value="Quadra de Esportes">Quadra de Esportes</SelectItem>
    <SelectItem value="Vestiário">Vestiário</SelectItem>
    <SelectItem value="Corredor Bloco A">Corredor Bloco A</SelectItem>
    <SelectItem value="Corredor Bloco B">Corredor Bloco B</SelectItem>
    <SelectItem value="Portaria">Portaria</SelectItem>
    <SelectItem value="Laboratório de Informática">Laboratório de Informática</SelectItem>
  </SelectContent>
</Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#1C1917]">Ponto de coleta *</Label>
                <Select value={pontoColetaId} onValueChange={setPontoColetaId}>
  <SelectTrigger className={adminSelectClass}><SelectValue placeholder="Selecione" /></SelectTrigger>
  <SelectContent>
    {pontosColeta.map(p => (
      <SelectItem key={p.id} value={String(p.id)}>{p.nome}</SelectItem>
    ))}
  </SelectContent>
</Select>
              </div>
            </div>
          </div>
        </AdminPanel>

        <div className="flex justify-end gap-3">
                  {erro && (
          <p className="rounded-xl bg-[#FFF1F2] px-4 py-3 text-sm text-[#C8102E]">{erro}</p>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" className={adminBtnOutline} onClick={() => navigate('available-items')} disabled={salvando}>
            Cancelar
          </Button>
          <Button className={adminBtnPrimary} onClick={cadastrar} disabled={salvando}>
            {salvando ? 'Cadastrando...' : 'Cadastrar item'}
          </Button>
        </div>
        </div>
      </div>
    </AdminLayout>
  );
}
