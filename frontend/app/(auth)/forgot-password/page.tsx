'use client';

import { useForgotPassword } from '@/lib/hooks';
import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const forgot = useForgotPassword();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devToken, setDevToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setDevToken('');
    try {
      const result = await forgot.mutateAsync({ email });
      setSuccess(result?.message || 'Se o e-mail existir, enviamos um link de redefinição.');
      if (result?.resetToken) {
        setDevToken(result.resetToken);
      }
    } catch {
      setError('Não foi possível processar a solicitação. Tente novamente.');
    }
  };

  return (
    <div className="sa-page flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="font-display text-3xl font-extrabold">
              <span className="text-sa-red">SORTE</span>
              <span className="text-sa-gold"> AGORA</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white">Recuperar senha</h1>
        </div>

        <div className="sa-panel p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sa-muted text-sm mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-sa-red/40 bg-black/60 px-4 py-3 text-white placeholder-sa-muted focus:outline-none focus:border-sa-gold transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="text-green-400 text-sm" role="status">
                {success}
              </p>
            )}
            {devToken && (
              <p className="text-sa-gold text-xs break-all">
                Dev token:{' '}
                <Link
                  href={`/reset-password?token=${devToken}`}
                  className="underline"
                >
                  redefinir senha
                </Link>
              </p>
            )}

            <button
              type="submit"
              disabled={forgot.isPending}
              className="w-full rounded-lg bg-sa-gold text-black py-3 font-display font-extrabold hover:bg-sa-gold-dim transition disabled:opacity-50"
            >
              {forgot.isPending ? 'Enviando...' : 'Enviar link'}
            </button>
          </form>

          <p className="text-center text-sa-muted text-sm mt-6">
            <Link href="/login" className="text-sa-gold hover:underline">
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
