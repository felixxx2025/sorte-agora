'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Loading from '@/components/ui/loading';
import {
  useAdminBonuses,
  useAdminDashboard,
  useAdminReports,
  useAdminUsers,
  useApproveWithdrawal,
  useBanUser,
  useCreateBonus,
  useDeleteBonus,
  usePendingSportsBets,
  usePendingWithdrawals,
  useRejectWithdrawal,
  useSettleSportsBet,
  useUnbanUser,
} from '@/lib/hooks';
import { useEffect, useState } from 'react';

type Tab =
  | 'overview'
  | 'users'
  | 'withdrawals'
  | 'kyc'
  | 'sports'
  | 'bonuses'
  | 'reports';

const TAB_LABELS: Record<Tab, string> = {
  overview: 'Visão geral',
  users: 'Usuários',
  withdrawals: 'Saques',
  kyc: 'KYC',
  sports: 'Apostas',
  bonuses: 'Bônus',
  reports: 'Relatórios',
};

function AdminContent() {
  const [tab, setTab] = useState<Tab>('overview');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [bonusForm, setBonusForm] = useState({
    name: '',
    type: 'WELCOME',
    amount: '10',
  });

  const { data: dashboard, isLoading: dashLoading } = useAdminDashboard();
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const { data: withdrawals } = usePendingWithdrawals();
  const { data: reports } = useAdminReports();
  const { data: pendingBets, refetch: refetchBets } = usePendingSportsBets();
  const { data: bonuses } = useAdminBonuses();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const approve = useApproveWithdrawal();
  const reject = useRejectWithdrawal();
  const settle = useSettleSportsBet();
  const createBonus = useCreateBonus();
  const deleteBonus = useDeleteBonus();

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
    if (tab === 'sports') refetchBets();
  }, [tab, refetchBets]);

  const reviewKyc = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    setError('');
    try {
      const { default: apiClient } = await import('@/lib/api/client');
      await apiClient.put(`/admin/kyc/${id}/review`, { decision });
      setMessage(`KYC ${decision}`);
      loadKyc();
    } catch (e: any) {
      setError(e?.message || 'Erro ao revisar KYC');
    }
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
      <p className="text-gray-400 mb-6">Operação financeira, apostas, bônus e KYC</p>

      {message && (
        <p className="text-green-400 text-sm mb-4" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="text-red-400 text-sm mb-4" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <Button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t ? 'bg-[#FFD700] text-[#1A1A2E]' : 'bg-[#16213E]'}
          >
            {TAB_LABELS[t]}
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
                <div
                  key={u.id}
                  className="flex flex-wrap justify-between gap-2 border-b border-white/5 pb-2"
                >
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
                <div
                  key={w.id}
                  className="flex justify-between items-center border-b border-white/5 pb-2"
                >
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
                    <Button
                      className="bg-green-600 text-xs"
                      onClick={() => reviewKyc(k.id, 'APPROVED')}
                    >
                      Aprovar
                    </Button>
                    <Button
                      className="bg-red-600 text-xs"
                      onClick={() => reviewKyc(k.id, 'REJECTED')}
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

      {tab === 'sports' && (
        <Card className="bg-[#16213E] border-white/10">
          <CardHeader>
            <CardTitle>Apostas pendentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!pendingBets || (pendingBets as any[]).length === 0 ? (
              <p className="text-gray-400">Nenhuma aposta pendente.</p>
            ) : (
              (pendingBets as any[]).map((b) => (
                <div
                  key={b.id}
                  className="flex flex-wrap justify-between gap-2 border-b border-white/5 pb-2"
                >
                  <div>
                    <p className="font-medium">{b.event?.name || b.eventId}</p>
                    <p className="text-xs text-gray-400">
                      {b.user?.email} · {b.selection?.name} @ {Number(b.odds).toFixed(2)} · R${' '}
                      {Number(b.stake).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="bg-green-600 text-xs"
                      disabled={settle.isPending}
                      onClick={async () => {
                        setError('');
                        try {
                          await settle.mutateAsync({ id: b.id, result: 'WON' });
                          setMessage('Aposta liquidada: WON');
                        } catch (e: any) {
                          setError(e?.message || 'Erro ao liquidar');
                        }
                      }}
                    >
                      WON
                    </Button>
                    <Button
                      className="bg-red-600 text-xs"
                      disabled={settle.isPending}
                      onClick={async () => {
                        setError('');
                        try {
                          await settle.mutateAsync({ id: b.id, result: 'LOST' });
                          setMessage('Aposta liquidada: LOST');
                        } catch (e: any) {
                          setError(e?.message || 'Erro ao liquidar');
                        }
                      }}
                    >
                      LOST
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'bonuses' && (
        <div className="space-y-6">
          <Card className="bg-[#16213E] border-white/10">
            <CardHeader>
              <CardTitle>Criar bônus</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-4 gap-3">
              <Input
                placeholder="Nome"
                value={bonusForm.name}
                onChange={(e) => setBonusForm({ ...bonusForm, name: e.target.value })}
                className="bg-[#0F0F1A] border-white/10 text-white"
              />
              <select
                value={bonusForm.type}
                onChange={(e) => setBonusForm({ ...bonusForm, type: e.target.value })}
                className="bg-[#0F0F1A] border border-white/10 rounded px-3 py-2"
              >
                <option value="WELCOME">WELCOME</option>
                <option value="DEPOSIT">DEPOSIT</option>
                <option value="LOYALTY">LOYALTY</option>
              </select>
              <Input
                type="number"
                placeholder="Valor"
                value={bonusForm.amount}
                onChange={(e) => setBonusForm({ ...bonusForm, amount: e.target.value })}
                className="bg-[#0F0F1A] border-white/10 text-white"
              />
              <Button
                className="bg-[#FFD700] text-[#1A1A2E]"
                disabled={createBonus.isPending}
                onClick={async () => {
                  setError('');
                  try {
                    await createBonus.mutateAsync({
                      name: bonusForm.name,
                      type: bonusForm.type,
                      amount: parseFloat(bonusForm.amount),
                      isActive: true,
                    });
                    setMessage('Bônus criado');
                    setBonusForm({ name: '', type: 'WELCOME', amount: '10' });
                  } catch (e: any) {
                    setError(e?.message || 'Erro ao criar bônus');
                  }
                }}
              >
                Criar
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#16213E] border-white/10">
            <CardHeader>
              <CardTitle>Bônus cadastrados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!bonuses || (bonuses as any[]).length === 0 ? (
                <p className="text-gray-400">Nenhum bônus.</p>
              ) : (
                (bonuses as any[]).map((b) => (
                  <div
                    key={b.id}
                    className="flex justify-between items-center border-b border-white/5 pb-2"
                  >
                    <div>
                      <p className="font-medium">{b.name}</p>
                      <p className="text-xs text-gray-400">
                        {b.type} · R$ {Number(b.amount).toFixed(2)} ·{' '}
                        {b.isActive ? 'ativo' : 'inativo'}
                      </p>
                    </div>
                    <Button
                      className="bg-red-600 text-xs"
                      onClick={async () => {
                        await deleteBonus.mutateAsync(b.id);
                        setMessage('Bônus removido');
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'reports' && (
        <Card className="bg-[#16213E] border-white/10">
          <CardHeader>
            <CardTitle>Relatórios (30 dias)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Receita (depósitos)</p>
              <p className="text-xl text-[#FFD700]">
                R$ {Number((reports as any)?.revenue || 0).toFixed(2)}
              </p>
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
