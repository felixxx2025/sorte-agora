'use client';

import { useCompleteMfaLogin, useLogin } from '@/lib/hooks';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const login = useLogin();
  const completeMfa = useCompleteMfaLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (mfaToken) {
        await completeMfa.mutateAsync({ mfaToken, token: mfaCode });
        window.location.href = '/dashboard';
        return;
      }
      const data = await login.mutateAsync({ email, password });
      if (data.mfaRequired && data.mfaToken) {
        setMfaToken(data.mfaToken);
        return;
      }
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err?.message || 'Erro ao fazer login. Verifique suas credenciais.');
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
          <h1 className="text-2xl font-bold text-white">
            {mfaToken ? 'Verificação MFA' : 'Entrar'}
          </h1>
        </div>

        <div className="bg-[#16213E] rounded-lg p-6 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!mfaToken ? (
              <>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0F0F1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0F0F1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-gray-400 text-sm">
                    <input type="checkbox" className="rounded" />
                    Lembrar-me
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[#FFD700] text-sm hover:underline"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Código do autenticador
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="w-full bg-[#0F0F1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                  placeholder="000000"
                  required
                  minLength={6}
                />
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={login.isPending || completeMfa.isPending}
              className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#1A1A2E] py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {login.isPending || completeMfa.isPending
                ? 'Entrando...'
                : mfaToken
                  ? 'Confirmar MFA'
                  : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Não tem conta?{' '}
            <Link href="/register" className="text-[#FFD700] hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
