import { useState, useRef } from 'react';
import { Upload, X, ImagePlus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AdminLayout } from './shared/AdminLayout';
import type { Screen } from '../App';

interface Props {
  navigate: (s: Screen) => void;
}

interface PhotoPreview {
  id: number;
  url: string;
  name: string;
}

export function RegisterItem({ navigate }: Props) {
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addPhoto = (file: File) => {
    const url = URL.createObjectURL(file);
    setPhotos(prev => [...prev, { id: Date.now(), url, name: file.name }]);
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

  if (saved) {
    return (
      <AdminLayout current="register-item" navigate={navigate}>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="size-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-gray-900 mb-1">Item cadastrado com sucesso!</h2>
            <p className="text-sm text-gray-500 mb-5">O item já está disponível na listagem pública.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('available-items')}>Ver itens disponíveis</Button>
              <Button className="bg-[#C8102E] hover:bg-[#A00D24]" onClick={() => setSaved(false)}>Cadastrar outro</Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout current="register-item" navigate={navigate}>
      <div className="p-6 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-gray-900">Cadastrar Item</h1>
          <p className="text-sm text-gray-500 mt-1">Registre um novo item encontrado no sistema.</p>
        </div>

        <div className="space-y-5">
          {/* Photo upload */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-gray-900 mb-3">Fotos do item</h3>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-[#C8102E] bg-red-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">Arraste fotos aqui ou clique para selecionar</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG até 10MB · Máximo 5 fotos</p>
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
              <div className="flex flex-wrap gap-3 mt-4">
                {photos.map(photo => (
                  <div key={photo.id} className="relative w-20 h-20 rounded-lg overflow-hidden group border border-gray-200">
                    <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                    <button
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      onClick={e => { e.stopPropagation(); removePhoto(photo.id); }}
                    >
                      <X className="size-4 text-white" />
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <button
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="size-5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Item info */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-gray-900 mb-4">Informações do item</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Descrição *</Label>
                <Input placeholder="Ex: Mochila azul marinho com alças ajustáveis, sem identificação..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Categoria *</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vestuario">Vestuário</SelectItem>
                      <SelectItem value="acessorios">Acessórios</SelectItem>
                      <SelectItem value="material">Material Escolar</SelectItem>
                      <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                      <SelectItem value="calcados">Calçados</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Data encontrado *</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Local encontrado *</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patio">Pátio Principal</SelectItem>
                      <SelectItem value="refeitorio">Refeitório</SelectItem>
                      <SelectItem value="biblioteca">Biblioteca</SelectItem>
                      <SelectItem value="quadra">Quadra de Esportes</SelectItem>
                      <SelectItem value="vestiario">Vestiário</SelectItem>
                      <SelectItem value="corredor-a">Corredor Bloco A</SelectItem>
                      <SelectItem value="corredor-b">Corredor Bloco B</SelectItem>
                      <SelectItem value="portaria">Portaria</SelectItem>
                      <SelectItem value="lab">Laboratório de Informática</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Ponto de coleta *</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sec-a">Secretaria — Bloco A</SelectItem>
                      <SelectItem value="sec-b">Secretaria — Bloco B</SelectItem>
                      <SelectItem value="portaria">Portaria — Entrada Principal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('available-items')}>Cancelar</Button>
            <Button className="bg-[#C8102E] hover:bg-[#A00D24]" onClick={() => setSaved(true)}>
              Cadastrar item
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
