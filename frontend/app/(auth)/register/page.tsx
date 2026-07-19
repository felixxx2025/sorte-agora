'use client';

import { useRegister } from '@/lib/hooks';
import Link from 'next/link';
import { useState } from 'react';

export default function RegisterPage() {
  const register = useRegister();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    firstName: '',
    lastName: '',
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      await register.mutateAsync({
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
      });
      window.location.href = '/dashboard';
    } catch {
      setError('Erro ao criar conta. Tente novamente.');
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
          <h1 className="text-2xl font-bold text-white">Criar Conta</h1>
        </div>

        <div className="bg-[#16213E] rounded-lg p-6 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-red-400 text-sm" role="alert">
                {error}
              </p>
            )}
            <div>
              <label className="block text-gray-300 text-sm mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#0F0F1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Senha</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[#0F0F1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Confirmar Senha</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full bg-[#0F0F1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Nome</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-[#0F0F1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Sobrenome</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-[#0F0F1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                placeholder="Seu sobrenome"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Telefone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#0F0F1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                placeholder="(11) 99999-9999"
              />
            </div>
            <label className="flex items-center gap-2 text-gray-400 text-sm">
              <input type="checkbox" className="rounded" required />
              Eu aceito os termos e condições
            </label>
            <button
              type="submit"
              disabled={register.isPending}
              className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#1A1A2E] py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {register.isPending ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Já tem conta?{' '}
            <Link href="/login" className="text-[#FFD700] hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
