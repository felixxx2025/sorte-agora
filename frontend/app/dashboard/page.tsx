'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '@/components/ui/loading';
import { useBalance, useVipStatus } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { data: balance, isLoading: balanceLoading } = useBalance();
  const { data: vipStatus, isLoading: vipLoading } = useVipStatus();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const isLoading = balanceLoading || vipLoading;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-300">Saldo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-400">
                    R$ {balance?.balance ? Number(balance.balance).toFixed(2) : '0.00'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-300">Bônus</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-400">
                    R$ {balance?.bonusBalance ? Number(balance.bonusBalance).toFixed(2) : '0.00'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-300">Nível VIP</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-400">
                    {vipStatus?.level?.name || 'Bronze'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-300">Pontos VIP</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-400">{vipStatus?.points || 0}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-300">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <a
                    href="/wallet"
                    className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded text-center transition"
                  >
                    Depositar
                  </a>
                  <a
                    href="/wallet"
                    className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded text-center transition"
                  >
                    Sacar
                  </a>
                  <a
                    href="/casino"
                    className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded text-center transition"
                  >
                    Cassino
                  </a>
                  <a
                    href="/sports"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded text-center transition"
                  >
                    Esportes
                  </a>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-300">Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Nenhuma atividade recente.</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
