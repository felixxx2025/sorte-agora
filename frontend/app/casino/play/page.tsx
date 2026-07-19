'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PlayContent() {
  const params = useSearchParams();
  const name = params.get('name') || 'Jogo Demo';
  const game = params.get('game') || 'demo';
  const token = params.get('token') || '';

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-xl flex items-center justify-center">
          <span className="text-[#1A1A2E] font-bold text-2xl">S</span>
        </div>
        <h1 className="text-3xl font-bold">{name}</h1>
        <p className="text-gray-400">
          Modo demo do provedor de cassino (Fase 2). Sessão: {game}
        </p>
        <p className="text-xs text-gray-500 break-all">token: {token.slice(0, 24)}…</p>
        <div className="h-48 rounded-xl border border-[#FFD700]/30 bg-[#16213E] flex items-center justify-center animate-pulse">
          <span className="text-[#FFD700]">Jogando (simulação)</span>
        </div>
        <Link href="/casino" className="inline-block text-[#FFD700] hover:underline">
          ← Voltar ao lobby
        </Link>
      </div>
    </div>
  );
}

export default function CasinoPlayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F0F1A]" />}>
      <PlayContent />
    </Suspense>
  );
}
