'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '@/components/ui/loading';
import { useBalance, useVipStatus } from '@/lib/hooks';
import Link from 'next/link';

function DashboardContent() {
  const { data: balance, isLoading: balanceLoading, isError: balanceError } = useBalance();
  const { data: vipStatus, isLoading: vipLoading } = useVipStatus();

  const isLoading = balanceLoading || vipLoading;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : (
        <>
          {balanceError && (
            <p className="text-red-400 mb-4" role="alert">
              Não foi possível carregar o saldo.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-[#16213E] border-white/10">
              <CardHeader>
                <CardTitle className="text-gray-300">Saldo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[#FFD700]">
                  R$ {balance?.balance != null ? Number(balance.balance).toFixed(2) : '0.00'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#16213E] border-white/10">
              <CardHeader>
                <CardTitle className="text-gray-300">Bônus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-400">
                  R$ {balance?.bonusBalance != null ? Number(balance.bonusBalance).toFixed(2) : '0.00'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#16213E] border-white/10">
              <CardHeader>
                <CardTitle className="text-gray-300">Nível VIP</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-purple-300">
                  {vipStatus?.level?.name || 'Bronze'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#16213E] border-white/10">
              <CardHeader>
                <CardTitle className="text-gray-300">Pontos VIP</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-purple-300">{vipStatus?.points || 0}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#16213E] border-white/10">
              <CardHeader>
                <CardTitle className="text-gray-300">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href="/wallet"
                  className="block w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#1A1A2E] font-bold py-3 px-4 rounded text-center"
                >
                  Carteira
                </Link>
                <Link
                  href="/casino"
                  className="block w-full bg-[#0F0F1A] border border-white/10 hover:border-[#FFD700]/40 text-white font-bold py-3 px-4 rounded text-center transition"
                >
                  Cassino
                </Link>
                <Link
                  href="/sports"
                  className="block w-full bg-[#0F0F1A] border border-white/10 hover:border-[#FFD700]/40 text-white font-bold py-3 px-4 rounded text-center transition"
                >
                  Esportes
                </Link>
                <Link
                  href="/vip"
                  className="block w-full bg-[#0F0F1A] border border-white/10 hover:border-[#FFD700]/40 text-white font-bold py-3 px-4 rounded text-center transition"
                >
                  VIP
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-[#16213E] border-white/10">
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
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
