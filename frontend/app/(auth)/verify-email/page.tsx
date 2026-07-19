'use client';

import Loading from '@/components/ui/loading';
import { useVerifyEmail, useResendVerification } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/authStore';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const verifyEmail = useVerifyEmail();
  const resendVerification = useResendVerification();
  const { isAuthenticated } = useAuthStore();

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    setStatus('verifying');
    verifyEmail
      .mutateAsync(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.message ?? 'E-mail verificado com sucesso!');
      })
      .catch((err: any) => {
        setStatus('error');
        setMessage(err?.message ?? 'Link inválido ou expirado.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleResend = async () => {
    setResendMessage('');
    try {
      const res = await resendVerification.mutateAsync();
      setResendMessage(res.message ?? 'E-mail de verificação reenviado!');
    } catch (err: any) {
      setResendMessage(err?.message ?? 'Erro ao reenviar.');
    }
  };

  return (
    <div className="min-h-screen sa-page flex items-center justify-center px-4">
      <div className="sa-panel max-w-md w-full p-8 text-center space-y-5">
        {!token && status === 'idle' && (
          <>
            <span className="text-5xl block">📧</span>
            <h1 className="font-display text-xl font-extrabold text-sa-gold">
              Verificar E-mail
            </h1>
            <p className="text-sa-muted text-sm">
              Acesse o link enviado para o seu e-mail para confirmar sua conta.
            </p>
            {isAuthenticated && (
              <>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendVerification.isPending}
                  className="w-full rounded-lg bg-sa-red text-sa-gold font-display font-bold py-3 hover:bg-sa-red/80 transition disabled:opacity-50 border border-sa-red/60"
                >
                  {resendVerification.isPending ? 'Enviando...' : 'Reenviar e-mail'}
                </button>
                {resendMessage && (
                  <p className="text-sm text-green-400">{resendMessage}</p>
                )}
              </>
            )}
          </>
        )}

        {status === 'verifying' && (
          <>
            <Loading size="lg" />
            <p className="text-sa-muted">Verificando seu e-mail…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <span className="text-5xl block">✅</span>
            <h1 className="font-display text-xl font-extrabold text-sa-gold">Verificado!</h1>
            <p className="text-green-400 text-sm">{message}</p>
            <Link
              href="/home"
              className="block w-full rounded-lg bg-sa-gold text-black font-display font-extrabold py-3 hover:bg-sa-gold-dim transition"
            >
              Ir para o início
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <span className="text-5xl block">❌</span>
            <h1 className="font-display text-xl font-extrabold text-sa-gold">Falha na verificação</h1>
            <p className="text-red-400 text-sm">{message}</p>
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendVerification.isPending}
                className="w-full rounded-lg bg-sa-red text-sa-gold font-display font-bold py-3 hover:bg-sa-red/80 transition disabled:opacity-50 border border-sa-red/60"
              >
                {resendVerification.isPending ? 'Enviando...' : 'Reenviar link'}
              </button>
            )}
            {resendMessage && (
              <p className="text-sm text-green-400">{resendMessage}</p>
            )}
            <Link href="/home" className="text-sa-gold text-sm hover:underline">
              Voltar ao início
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
