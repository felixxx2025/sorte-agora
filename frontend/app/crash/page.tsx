'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { useCrashCashout, useCrashState, usePlaceCrashBet } from '@/lib/hooks/useCrash';
import { useState } from 'react';

const ENABLE_CRASH =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ENABLE_CRASH !== 'false';

function CrashContent() {
  const [betAmount, setBetAmount] = useState('10');
  const [autoCashout, setAutoCashout] = useState('');
  const [hasBet, setHasBet] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const { data: state, isLoading } = useCrashState(ENABLE_CRASH);
  const placeBet = usePlaceCrashBet();
  const cashout = useCrashCashout();

  if (!ENABLE_CRASH) {
    return (
      <div className="sa-page min-h-screen flex items-center justify-center">
        <div className="sa-panel p-10 text-center max-w-md">
          <p className="text-4xl mb-4">🚀</p>
          <h1 className="font-display text-2xl font-extrabold text-sa-gold mb-2">Crash</h1>
          <p className="text-sa-muted">Este módulo está temporariamente desativado.</p>
        </div>
      </div>
    );
  }

  const statusColor =
    state?.status === 'running'
      ? 'text-sa-gold'
      : state?.status === 'crashed'
        ? 'text-red-500'
        : 'text-sa-muted';

  const statusLabel =
    state?.status === 'running'
      ? 'Em andamento'
      : state?.status === 'crashed'
        ? 'Crashou!'
        : 'Aguardando...';

  const handleBet = async () => {
    setErr('');
    setMsg('');
    try {
      await placeBet.mutateAsync({
        amount: parseFloat(betAmount),
        autoCashout: autoCashout ? parseFloat(autoCashout) : null,
      });
      setHasBet(true);
      setMsg('Aposta registrada!');
    } catch (e: any) {
      setErr(e?.message || 'Erro ao apostar');
    }
  };

  const handleCashout = async () => {
    setErr('');
    try {
      const result = await cashout.mutateAsync();
      setHasBet(false);
      setMsg(`Cashout em ${result.cashoutMultiplier?.toFixed(2)}x! Lucro: R$ ${result.profit?.toFixed(2) ?? '?'}`);
    } catch (e: any) {
      setErr(e?.message || 'Erro no cashout');
    }
  };

  return (
    <div className="sa-page min-h-screen">
      <div className="max-w-screen-md mx-auto px-4 py-6 space-y-6">
        <h1 className="font-display text-2xl font-extrabold text-sa-gold">🚀 Crash</h1>

        {/* Game display */}
        <div
          className="sa-panel overflow-hidden"
          style={{ background: 'linear-gradient(145deg,#0a0a0a 0%,#1a0808 100%)' }}
        >
          <div className="h-52 flex flex-col items-center justify-center gap-2">
            {isLoading ? (
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sa-gold" />
            ) : (
              <>
                <p className={`font-display text-7xl font-extrabold tracking-tight ${statusColor}`}>
                  {state?.status === 'running' || state?.status === 'crashed'
                    ? `${Number(state.multiplier).toFixed(2)}x`
                    : '—'}
                </p>
                <p className={`text-sm font-semibold uppercase tracking-widest ${statusColor}`}>
                  {statusLabel}
                </p>
                {state?.roundId && (
                  <p className="text-[10px] text-sa-muted font-mono mt-1">Round #{state.roundId}</p>
                )}
              </>
            )}
          </div>
        </div>

        {(msg || err) && (
          <p className={`text-sm ${err ? 'text-red-400' : 'text-green-400'}`} role={err ? 'alert' : 'status'}>
            {err || msg}
          </p>
        )}

        {/* Bet controls */}
        <div className="sa-panel p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-sa-muted mb-1.5">Valor da aposta (R$)</label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min="1"
                step="0.5"
                className="w-full rounded-lg border border-sa-red/40 bg-black/60 px-4 py-3 text-white focus:outline-none focus:border-sa-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-sa-muted mb-1.5">Auto cashout (opcional)</label>
              <input
                type="number"
                value={autoCashout}
                onChange={(e) => setAutoCashout(e.target.value)}
                min="1.01"
                step="0.01"
                placeholder="ex: 2.00"
                className="w-full rounded-lg border border-sa-red/40 bg-black/60 px-4 py-3 text-white placeholder-sa-muted focus:outline-none focus:border-sa-gold transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3">
            {!hasBet ? (
              <button
                type="button"
                onClick={handleBet}
                disabled={placeBet.isPending || state?.status === 'running'}
                className="flex-1 rounded-lg bg-sa-gold text-black font-display font-extrabold py-3 hover:bg-sa-gold-dim transition disabled:opacity-50"
              >
                {placeBet.isPending ? 'Apostando...' : 'Apostar'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCashout}
                disabled={cashout.isPending || state?.status !== 'running'}
                className="flex-1 rounded-lg bg-sa-red text-sa-gold font-display font-extrabold py-3 hover:bg-sa-red/80 transition disabled:opacity-50 border border-sa-gold/30"
              >
                {cashout.isPending
                  ? 'Sacando...'
                  : `Cashout ${state?.multiplier ? Number(state.multiplier).toFixed(2) + 'x' : ''}`}
              </button>
            )}
          </div>

          <p className="text-[11px] text-sa-muted text-center">
            Aposte durante a fase de espera. Faça cashout antes do crash para garantir seu lucro.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CrashPage() {
  return (
    <AuthGuard>
      <CrashContent />
    </AuthGuard>
  );
}
