'use client';

import { AuthGuard } from '@/components/AuthGuard';
import Loading from '@/components/ui/loading';
import { useCasinoGame, useLaunchDemo, useLaunchGame, useToggleFavorite, useFavorites } from '@/lib/hooks';
import Link from 'next/link';
import { use, useState } from 'react';

function GameDetailContent({ id }: { id: string }) {
  const { data: game, isLoading, error } = useCasinoGame(id);
  const { data: favorites } = useFavorites();
  const launchGame = useLaunchGame();
  const launchDemo = useLaunchDemo();
  const toggleFavorite = useToggleFavorite();
  const [betAmount, setBetAmount] = useState('10');
  const [actionError, setActionError] = useState('');

  const isFavorited = (favorites ?? []).some((f) => f.gameId === id);

  const handlePlay = async () => {
    setActionError('');
    try {
      const result = await launchGame.mutateAsync({ id, data: { betAmount: parseFloat(betAmount) } });
      if (result.gameUrl) window.open(result.gameUrl, '_blank');
    } catch (err: any) {
      setActionError(err?.message ?? 'Erro ao iniciar jogo');
    }
  };

  const handleDemo = async () => {
    setActionError('');
    try {
      const result = await launchDemo.mutateAsync(id);
      if (result.gameUrl) window.open(result.gameUrl, '_blank');
    } catch {
      setActionError('Demo não disponível para este jogo');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="sa-page min-h-screen">
        <div className="max-w-screen-md mx-auto px-4 py-12 text-center space-y-4">
          <p className="text-sa-muted">Jogo não encontrado.</p>
          <Link href="/casino" className="text-sa-gold hover:underline text-sm">
            ← Voltar ao cassino
          </Link>
        </div>
      </div>
    );
  }

  const thumbnail = game.thumbnailUrl ?? game.thumbnail;
  const volatilityLabel: Record<string, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    'very-high': 'Muito Alta',
  };

  return (
    <div className="sa-page min-h-screen">
      <div className="max-w-screen-lg mx-auto px-4 py-6 space-y-5">
        <Link href="/casino" className="text-sa-muted hover:text-sa-gold text-sm transition">
          ← Cassino
        </Link>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Cover */}
          <div className="sa-panel overflow-hidden aspect-[4/3] relative">
            {thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbnail} alt={game.name} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: 'linear-gradient(145deg,#8b0000,#1a0a0a 60%,#ffd70033)' }}
              >
                <span className="text-6xl">🎰</span>
              </div>
            )}
            <button
              type="button"
              aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              onClick={() => toggleFavorite.mutate(id)}
              className={`absolute top-3 right-3 rounded-full p-2 text-xl transition ${
                isFavorited
                  ? 'bg-sa-gold/20 text-sa-gold border border-sa-gold/40'
                  : 'bg-black/60 text-gray-400 hover:text-sa-gold border border-white/10'
              }`}
            >
              {isFavorited ? '★' : '☆'}
            </button>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div>
              <span className="sa-chip mb-2 inline-block">{game.category}</span>
              <h1 className="font-display text-2xl font-extrabold text-sa-gold">{game.name}</h1>
              <p className="text-sm text-sa-muted mt-1">{game.provider}</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2">
              {game.rtp != null && (
                <div className="sa-panel p-3">
                  <p className="text-xs text-sa-muted uppercase tracking-wide">RTP</p>
                  <p className="font-display text-lg font-bold text-sa-gold">{game.rtp}%</p>
                </div>
              )}
              {game.volatility && (
                <div className="sa-panel p-3">
                  <p className="text-xs text-sa-muted uppercase tracking-wide">Volatilidade</p>
                  <p className="font-display text-lg font-bold text-white">
                    {volatilityLabel[game.volatility] ?? game.volatility}
                  </p>
                </div>
              )}
              <div className="sa-panel p-3">
                <p className="text-xs text-sa-muted uppercase tracking-wide">Aposta mín.</p>
                <p className="font-display text-lg font-bold text-white">R$ {Number(game.minBet).toFixed(2)}</p>
              </div>
              <div className="sa-panel p-3">
                <p className="text-xs text-sa-muted uppercase tracking-wide">Aposta máx.</p>
                <p className="font-display text-lg font-bold text-white">R$ {Number(game.maxBet).toFixed(2)}</p>
              </div>
            </div>

            {actionError && (
              <p className="text-red-400 text-sm" role="alert">{actionError}</p>
            )}

            {/* Bet amount */}
            <div>
              <label className="block text-xs text-sa-muted mb-1.5">Valor da aposta (R$)</label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min={game.minBet}
                max={game.maxBet}
                step="0.5"
                className="w-full rounded-md bg-black/50 border border-sa-red/40 text-white px-3 py-2 text-sm focus:outline-none focus:border-sa-gold/50"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePlay}
                disabled={launchGame.isPending}
                className="flex-1 rounded-lg bg-sa-gold text-black font-display font-extrabold py-3 hover:bg-sa-gold-dim transition disabled:opacity-50"
              >
                {launchGame.isPending ? 'Abrindo...' : '▶ Jogar'}
              </button>
              <button
                type="button"
                onClick={handleDemo}
                disabled={launchDemo.isPending}
                className="flex-1 rounded-lg bg-sa-surface border border-sa-red/40 text-sa-gold font-display font-bold py-3 hover:bg-white/5 transition disabled:opacity-50"
              >
                {launchDemo.isPending ? 'Abrindo...' : 'Demo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <GameDetailContent id={id} />
    </AuthGuard>
  );
}
