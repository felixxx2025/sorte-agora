'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { GameTile } from '@/components/casino/GameTile';
import Loading from '@/components/ui/loading';
import { useCasinoGames } from '@/lib/hooks';
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

const PROVIDERS = [
  { key: 'all', label: 'Todos provedores' },
  { key: 'PGSOFT', label: 'PG Soft' },
  { key: 'DEMO', label: 'Demo' },
];

function CasinoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCat = searchParams.get('category') ?? 'all';
  const initialProvider = searchParams.get('provider') ?? 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedProvider, setSelectedProvider] = useState(initialProvider);

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') ?? 'all');
    setSelectedProvider(searchParams.get('provider') ?? 'all');
  }, [searchParams]);

  const { data: games, isLoading } = useCasinoGames(
    selectedCategory === 'all' ? undefined : selectedCategory,
    selectedProvider === 'all' ? undefined : selectedProvider,
  );

  const pushFilters = (cat: string, provider: string) => {
    const params = new URLSearchParams();
    if (cat !== 'all') params.set('category', cat);
    if (provider !== 'all') params.set('provider', provider);
    const qs = params.toString();
    router.replace(qs ? `/casino?${qs}` : '/casino');
  };

  const selectCategory = (cat: string) => {
    setSelectedCategory(cat);
    pushFilters(cat, selectedProvider);
  };

  const selectProvider = (provider: string) => {
    setSelectedProvider(provider);
    pushFilters(selectedCategory, provider);
  };

  return (
    <div className="sa-page min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-extrabold text-sa-gold">Cassino</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => selectProvider(p.key)}
              className={
                selectedProvider === p.key
                  ? 'sa-chip bg-sa-gold/20 text-sa-gold border-sa-gold/50'
                  : 'sa-chip opacity-60 hover:opacity-100 transition'
              }
            >
              {p.label}
            </button>
          ))}
        </div>

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
              <GameTile
                key={game.id}
                name={game.name}
                category={
                  game.provider === 'PGSOFT'
                    ? `PG Soft · ${game.category}`
                    : game.category
                }
                thumbnail={game.thumbnailUrl ?? game.thumbnail}
                href={`/casino/${game.id}`}
                badge={
                  game.provider === 'PGSOFT'
                    ? 'PG'
                    : game.isNew
                      ? 'NOVO'
                      : game.isHot
                        ? 'HOT'
                        : undefined
                }
              />
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
