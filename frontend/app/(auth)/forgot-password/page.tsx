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
    <div className="min-h-screen bg-gradient-to-b from-[#0F0F1A] to-[#1A1A2E] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-lg flex items-center justify-center">
              <span className="text-[#1A1A2E] font-bold text-xl">S</span>
            </div>
            <span className="text-white font-bold text-xl">SORTE AGORA</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Recuperar senha</h1>
        </div>

        <div className="bg-[#16213E] rounded-lg p-6 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0F0F1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700]"
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
              <p className="text-yellow-300 text-xs break-all">
                Dev token:{' '}
                <Link
                  href={`/reset-password?token=${devToken}`}
                  className="underline text-[#FFD700]"
                >
                  redefinir senha
                </Link>
              </p>
            )}

            <button
              type="submit"
              disabled={forgot.isPending}
              className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#1A1A2E] py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {forgot.isPending ? 'Enviando...' : 'Enviar link'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            <Link href="/login" className="text-[#FFD700] hover:underline">
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
