'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { GameTile } from '@/components/casino/GameTile';
import Loading from '@/components/ui/loading';
import { useCasinoGames } from '@/lib/hooks';

function LiveCasinoContent() {
  const { data: games, isLoading } = useCasinoGames('live');

  return (
    <div className="sa-page min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="inline-block h-3 w-3 rounded-full bg-sa-red animate-pulse" />
          <h1 className="font-display text-2xl font-extrabold text-sa-gold">Cassino Ao Vivo</h1>
        </div>

        <div
          className="sa-panel p-4 flex items-center gap-4"
          style={{ background: 'linear-gradient(120deg,#8b0000,#1a0a0a 55%)' }}
        >
          <span className="text-3xl">🎙️</span>
          <div>
            <p className="font-display font-bold text-white">Dealers em tempo real</p>
            <p className="text-sm text-sa-muted">Jogue com crupiês ao vivo 24h por dia.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loading size="lg" />
          </div>
        ) : !games || games.length === 0 ? (
          <div className="sa-panel py-16 text-center">
            <p className="text-sa-muted">Nenhum jogo ao vivo disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
            {games.map((game: any) => (
              <GameTile
                key={game.id}
                name={game.name}
                category={game.category}
                thumbnail={game.thumbnailUrl ?? game.thumbnail}
                href={`/casino/${game.id}`}
                badge="AO VIVO"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LiveCasinoPage() {
  return (
    <AuthGuard>
      <LiveCasinoContent />
    </AuthGuard>
  );
}
