'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Loading from '@/components/ui/loading';
import { financialApi } from '@/lib/api';
import { useBalance, useDeposit, useTransactions, useWithdraw } from '@/lib/hooks';
import { useEffect, useState } from 'react';

function WalletContent() {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pendingPix, setPendingPix] = useState<{
    transactionId: string;
    pixCode: string;
    qrCode: string;
    externalId?: string;
    status: string;
  } | null>(null);

  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useBalance();
  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTx } =
    useTransactions();
  const deposit = useDeposit();
  const withdraw = useWithdraw();

  const isLoading = balanceLoading || transactionsLoading;

  useEffect(() => {
    if (!pendingPix || pendingPix.status === 'COMPLETED') return;
    const id = setInterval(async () => {
      try {
        const status: any = await financialApi.getDepositStatus(pendingPix.transactionId);
        if (status?.status === 'COMPLETED') {
          setPendingPix((p) => (p ? { ...p, status: 'COMPLETED' } : p));
          setMessage(
            `PIX confirmado! Saldo: R$ ${Number(status.balance ?? 0).toFixed(2)}`,
          );
          refetchBalance();
          refetchTx();
        }
      } catch {
        // keep polling
      }
    }, 3000);
    return () => clearInterval(id);
  }, [pendingPix, refetchBalance, refetchTx]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setPendingPix(null);
    try {
      const result: any = await deposit.mutateAsync({ amount: parseFloat(depositAmount) });
      if (result?.status === 'COMPLETED' || result?.autoConfirmed) {
        setMessage(
          `Depósito confirmado! Novo saldo: R$ ${Number(result.balance ?? 0).toFixed(2)}`,
        );
      } else {
        setPendingPix({
          transactionId: result.transactionId,
          pixCode: result.pixCode,
          qrCode: result.qrCode,
          externalId: result.externalId,
          status: result.status || 'PENDING',
        });
        setMessage('PIX gerado. Aguardando pagamento/webhook…');
      }
      setDepositAmount('');
    } catch (err: any) {
      setError(err?.message || 'Erro ao solicitar depósito');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await withdraw.mutateAsync({ amount: parseFloat(withdrawAmount), pixKey });
      setMessage('Saque solicitado com sucesso! Aguardando aprovação.');
      setWithdrawAmount('');
      setPixKey('');
    } catch (err: any) {
      setError(err?.message || 'Erro ao solicitar saque. Verifique o saldo e tente novamente.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Carteira</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : (
        <>
          <Card className="bg-[#16213E] border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-gray-300">Saldo Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-[#FFD700]">
                R$ {balance?.balance != null ? Number(balance.balance).toFixed(2) : '0.00'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Bloqueado: R${' '}
                {balance?.lockedBalance != null ? Number(balance.lockedBalance).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>

          {(message || error) && (
            <p
              className={`mb-4 text-sm ${error ? 'text-red-400' : 'text-green-400'}`}
              role={error ? 'alert' : 'status'}
            >
              {error || message}
            </p>
          )}

          <div className="flex gap-4 mb-6">
            <Button
              onClick={() => setActiveTab('deposit')}
              className={activeTab === 'deposit' ? 'bg-[#FFD700] text-[#1A1A2E]' : 'bg-[#16213E]'}
            >
              Depositar
            </Button>
            <Button
              onClick={() => setActiveTab('withdraw')}
              className={activeTab === 'withdraw' ? 'bg-red-600' : 'bg-[#16213E]'}
            >
              Sacar
            </Button>
          </div>

          {activeTab === 'deposit' && (
            <Card className="bg-[#16213E] border-white/10 mb-8">
              <CardHeader>
                <CardTitle className="text-gray-300">Depósito via PIX</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDeposit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Valor (R$)</label>
                    <Input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      min="10"
                      step="0.01"
                      required
                      className="bg-[#0F0F1A] border-white/10 text-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={deposit.isPending}
                    className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#1A1A2E] disabled:opacity-50"
                  >
                    {deposit.isPending ? 'Processando...' : 'Depositar'}
                  </Button>
                </form>

                {pendingPix && (
                  <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
                    <p className="text-sm text-gray-400">
                      Status: <span className="text-[#FFD700]">{pendingPix.status}</span>
                      {pendingPix.externalId && (
                        <span className="block text-xs mt-1 font-mono">{pendingPix.externalId}</span>
                      )}
                    </p>
                    {pendingPix.qrCode?.startsWith('data:') && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pendingPix.qrCode}
                        alt="QR PIX"
                        className="w-40 h-40 bg-white rounded mx-auto object-contain"
                      />
                    )}
                    <p className="text-xs text-gray-500 break-all font-mono">{pendingPix.pixCode}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'withdraw' && (
            <Card className="bg-[#16213E] border-white/10 mb-8">
              <CardHeader>
                <CardTitle className="text-gray-300">Saque via PIX</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Valor (R$)</label>
                    <Input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      min="20"
                      step="0.01"
                      required
                      className="bg-[#0F0F1A] border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Chave PIX</label>
                    <Input
                      type="text"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      required
                      className="bg-[#0F0F1A] border-white/10 text-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={withdraw.isPending}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    {withdraw.isPending ? 'Processando...' : 'Solicitar Saque'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="bg-[#16213E] border-white/10">
            <CardHeader>
              <CardTitle className="text-gray-300">Histórico de Transações</CardTitle>
            </CardHeader>
            <CardContent>
              {!transactions || transactions.length === 0 ? (
                <p className="text-gray-400">Nenhuma transação encontrada.</p>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx: any) => (
                    <div
                      key={tx.id}
                      className="flex justify-between items-center p-3 bg-[#0F0F1A] rounded"
                    >
                      <div>
                        <p className="font-medium">{tx.type}</p>
                        <p className="text-sm text-gray-400">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '—'} ·{' '}
                          {tx.status}
                        </p>
                      </div>
                      <p
                        className={`font-bold ${
                          tx.type === 'DEPOSIT' ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {tx.type === 'DEPOSIT' ? '+' : '-'} R$ {Number(tx.amount).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function WalletPage() {
  return (
    <AuthGuard>
      <WalletContent />
    </AuthGuard>
  );
}
