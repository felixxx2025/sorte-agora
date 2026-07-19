'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { Input } from '@/components/ui/input';
import Loading from '@/components/ui/loading';
import { useResponsibleGaming, useUpdateResponsibleGaming } from '@/lib/hooks';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function LimitField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-sa-muted mb-1">{label}</label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min="0"
        step="10"
        placeholder="Sem limite"
        className="bg-black/50 border-sa-red/40 text-white"
      />
    </div>
  );
}

function SettingsContent() {
  const { data: limits, isLoading } = useResponsibleGaming();
  const updateLimits = useUpdateResponsibleGaming();

  const [form, setForm] = useState({
    depositLimitDaily: '',
    depositLimitWeekly: '',
    depositLimitMonthly: '',
    lossLimitDaily: '',
    lossLimitWeekly: '',
    lossLimitMonthly: '',
    sessionTimeLimitMinutes: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!limits) return;
    setForm({
      depositLimitDaily: limits.depositLimitDaily != null ? String(limits.depositLimitDaily) : '',
      depositLimitWeekly: limits.depositLimitWeekly != null ? String(limits.depositLimitWeekly) : '',
      depositLimitMonthly: limits.depositLimitMonthly != null ? String(limits.depositLimitMonthly) : '',
      lossLimitDaily: limits.lossLimitDaily != null ? String(limits.lossLimitDaily) : '',
      lossLimitWeekly: limits.lossLimitWeekly != null ? String(limits.lossLimitWeekly) : '',
      lossLimitMonthly: limits.lossLimitMonthly != null ? String(limits.lossLimitMonthly) : '',
      sessionTimeLimitMinutes:
        limits.sessionTimeLimitMinutes != null ? String(limits.sessionTimeLimitMinutes) : '',
    });
  }, [limits]);

  const parseOptional = (v: string) => (v === '' ? null : parseFloat(v));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await updateLimits.mutateAsync({
        depositLimitDaily: parseOptional(form.depositLimitDaily),
        depositLimitWeekly: parseOptional(form.depositLimitWeekly),
        depositLimitMonthly: parseOptional(form.depositLimitMonthly),
        lossLimitDaily: parseOptional(form.lossLimitDaily),
        lossLimitWeekly: parseOptional(form.lossLimitWeekly),
        lossLimitMonthly: parseOptional(form.lossLimitMonthly),
        sessionTimeLimitMinutes: parseOptional(form.sessionTimeLimitMinutes),
      });
      setMessage('Limites atualizados com sucesso!');
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao salvar limites.');
    }
  };

  const LINKS = [
    { href: '/kyc', label: '🪪 Verificação KYC', desc: 'Verifique sua identidade' },
    { href: '/wallet', label: '💰 Carteira', desc: 'Depósitos e saques' },
    { href: '/vip', label: '👑 Programa VIP', desc: 'Benefícios exclusivos' },
    { href: '/profile', label: '👤 Perfil e MFA', desc: 'Dados pessoais e segurança' },
    { href: '/responsible', label: '🛡️ Jogo Responsável', desc: 'Autoexclusão e LGPD' },
  ];

  return (
    <div className="sa-page min-h-screen">
      <div className="max-w-screen-md mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚙️</span>
          <h1 className="font-display text-2xl font-extrabold text-sa-gold">Configurações</h1>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="sa-panel flex items-center gap-3 px-4 py-3 hover:border-sa-gold/50 transition"
            >
              <span className="text-lg">{l.label.split(' ')[0]}</span>
              <div>
                <p className="text-sm font-medium text-white">{l.label.split(' ').slice(1).join(' ')}</p>
                <p className="text-xs text-sa-muted">{l.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Responsible gaming form */}
        <div className="sa-panel p-5 space-y-5">
          <div>
            <h2 className="font-display font-bold text-sa-gold">Limites de Jogo Responsável</h2>
            <p className="text-xs text-sa-muted mt-1">Deixe em branco para sem limite. Valores em R$.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loading size="sm" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-sa-muted uppercase tracking-widest mb-3">Limites de Depósito</p>
                <div className="grid grid-cols-3 gap-3">
                  <LimitField
                    label="Diário"
                    value={form.depositLimitDaily}
                    onChange={(v) => setForm({ ...form, depositLimitDaily: v })}
                  />
                  <LimitField
                    label="Semanal"
                    value={form.depositLimitWeekly}
                    onChange={(v) => setForm({ ...form, depositLimitWeekly: v })}
                  />
                  <LimitField
                    label="Mensal"
                    value={form.depositLimitMonthly}
                    onChange={(v) => setForm({ ...form, depositLimitMonthly: v })}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-sa-muted uppercase tracking-widest mb-3">Limites de Perda</p>
                <div className="grid grid-cols-3 gap-3">
                  <LimitField
                    label="Diário"
                    value={form.lossLimitDaily}
                    onChange={(v) => setForm({ ...form, lossLimitDaily: v })}
                  />
                  <LimitField
                    label="Semanal"
                    value={form.lossLimitWeekly}
                    onChange={(v) => setForm({ ...form, lossLimitWeekly: v })}
                  />
                  <LimitField
                    label="Mensal"
                    value={form.lossLimitMonthly}
                    onChange={(v) => setForm({ ...form, lossLimitMonthly: v })}
                  />
                </div>
              </div>

              <div className="max-w-xs">
                <p className="text-xs font-semibold text-sa-muted uppercase tracking-widest mb-3">Sessão</p>
                <LimitField
                  label="Duração máxima (minutos)"
                  value={form.sessionTimeLimitMinutes}
                  onChange={(v) => setForm({ ...form, sessionTimeLimitMinutes: v })}
                />
              </div>

              {(message || error) && (
                <p className={`text-sm ${error ? 'text-red-400' : 'text-green-400'}`} role={error ? 'alert' : 'status'}>
                  {error || message}
                </p>
              )}

              <button
                type="submit"
                disabled={updateLimits.isPending}
                className="w-full rounded-lg bg-sa-gold text-black font-display font-extrabold py-3 hover:bg-sa-gold-dim transition disabled:opacity-50"
              >
                {updateLimits.isPending ? 'Salvando...' : 'Salvar Limites'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}
