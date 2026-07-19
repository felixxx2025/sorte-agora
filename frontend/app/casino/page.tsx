'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '@/components/ui/loading';
import { useCasinoGames, useLaunchGame } from '@/lib/hooks';
import { useState } from 'react';

function CasinoContent() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [error, setError] = useState('');
  const categories = ['all', 'slots', 'live', 'table', 'jackpot', 'crash'];

  const { data: games, isLoading } = useCasinoGames(
    selectedCategory === 'all' ? undefined : selectedCategory,
  );
  const launchGame = useLaunchGame();

  const handleLaunchGame = async (gameId: string) => {
    setError('');
    try {
      const result = await launchGame.mutateAsync({
        id: gameId,
        data: { betAmount: 10 },
      });
      if (result.gameUrl) {
        window.open(result.gameUrl, '_blank');
      }
    } catch {
      setError('Erro ao iniciar jogo');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Cassino</h1>

      {error && (
        <p className="text-red-400 mb-4" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={
              selectedCategory === category
                ? 'bg-[#FFD700] text-[#1A1A2E]'
                : 'bg-[#16213E] text-white'
            }
          >
            {category === 'all' ? 'Todos' : category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : !games || games.length === 0 ? (
        <p className="text-gray-400">Nenhum jogo encontrado nesta categoria.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {games.map((game: any) => (
            <Card key={game.id} className="bg-[#16213E] border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-base">{game.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-3">{game.category}</p>
                <Button
                  onClick={() => handleLaunchGame(game.id)}
                  disabled={launchGame.isPending}
                  className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#1A1A2E]"
                >
                  Jogar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CasinoPage() {
  return (
    <AuthGuard>
      <CasinoContent />
    </AuthGuard>
  );
}
