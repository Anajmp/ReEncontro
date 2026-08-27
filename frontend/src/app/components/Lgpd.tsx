import { useState } from 'react';
import { ShieldAlert, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AdminLayout } from './shared/AdminLayout';
import { AdminPanel, adminInputClass, adminBtnOutline } from './shared/AdminChrome';
import type { Screen } from '../App';
import { lgpdApi } from '../../lib/api';

interface Props {
  navigate: (s: Screen) => void;
}

export function Lgpd({ navigate }: Props) {
  const [busca, setBusca] = useState('');
  const [encontrado, setEncontrado] = useState<any>(null);
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function buscar() {
    setErro(''); setSucesso(''); setEncontrado(null); setConfirmacao('');
    if (!busca.trim()) {
      setErro('Informe o e-mail do responsável.');
      return;
    }
    setCarregando(true);
    try {
      const usuario = await lgpdApi.buscar(busca.trim());
      setEncontrado(usuario);
    } catch (err: any) {
      setErro(err.message || 'Erro ao buscar o responsável.');
    } finally {
      setCarregando(false);
    }
  }

  async function anonimizar() {
    setErro('');
    if (confirmacao.trim() !== encontrado.email) {
      setErro('O e-mail de confirmação não confere.');
      return;
    }
    setCarregando(true);
    try {
      const res = await lgpdApi.anonimizar(encontrado.email, confirmacao.trim());
      setSucesso(res.mensagem);
      setEncontrado(null);
      setBusca(''); setConfirmacao('');
    } catch (err: any) {
      setErro(err.message || 'Erro ao anonimizar os dados.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AdminLayout current="lgpd" navigate={navigate}>
      <div className="mx-auto max-w-2xl space-y-5">
        {/* Explicação */}
        <AdminPanel className="p-5">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FEE2E2]">
              <ShieldAlert size={20} strokeWidth={1.7} className="text-[#C8102E]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1C1917]">Exclusão de dados pessoais</h2>
              <p className="mt-1 text-sm leading-relaxed text-[#78716C]">
                Conforme o art. 18 da LGPD, o responsável pode solicitar a exclusão dos
                seus dados pessoais. Os registros históricos de reivindicações são
                preservados, mas todos os campos que identificam a pessoa são
                substituídos por valores genéricos.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-xl border border-[#FEF3C7] bg-[#FEF3C7]/50 px-4 py-3 text-sm text-[#92400E]">
            <AlertTriangle size={16} strokeWidth={1.8} className="mt-0.5 shrink-0" />
            <span>Esta ação é <strong>irreversível</strong>. Confirme a solicitação do titular antes de prosseguir.</span>
          </div>
        </AdminPanel>

        {/* Busca */}
        <AdminPanel className="p-5">
          <Label className="text-sm font-semibold text-[#1C1917]">E-mail do responsável</Label>
          <div className="mt-1.5 flex gap-3">
            <Input
              className={adminInputClass}
              type="email"
              placeholder="responsavel@email.com"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && buscar()}
            />
            <Button className="gap-2 bg-[#C8102E] hover:bg-[#A50D26]" onClick={buscar} disabled={carregando}>
              <Search className="size-4" />
              Buscar
            </Button>
          </div>

          {erro && (
            <p className="mt-3 rounded-xl bg-[#FFF1F2] px-4 py-2.5 text-sm text-[#C8102E]">{erro}</p>
          )}
          {sucesso && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#BBF7D0] bg-[#DCFCE7] px-4 py-3 text-sm text-[#15803D]">
              <CheckCircle2 size={15} strokeWidth={2} />
              {sucesso}
            </div>
          )}
        </AdminPanel>

        {/* Confirmação */}
        {encontrado && (
          <AdminPanel className="border-[#FECDD3] p-5">
            <h3 className="mb-3 text-sm font-bold text-[#1C1917]">Responsável encontrado</h3>
            <div className="mb-5 rounded-xl bg-[#F5F3F0] px-4 py-3">
              <p className="font-semibold text-[#1C1917]">{encontrado.nome}</p>
              <p className="text-sm text-[#78716C]">{encontrado.email}</p>
            </div>

            <Label className="text-sm font-semibold text-[#1C1917]">
              Digite o e-mail novamente para confirmar
            </Label>
            <Input
              className={`mt-1.5 ${adminInputClass}`}
              placeholder={encontrado.email}
              value={confirmacao}
              onChange={e => setConfirmacao(e.target.value)}
            />

            <div className="mt-5 flex gap-3">
              <Button variant="outline" className={`flex-1 ${adminBtnOutline}`}
                onClick={() => { setEncontrado(null); setConfirmacao(''); setErro(''); }}
                disabled={carregando}>
                Cancelar
              </Button>
              <Button className="flex-1 bg-[#C8102E] hover:bg-[#A50D26]"
                onClick={anonimizar} disabled={carregando}>
                {carregando ? 'Processando...' : 'Anonimizar dados'}
              </Button>
            </div>
          </AdminPanel>
        )}
      </div>
    </AdminLayout>
  );
}