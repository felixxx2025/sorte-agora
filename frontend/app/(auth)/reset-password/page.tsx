'use client';

import { useResetPassword } from '@/lib/hooks';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function ResetPasswordForm() {
  const reset = useResetPassword();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      await reset.mutateAsync({ token, newPassword });
      setSuccess('Senha redefinida com sucesso. Redirecionando...');
      setTimeout(() => router.push('/login'), 1500);
    } catch {
      setError('Token inválido ou expirado. Solicite um novo link.');
    }
  };

  return (
    <div className="bg-[#16213E] rounded-lg p-6 border border-white/10">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!tokenFromUrl && (
          <div>
            <label className="block text-gray-300 text-sm mb-2">Token</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-[#0F0F1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700]"
              required
            />
          </div>
        )}
        <div>
          <label className="block text-gray-300 text-sm mb-2">Nova senha</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-[#0F0F1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700]"
            minLength={8}
            required
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-2">Confirmar senha</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-[#0F0F1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700]"
            minLength={8}
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

        <button
          type="submit"
          disabled={reset.isPending}
          className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#1A1A2E] py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {reset.isPending ? 'Salvando...' : 'Redefinir senha'}
        </button>
      </form>

      <p className="text-center text-gray-400 text-sm mt-6">
        <Link href="/login" className="text-[#FFD700] hover:underline">
          Voltar ao login
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
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
          <h1 className="text-2xl font-bold text-white">Nova senha</h1>
        </div>
        <Suspense fallback={<p className="text-gray-400 text-center">Carregando...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
