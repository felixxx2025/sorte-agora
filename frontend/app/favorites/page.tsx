'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { GameTile } from '@/components/casino/GameTile';
import Loading from '@/components/ui/loading';
import { useCasinoGames, useFavorites, useToggleFavorite } from '@/lib/hooks';

function FavoritesContent() {
  const { data: favorites, isLoading: favLoading } = useFavorites();
  const { data: allGames, isLoading: gamesLoading } = useCasinoGames();
  const toggleFavorite = useToggleFavorite();

  const isLoading = favLoading || gamesLoading;

  const favoriteGames =
    (favorites ?? [])
      .map((f) => f.game)
      .filter(Boolean) as Array<{
      id: string;
      name: string;
      category?: string;
      thumbnail?: string;
    }>;

  // fallback: resolve via all games if include missing
  const favoriteIds = new Set((favorites ?? []).map((f) => f.gameId));
  const resolved =
    favoriteGames.length > 0
      ? favoriteGames
      : (allGames ?? []).filter((g) => favoriteIds.has(g.id));

  return (
    <div className="sa-page min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <h1 className="font-display text-2xl font-extrabold text-sa-gold">Favoritos</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loading size="lg" />
          </div>
        ) : resolved.length === 0 ? (
          <div className="sa-panel flex flex-col items-center justify-center py-16 gap-4">
            <span className="text-5xl">⭐</span>
            <p className="font-display text-lg font-bold text-sa-gold">Nenhum favorito ainda</p>
            <p className="text-sa-muted text-sm text-center max-w-xs">
              Acesse um jogo e clique em favoritar para vê-lo aqui.
            </p>
            <a
              href="/casino"
              className="rounded-lg bg-sa-red px-5 py-2.5 text-sm font-bold text-sa-gold border border-sa-gold/30 hover:bg-sa-red/80 transition"
            >
              Explorar Jogos
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
            {resolved.map((game) => (
              <div key={game.id} className="relative group">
                <GameTile
                  name={game.name}
                  category={game.category}
                  thumbnail={(game as any).thumbnailUrl ?? game.thumbnail}
                  href={`/casino/${game.id}`}
                />
                <button
                  type="button"
                  aria-label={`Remover ${game.name} dos favoritos`}
                  onClick={() => toggleFavorite.mutate(game.id)}
                  className="absolute top-2 right-2 z-10 rounded-full bg-black/60 p-1 text-sa-gold opacity-0 group-hover:opacity-100 transition hover:text-red-400"
                >
                  ★
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <AuthGuard>
      <FavoritesContent />
    </AuthGuard>
  );
}
