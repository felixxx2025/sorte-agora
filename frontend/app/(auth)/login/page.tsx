'use client';

import { useCompleteMfaLogin, useLogin } from '@/lib/hooks';
import Link from 'next/link';
import { useState } from 'react';

const inputCls =
  'w-full rounded-lg border border-sa-red/40 bg-black/60 px-4 py-3 text-white placeholder-sa-muted focus:outline-none focus:border-sa-gold transition-colors';
const labelCls = 'block text-sm font-medium text-sa-muted mb-1.5';

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
        window.location.href = '/home';
        return;
      }
      const data = await login.mutateAsync({ email, password });
      if (data.mfaRequired && data.mfaToken) {
        setMfaToken(data.mfaToken);
        return;
      }
      window.location.href = '/home';
    } catch (err: any) {
      setError(err?.message || 'Erro ao fazer login. Verifique suas credenciais.');
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
          <h1 className="text-xl font-bold text-white">
            {mfaToken ? 'Verificação MFA' : 'Entrar na sua conta'}
          </h1>
        </div>

        <div className="sa-panel p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!mfaToken ? (
              <>
                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputCls}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-sa-muted cursor-pointer">
                    <input type="checkbox" className="rounded accent-sa-red" />
                    Lembrar-me
                  </label>
                  <Link href="/forgot-password" className="text-sa-gold hover:underline">
                    Esqueci a senha
                  </Link>
                </div>
              </>
            ) : (
              <div>
                <label className={labelCls}>Código do autenticador</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className={inputCls}
                  placeholder="000000"
                  required
                  minLength={6}
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={login.isPending || completeMfa.isPending}
              className="w-full rounded-lg bg-sa-gold text-black py-3 font-display font-extrabold hover:bg-sa-gold-dim transition disabled:opacity-50"
            >
              {login.isPending || completeMfa.isPending
                ? 'Entrando...'
                : mfaToken
                  ? 'Confirmar MFA'
                  : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sa-muted text-sm mt-6">
            Não tem conta?{' '}
            <Link href="/register" className="text-sa-gold hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
