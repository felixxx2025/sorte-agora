'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '@/components/ui/loading';
import {
  useAdminDashboard,
  useAdminReports,
  useAdminUsers,
  useApproveWithdrawal,
  useBanUser,
  usePendingWithdrawals,
  useRejectWithdrawal,
  useUnbanUser,
} from '@/lib/hooks';
import { useEffect, useState } from 'react';

function AdminContent() {
  const [tab, setTab] = useState<'overview' | 'users' | 'withdrawals' | 'kyc' | 'reports'>('overview');
  const [message, setMessage] = useState('');

  const { data: dashboard, isLoading: dashLoading } = useAdminDashboard();
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const { data: withdrawals } = usePendingWithdrawals();
  const { data: reports } = useAdminReports();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const approve = useApproveWithdrawal();
  const reject = useRejectWithdrawal();

  const [kycList, setKycList] = useState<any[]>([]);
  const loadKyc = async () => {
    try {
      const { default: apiClient } = await import('@/lib/api/client');
      const response = await apiClient.get('/admin/kyc');
      setKycList(response.data || []);
    } catch {
      setKycList([]);
    }
  };

  useEffect(() => {
    if (tab === 'kyc') loadKyc();
  }, [tab]);

  const reviewKyc = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    const { default: apiClient } = await import('@/lib/api/client');
    await apiClient.put(`/admin/kyc/${id}/review`, { decision });
    setMessage(`KYC ${decision}`);
    loadKyc();
  };

  if (dashLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Painel Admin</h1>
      <p className="text-gray-400 mb-6">Operação financeira, usuários e KYC</p>

      {message && <p className="text-green-400 text-sm mb-4">{message}</p>}

      <div className="flex flex-wrap gap-2 mb-6">
        {(['overview', 'users', 'withdrawals', 'kyc', 'reports'] as const).map((t) => (
          <Button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t ? 'bg-[#FFD700] text-[#1A1A2E]' : 'bg-[#16213E]'}
          >
            {t === 'overview'
              ? 'Visão geral'
              : t === 'users'
                ? 'Usuários'
                : t === 'withdrawals'
                  ? 'Saques'
                  : t === 'kyc'
                    ? 'KYC'
                    : 'Relatórios'}
          </Button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#16213E] border-white/10">
            <CardHeader>
              <CardTitle className="text-gray-300 text-sm">Usuários</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-[#FFD700]">
              {(dashboard as any)?.totalUsers ?? 0}
            </CardContent>
          </Card>
          <Card className="bg-[#16213E] border-white/10">
            <CardHeader>
              <CardTitle className="text-gray-300 text-sm">Transações</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {(dashboard as any)?.totalTransactions ?? 0}
            </CardContent>
          </Card>
          <Card className="bg-[#16213E] border-white/10">
            <CardHeader>
              <CardTitle className="text-gray-300 text-sm">Apostas</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {(dashboard as any)?.totalBets ?? 0}
            </CardContent>
          </Card>
          <Card className="bg-[#16213E] border-white/10">
            <CardHeader>
              <CardTitle className="text-gray-300 text-sm">Sessões cassino</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {(dashboard as any)?.totalSessions ?? 0}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'users' && (
        <Card className="bg-[#16213E] border-white/10">
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {usersLoading ? (
              <Loading />
            ) : (
              (users || []).map((u: any) => (
                <div key={u.id} className="flex flex-wrap justify-between gap-2 border-b border-white/5 pb-2">
                  <div>
                    <p className="font-medium">{u.email}</p>
                    <p className="text-xs text-gray-400">
                      {u.role} · {u.isBanned ? 'BANIDO' : 'ativo'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!u.isBanned ? (
                      <Button
                        className="bg-red-600 text-xs"
                        onClick={async () => {
                          await banUser.mutateAsync({ id: u.id, data: { reason: 'Admin ban' } });
                          setMessage('Usuário banido');
                        }}
                      >
                        Banir
                      </Button>
                    ) : (
                      <Button
                        className="bg-green-600 text-xs"
                        onClick={async () => {
                          await unbanUser.mutateAsync(u.id);
                          setMessage('Usuário desbanido');
                        }}
                      >
                        Desbanir
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'withdrawals' && (
        <Card className="bg-[#16213E] border-white/10">
          <CardHeader>
            <CardTitle>Saques pendentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!withdrawals || (withdrawals as any[]).length === 0 ? (
              <p className="text-gray-400">Nenhum saque pendente.</p>
            ) : (
              (withdrawals as any[]).map((w) => (
                <div key={w.id} className="flex justify-between items-center border-b border-white/5 pb-2">
                  <div>
                    <p>R$ {Number(w.amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{w.pixKey}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="bg-green-600 text-xs"
                      onClick={async () => {
                        await approve.mutateAsync(w.id);
                        setMessage('Saque aprovado');
                      }}
                    >
                      Aprovar
                    </Button>
                    <Button
                      className="bg-red-600 text-xs"
                      onClick={async () => {
                        await reject.mutateAsync(w.id);
                        setMessage('Saque rejeitado');
                      }}
                    >
                      Rejeitar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'kyc' && (
        <Card className="bg-[#16213E] border-white/10">
          <CardHeader>
            <CardTitle>KYC pendente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {kycList.length === 0 ? (
              <p className="text-gray-400">Nenhuma submissão pendente.</p>
            ) : (
              kycList.map((k) => (
                <div key={k.id} className="flex justify-between border-b border-white/5 pb-2">
                  <div>
                    <p>{k.user?.email}</p>
                    <p className="text-xs text-gray-400">
                      {k.documentType} · {k.documentNumber}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-green-600 text-xs" onClick={() => reviewKyc(k.id, 'APPROVED')}>
                      Aprovar
                    </Button>
                    <Button className="bg-red-600 text-xs" onClick={() => reviewKyc(k.id, 'REJECTED')}>
                      Rejeitar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'reports' && (
        <Card className="bg-[#16213E] border-white/10">
          <CardHeader>
            <CardTitle>Relatórios (30 dias)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Receita (depósitos)</p>
              <p className="text-xl text-[#FFD700]">R$ {Number((reports as any)?.revenue || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Lucro estimado</p>
              <p className="text-xl">R$ {Number((reports as any)?.profit || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Usuários ativos</p>
              <p className="text-xl">{(reports as any)?.activeUsers ?? 0}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Novos cadastros</p>
              <p className="text-xl">{(reports as any)?.newRegistrations ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminContent />
    </AuthGuard>
  );
}
