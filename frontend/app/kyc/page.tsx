'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { Input } from '@/components/ui/input';
import Loading from '@/components/ui/loading';
import { usersApi } from '@/lib/api/users';
import { useUserProfile } from '@/lib/hooks';
import { useEffect, useState } from 'react';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  APPROVED: { label: 'Aprovado ✓', color: 'text-green-400' },
  PENDING: { label: 'Em análise…', color: 'text-yellow-400' },
  REJECTED: { label: 'Rejeitado', color: 'text-red-400' },
};

function KycContent() {
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [kycLoading, setKycLoading] = useState(true);
  const [form, setForm] = useState({
    documentType: 'CPF',
    documentNumber: '',
    documentFront: '',
    selfie: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const readFile = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
      reader.readAsDataURL(file);
    });

  useEffect(() => {
    usersApi
      .getKycStatus()
      .then(setKycStatus)
      .catch(() => setKycStatus(null))
      .finally(() => setKycLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!form.documentFront || !form.selfie) {
      setError('Envie a foto do documento e a selfie.');
      return;
    }
    setSubmitting(true);
    try {
      await usersApi.submitKyc(form as any);
      setMessage('KYC enviado com sucesso! Aguarde a análise.');
      const status = await usersApi.getKycStatus();
      setKycStatus(status);
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao enviar KYC.');
    } finally {
      setSubmitting(false);
    }
  };

  const isVerified = profile?.isKycVerified || kycStatus?.isKycVerified;
  const latestStatus = kycStatus?.latest?.status as string | undefined;
  const statusInfo = latestStatus ? STATUS_LABEL[latestStatus] : null;

  if (profileLoading || kycLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="sa-page min-h-screen">
      <div className="max-w-screen-sm mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🪪</span>
          <h1 className="font-display text-2xl font-extrabold text-sa-gold">Verificação KYC</h1>
        </div>

        {/* Status panel */}
        <div className="sa-panel p-5 space-y-2">
          <p className="text-xs text-sa-muted uppercase tracking-widest">Status atual</p>
          {isVerified ? (
            <p className="font-display text-lg font-bold text-green-400">✓ Conta Verificada</p>
          ) : statusInfo ? (
            <p className={`font-display text-lg font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
          ) : (
            <p className="font-display text-lg font-bold text-yellow-400">Não verificado</p>
          )}
          <p className="text-sm text-sa-muted">
            A verificação KYC permite saques e aumenta seus limites.
          </p>
        </div>

        {(message || error) && (
          <p className={`text-sm ${error ? 'text-red-400' : 'text-green-400'}`} role={error ? 'alert' : 'status'}>
            {error || message}
          </p>
        )}

        {!isVerified && latestStatus !== 'PENDING' && latestStatus !== 'APPROVED' && (
          <form onSubmit={handleSubmit} className="sa-panel p-5 space-y-4">
            <h2 className="font-display font-bold text-sa-gold">Enviar documentos</h2>

            <div>
              <label className="block text-xs text-sa-muted mb-1.5">Tipo de documento</label>
              <select
                value={form.documentType}
                onChange={(e) => setForm({ ...form, documentType: e.target.value })}
                className="w-full rounded-md bg-black/50 border border-sa-red/40 text-white px-3 py-2 text-sm focus:outline-none focus:border-sa-gold/50"
              >
                <option value="CPF">CPF</option>
                <option value="RG">RG</option>
                <option value="CNH">CNH</option>
                <option value="PASSPORT">Passaporte</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-sa-muted mb-1.5">Número do documento</label>
              <Input
                value={form.documentNumber}
                onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
                placeholder="000.000.000-00"
                required
                className="bg-black/50 border-sa-red/40 text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-sa-muted mb-1.5">Foto do documento (frente)</label>
              <Input
                type="file"
                accept="image/*"
                required
                className="bg-black/50 border-sa-red/40 text-white"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await readFile(file);
                  setForm((prev) => ({ ...prev, documentFront: url }));
                }}
              />
              {form.documentFront && (
                <span className="text-xs text-green-400 mt-1 block">✓ Documento carregado</span>
              )}
            </div>

            <div>
              <label className="block text-xs text-sa-muted mb-1.5">Selfie segurando o documento</label>
              <Input
                type="file"
                accept="image/*"
                required
                className="bg-black/50 border-sa-red/40 text-white"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await readFile(file);
                  setForm((prev) => ({ ...prev, selfie: url }));
                }}
              />
              {form.selfie && (
                <span className="text-xs text-green-400 mt-1 block">✓ Selfie carregada</span>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-sa-gold text-black font-display font-extrabold py-3 hover:bg-sa-gold-dim transition disabled:opacity-50"
            >
              {submitting ? 'Enviando...' : 'Enviar para Análise'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function KycPage() {
  return (
    <AuthGuard>
      <KycContent />
    </AuthGuard>
  );
}
