'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Loading from '@/components/ui/loading';
import { useBalance, useDeposit, useTransactions, useWithdraw } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function WalletPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

  const { data: balance, isLoading: balanceLoading } = useBalance();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const deposit = useDeposit();
  const withdraw = useWithdraw();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const isLoading = balanceLoading || transactionsLoading;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await deposit.mutateAsync({ amount: parseFloat(depositAmount) });
      alert('Depósito solicitado com sucesso!');
      setDepositAmount('');
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Erro ao solicitar depósito');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await withdraw.mutateAsync({ amount: parseFloat(withdrawAmount), pixKey });
      alert('Saque solicitado com sucesso!');
      setWithdrawAmount('');
      setPixKey('');
    } catch (error) {
      console.error('Withdraw error:', error);
      alert('Erro ao solicitar saque');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Carteira</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : (
          <>
            <Card className="bg-gray-800 border-gray-700 mb-8">
              <CardHeader>
                <CardTitle className="text-gray-300">Saldo Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-400">
                  R$ {balance?.balance ? Number(balance.balance).toFixed(2) : '0.00'}
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-4 mb-6">
              <Button
                onClick={() => setActiveTab('deposit')}
                className={activeTab === 'deposit' ? 'bg-green-600' : 'bg-gray-700'}
              >
                Depositar
              </Button>
              <Button
                onClick={() => setActiveTab('withdraw')}
                className={activeTab === 'withdraw' ? 'bg-red-600' : 'bg-gray-700'}
              >
                Sacar
              </Button>
            </div>

            {activeTab === 'deposit' && (
              <Card className="bg-gray-800 border-gray-700 mb-8">
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
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={deposit.isPending}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      {deposit.isPending ? 'Processando...' : 'Solicitar Depósito'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'withdraw' && (
              <Card className="bg-gray-800 border-gray-700 mb-8">
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
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Chave PIX</label>
                      <Input
                        type="text"
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        required
                        className="bg-gray-700 border-gray-600 text-white"
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

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-300">Histórico de Transações</CardTitle>
              </CardHeader>
              <CardContent>
                {!transactions || transactions.length === 0 ? (
                  <p className="text-gray-400">Nenhuma transação encontrada.</p>
                ) : (
                  <div className="space-y-2">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex justify-between items-center p-3 bg-gray-700 rounded"
                      >
                        <div>
                          <p className="font-medium">{tx.type}</p>
                          <p className="text-sm text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        </div>
                        <p
                          className={`font-bold ${tx.type === 'DEPOSIT' ? 'text-green-400' : 'text-red-400'
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
    </div>
  );
}
