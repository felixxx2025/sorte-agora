'use client';

import { useRegister } from '@/lib/hooks';
import Link from 'next/link';
import { useState } from 'react';

const inputCls =
  'w-full rounded-lg border border-sa-red/40 bg-black/60 px-4 py-3 text-white placeholder-sa-muted focus:outline-none focus:border-sa-gold transition-colors';
const labelCls = 'block text-sm font-medium text-sa-muted mb-1.5';

export default function RegisterPage() {
  const register = useRegister();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    if (!formData.dateOfBirth) {
      setError('Data de nascimento é obrigatória (18+)');
      return;
    }
    try {
      await register.mutateAsync({
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone || undefined,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
      });
      window.location.href = '/home';
    } catch {
      setError('Erro ao criar conta. Verifique os dados (idade mínima 18 anos).');
    }
  };

  return (
    <div className="sa-page flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="font-display text-3xl font-extrabold">
              <span className="text-sa-red">SORTE</span>
              <span className="text-sa-gold"> AGORA</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white">Criar Conta</h1>
        </div>

        <div className="sa-panel p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-red-400 text-sm" role="alert">
                {error}
              </p>
            )}
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputCls}
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className={labelCls}>Senha</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={inputCls}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className={labelCls}>Confirmar Senha</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={inputCls}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Nome</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={inputCls}
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className={labelCls}>Sobrenome</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={inputCls}
                  placeholder="Sobrenome"
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Data de nascimento (18+)</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Telefone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={inputCls}
                placeholder="(11) 99999-9999"
              />
            </div>
            <label className="flex items-start gap-2 text-sa-muted text-sm cursor-pointer">
              <input type="checkbox" className="mt-0.5 rounded accent-sa-red" required />
              <span>
                Aceito os{' '}
                <Link href="/terms" className="text-sa-gold hover:underline">Termos</Link>{' '}
                e a{' '}
                <Link href="/privacy" className="text-sa-gold hover:underline">Privacidade</Link>
              </span>
            </label>
            <button
              type="submit"
              disabled={register.isPending}
              className="w-full rounded-lg bg-sa-gold text-black py-3 font-display font-extrabold hover:bg-sa-gold-dim transition disabled:opacity-50"
            >
              {register.isPending ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <p className="text-center text-sa-muted text-sm mt-6">
            Já tem conta?{' '}
            <Link href="/login" className="text-sa-gold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
