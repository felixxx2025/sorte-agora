'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { GameTile } from '@/components/casino/GameTile';
import Loading from '@/components/ui/loading';
import { useCasinoGames, useLaunchGame } from '@/lib/hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const CATEGORIES = [
  { key: 'all', label: 'Todos' },
  { key: 'live', label: '📺 Ao Vivo' },
  { key: 'slots', label: '🎰 Slots' },
  { key: 'crash', label: '🚀 Crash' },
  { key: 'table', label: '🃏 Mesa' },
  { key: 'jackpot', label: '💎 Jackpot' },
];

function CasinoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCat = searchParams.get('category') ?? 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [error, setError] = useState('');

  useEffect(() => {
    const cat = searchParams.get('category') ?? 'all';
    setSelectedCategory(cat);
  }, [searchParams]);

  const { data: games, isLoading } = useCasinoGames(
    selectedCategory === 'all' ? undefined : selectedCategory,
  );
  const launchGame = useLaunchGame();

  const selectCategory = (cat: string) => {
    setSelectedCategory(cat);
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'all') params.delete('category');
    else params.set('category', cat);
    router.replace(`/casino?${params.toString()}`);
  };

  const handleLaunchGame = async (gameId: string) => {
    setError('');
    try {
      const result = await launchGame.mutateAsync({ id: gameId, data: { betAmount: 10 } });
      if (result.gameUrl) window.open(result.gameUrl, '_blank');
    } catch {
      setError('Erro ao iniciar jogo');
    }
  };

  return (
    <div className="sa-page min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-extrabold text-sa-gold">Cassino</h1>
        </div>

        {error && (
          <p className="text-red-400 text-sm" role="alert">
            {error}
          </p>
        )}

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => selectCategory(c.key)}
              className={
                selectedCategory === c.key
                  ? 'sa-chip bg-sa-red/60 text-sa-gold border-sa-gold/50'
                  : 'sa-chip opacity-60 hover:opacity-100 transition'
              }
            >
              {c.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : !games || games.length === 0 ? (
          <p className="text-sa-muted py-12 text-center">Nenhum jogo nesta categoria.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
            {games.map((game: any) => (
              <button
                key={game.id}
                type="button"
                onClick={() => handleLaunchGame(game.id)}
                disabled={launchGame.isPending}
                className="block text-left"
                aria-label={`Jogar ${game.name}`}
              >
                <GameTile
                  name={game.name}
                  category={game.category}
                  thumbnail={game.thumbnailUrl}
                  href="#"
                  badge={game.isNew ? 'NOVO' : game.isHot ? 'HOT' : undefined}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CasinoPage() {
  return (
    <AuthGuard>
      <Suspense>
        <CasinoContent />
      </Suspense>
    </AuthGuard>
  );
}
