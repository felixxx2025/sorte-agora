'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '@/components/ui/loading';
import {
  useAffiliateCommissions,
  useAffiliateDashboard,
  useRegisterAffiliate,
} from '@/lib/hooks';
import { useState } from 'react';

function AffiliatesContent() {
  const { data: dashboard, isLoading, isError, refetch } = useAffiliateDashboard();
  const { data: commissions } = useAffiliateCommissions();
  const register = useRegisterAffiliate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    setMessage('');
    try {
      await register.mutateAsync({
        commissionType: 'REVSHARE',
        commissionRate: 20,
      });
      setMessage('Cadastro de afiliado concluído!');
      refetch();
    } catch {
      setError('Não foi possível registrar. Você já pode ser afiliado.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  const notAffiliate = isError || !dashboard;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-extrabold text-sa-gold mb-8">Programa de Afiliados</h1>

      {(message || error) && (
        <p className={`mb-4 text-sm ${error ? 'text-red-400' : 'text-green-400'}`}>
          {error || message}
        </p>
      )}

      {notAffiliate ? (
        <Card className="sa-panel border-sa-red/30 max-w-lg">
          <CardHeader>
            <CardTitle>Torne-se afiliado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400">
              Ganhe comissão por indicações (RevShare 20% padrão nesta fase).
            </p>
            <Button
              onClick={handleRegister}
              disabled={register.isPending}
              className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#1A1A2E]"
            >
              {register.isPending ? 'Registrando...' : 'Quero ser afiliado'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="sa-panel border-sa-red/30">
              <CardHeader>
                <CardTitle className="text-sm text-gray-300">Indicações</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold text-sa-gold">
                {(dashboard as any).totalReferrals}
              </CardContent>
            </Card>
            <Card className="sa-panel border-sa-red/30">
              <CardHeader>
                <CardTitle className="text-sm text-gray-300">Comissão total</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                R$ {Number((dashboard as any).totalCommission || 0).toFixed(2)}
              </CardContent>
            </Card>
            <Card className="sa-panel border-sa-red/30">
              <CardHeader>
                <CardTitle className="text-sm text-gray-300">Pendente</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                R$ {Number((dashboard as any).pendingCommission || 0).toFixed(2)}
              </CardContent>
            </Card>
          </div>

          <Card className="sa-panel border-sa-red/30 mb-6">
            <CardHeader>
              <CardTitle>Seu link</CardTitle>
            </CardHeader>
            <CardContent>
              <code className="text-sa-gold break-all">
                {(dashboard as any).trackingCode
                  ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${(dashboard as any).trackingCode}`
                  : '—'}
              </code>
            </CardContent>
          </Card>

          <Card className="sa-panel border-sa-red/30">
            <CardHeader>
              <CardTitle>Comissões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!commissions || commissions.length === 0 ? (
                <p className="text-gray-400">Nenhuma comissão ainda.</p>
              ) : (
                commissions.map((c: any) => (
                  <div key={c.id} className="flex justify-between border-b border-white/5 pb-2">
                    <span>
                      {c.source} · {c.status}
                    </span>
                    <span className="text-sa-gold">R$ {Number(c.amount).toFixed(2)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function AffiliatesPage() {
  return (
    <AuthGuard>
      <AffiliatesContent />
    </AuthGuard>
  );
}
