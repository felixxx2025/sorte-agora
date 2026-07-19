'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { Input } from '@/components/ui/input';
import Loading from '@/components/ui/loading';
import { financialApi } from '@/lib/api';
import { useBalance, useDeposit, useTransactions, useWithdraw } from '@/lib/hooks';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function WalletContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>(
    tabParam === 'withdraw' ? 'withdraw' : 'deposit',
  );

  useEffect(() => {
    if (tabParam === 'withdraw') setActiveTab('withdraw');
    else if (tabParam === 'deposit') setActiveTab('deposit');
  }, [tabParam]);
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
    <div className="sa-page min-h-screen">
      <div className="max-w-screen-md mx-auto px-4 py-6 space-y-5">
        <h1 className="font-display text-2xl font-extrabold text-sa-gold">Caixa</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : (
        <>
          {/* Balance */}
          <div className="sa-panel p-5" style={{ background: 'linear-gradient(120deg,#8b0000,#1a0a0a 55%)' }}>
            <p className="text-xs uppercase tracking-widest text-sa-muted">Saldo Disponível</p>
            <p className="font-display text-4xl font-extrabold text-sa-gold mt-1">
              R$ {balance?.balance != null ? Number(balance.balance).toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-sa-muted mt-2">
              Bloqueado: R$ {balance?.lockedBalance != null ? Number(balance.lockedBalance).toFixed(2) : '0.00'}
            </p>
          </div>

          {(message || error) && (
            <p
              className={`text-sm ${error ? 'text-red-400' : 'text-green-400'}`}
              role={error ? 'alert' : 'status'}
            >
              {error || message}
            </p>
          )}

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('deposit')}
              className={activeTab === 'deposit' ? 'sa-chip bg-sa-gold/20 text-sa-gold border-sa-gold/50' : 'sa-chip opacity-60 hover:opacity-100 transition'}
            >
              💰 Depositar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('withdraw')}
              className={activeTab === 'withdraw' ? 'sa-chip bg-sa-red/40 text-white border-sa-red/60' : 'sa-chip opacity-60 hover:opacity-100 transition'}
            >
              🏧 Sacar
            </button>
          </div>

          {activeTab === 'deposit' && (
            <div className="sa-panel p-5 space-y-4">
              <h2 className="font-display font-bold text-sa-gold">Depósito via PIX</h2>
              <form onSubmit={handleDeposit} className="space-y-4">
                <div>
                  <label className="block text-xs text-sa-muted mb-1.5">Valor (R$)</label>
                  <Input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="10"
                    step="0.01"
                    required
                    className="bg-black/50 border-sa-red/40 text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={deposit.isPending}
                  className="w-full rounded-lg bg-sa-gold text-black font-display font-extrabold py-3 hover:bg-sa-gold-dim transition disabled:opacity-50"
                >
                  {deposit.isPending ? 'Processando...' : 'Gerar PIX'}
                </button>
              </form>

              {pendingPix && (
                <div className="mt-4 space-y-3 border-t border-sa-red/20 pt-4">
                  <p className="text-sm text-sa-muted">
                    Status: <span className="text-sa-gold">{pendingPix.status}</span>
                    {pendingPix.externalId && (
                      <span className="block text-xs mt-1 font-mono text-sa-muted">{pendingPix.externalId}</span>
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
                  <p className="text-xs text-sa-muted break-all font-mono">{pendingPix.pixCode}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div className="sa-panel p-5 space-y-4">
              <h2 className="font-display font-bold text-sa-gold">Saque via PIX</h2>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-xs text-sa-muted mb-1.5">Valor (R$)</label>
                  <Input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="20"
                    step="0.01"
                    required
                    className="bg-black/50 border-sa-red/40 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-sa-muted mb-1.5">Chave PIX</label>
                  <Input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    required
                    className="bg-black/50 border-sa-red/40 text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={withdraw.isPending}
                  className="w-full rounded-lg bg-sa-red text-sa-gold font-display font-extrabold py-3 hover:bg-sa-red/80 transition disabled:opacity-50 border border-sa-red"
                >
                  {withdraw.isPending ? 'Processando...' : 'Solicitar Saque'}
                </button>
              </form>
            </div>
          )}

          {/* Transaction history */}
          <div className="sa-panel p-5">
            <h2 className="font-display font-bold text-sa-gold mb-4">Histórico</h2>
            {!transactions || transactions.length === 0 ? (
              <p className="text-sa-muted text-sm">Nenhuma transação encontrada.</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx: any) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center rounded-lg bg-black/40 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{tx.type}</p>
                      <p className="text-[11px] text-sa-muted">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('pt-BR') : '—'} · {tx.status}
                      </p>
                    </div>
                    <p className={`font-bold text-sm ${tx.type === 'DEPOSIT' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'DEPOSIT' ? '+' : '-'} R$ {Number(tx.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <AuthGuard>
      <Suspense>
        <WalletContent />
      </Suspense>
    </AuthGuard>
  );
}
