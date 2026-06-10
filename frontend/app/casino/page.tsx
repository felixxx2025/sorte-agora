'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '@/components/ui/loading';
import { useCasinoGames, useLaunchGame } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CasinoPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const categories = ['all', 'slots', 'live', 'table', 'jackpot'];

  const { data: games, isLoading } = useCasinoGames(selectedCategory === 'all' ? undefined : selectedCategory);
  const launchGame = useLaunchGame();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLaunchGame = async (gameId: string) => {
    try {
      const result = await launchGame.mutateAsync({
        id: gameId,
        data: { betAmount: 10 }
      });
      if (result.gameUrl) {
        window.open(result.gameUrl, '_blank');
      }
    } catch (error) {
      console.error('Launch game error:', error);
      alert('Erro ao iniciar jogo');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Cassino</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-6 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'bg-purple-600' : 'bg-gray-700'}
                >
                  {category === 'all' ? 'Todos' : category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {games?.map((game) => (
                <Card key={game.id} className="bg-gray-800 border-gray-700 overflow-hidden">
                  <div className="h-40 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <span className="text-4xl">🎰</span>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-gray-300 text-lg">{game.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-2">{game.provider}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs bg-purple-600 px-2 py-1 rounded">{game.category}</span>
                      <span className="text-xs text-green-400">RTP: {game.rtp}%</span>
                    </div>
                    <Button
                      onClick={() => handleLaunchGame(game.id)}
                      disabled={launchGame.isPending}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      {launchGame.isPending ? 'Carregando...' : 'Jogar'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!games || games.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-xl">Nenhum jogo encontrado nesta categoria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
