'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useBalance } from '@/lib/hooks';

function PlayContent() {
  const params = useSearchParams();
  const name = params.get('name') || 'Jogo Demo';
  const game = params.get('game') || 'demo';
  const token = params.get('token') || '';
  const { data: balance } = useBalance();
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTicks((t) => t + 1), 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#16213E]/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-lg flex items-center justify-center">
            <span className="text-[#1A1A2E] font-bold">S</span>
          </div>
          <div>
            <p className="font-semibold leading-tight">{name}</p>
            <p className="text-xs text-gray-400">Sessão {game}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Saldo</p>
          <p className="text-[#FFD700] font-bold">
            R$ {Number((balance as any)?.balance ?? 0).toFixed(2)}
          </p>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="relative h-56 rounded-xl border border-[#FFD700]/30 bg-gradient-to-b from-[#16213E] to-[#0F0F1A] overflow-hidden flex items-center justify-center">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 30% 40%, #FFD700 0, transparent 40%), radial-gradient(circle at 70% 60%, #FFA500 0, transparent 35%)',
                transform: `scale(${1 + (ticks % 5) * 0.02})`,
                transition: 'transform 1s ease',
              }}
            />
            <div className="relative z-10 space-y-2">
              <p className="text-[#FFD700] text-lg font-semibold">Modo demo</p>
              <p className="text-gray-400 text-sm">
                Sessão demo — provedor live quando CASINO_PROVIDER=live
              </p>
              <p className="text-xs text-gray-500 font-mono">
                token {(token || '—').slice(0, 20)}
                {token.length > 20 ? '…' : ''}
              </p>
            </div>
          </div>
          <Link href="/casino" className="inline-block text-[#FFD700] hover:underline">
            ← Voltar ao lobby
          </Link>
        </div>
      </main>
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
