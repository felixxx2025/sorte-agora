'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { JackpotTicker } from '@/components/casino/JackpotTicker';
import { PromoCarousel, type PromoItem } from '@/components/casino/PromoCarousel';
import Loading from '@/components/ui/loading';
import { useBalance, useSportsEvents } from '@/lib/hooks';
import { usePromos } from '@/lib/hooks/usePromos';
import Link from 'next/link';

const STATIC_PROMOS: PromoItem[] = [
  {
    id: 'p1',
    title: 'Bônus de Boas-vindas',
    subtitle: 'Deposite e ganhe até R$ 500 de bônus!',
    href: '/wallet',
    accent: 'red',
  },
  {
    id: 'p2',
    title: '100% no 1º Depósito',
    subtitle: 'Dobre seu saldo e jogue mais.',
    href: '/wallet',
    accent: 'gold',
  },
];

const SHORTCUTS = [
  { label: 'Crash', emoji: '🚀', href: '/crash', accent: 'bg-sa-red' },
  { label: 'Ao Vivo', emoji: '📺', href: '/casino?category=live', accent: 'bg-red-900' },
  { label: 'Cassino', emoji: '🎰', href: '/casino', accent: 'bg-sa-red/80' },
  { label: 'Esportes', emoji: '⚽', href: '/sports', accent: 'bg-red-800' },
  { label: 'Carteira', emoji: '💰', href: '/wallet', accent: 'bg-amber-800' },
  { label: 'VIP', emoji: '👑', href: '/vip', accent: 'bg-yellow-800' },
];

function HomeContent() {
  const { data: balance } = useBalance();
  const { data: promos, isLoading: promosLoading } = usePromos();
  const { data: liveEvents = [] } = useSportsEvents(true);

  const promoItems: PromoItem[] =
    promos && promos.length > 0
      ? promos.map((p) => ({
          id: p.id,
          title: p.title,
          subtitle: p.subtitle,
          href: p.href,
          accent: 'red' as const,
        }))
      : STATIC_PROMOS;

  return (
    <div className="sa-page min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 py-4 space-y-6">
        {/* Balance strip */}
        <div className="flex items-center justify-between sa-panel px-4 py-3">
          <div>
            <p className="text-xs text-sa-muted uppercase tracking-widest">Saldo</p>
            <p className="font-display text-2xl font-extrabold text-sa-gold">
              R$ {balance?.balance != null ? Number(balance.balance).toFixed(2) : '0.00'}
            </p>
          </div>
          <Link
            href="/wallet"
            className="rounded-lg bg-sa-red px-4 py-2 text-sm font-bold text-sa-gold border border-sa-gold/30 hover:bg-sa-red/80 transition"
          >
            Depositar
          </Link>
        </div>

        {/* Promo carousel */}
        {promosLoading ? (
          <div className="h-36 md:h-44 sa-panel flex items-center justify-center">
            <Loading size="sm" />
          </div>
        ) : (
          <PromoCarousel items={promoItems} />
        )}

        {/* Quick shortcuts */}
        <section>
          <h2 className="font-display text-xs font-bold uppercase tracking-widest text-sa-muted mb-3">
            Acesso rápido
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SHORTCUTS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg py-4 px-2 ${s.accent} border border-sa-red/30 hover:brightness-110 transition`}
              >
                <span className="text-2xl">{s.emoji}</span>
                <span className="font-display text-xs font-bold text-sa-gold">{s.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Jackpot ticker */}
        <JackpotTicker />

        {/* Crash highlight */}
        <section>
          <div className="sa-panel p-0 overflow-hidden">
            <div
              className="relative h-28 flex items-center justify-between px-6"
              style={{
                background: 'linear-gradient(120deg, #8b0000 0%, #0a0a0a 55%, #ffd70011 100%)',
              }}
            >
              <div>
                <h3 className="font-display text-xl font-extrabold text-sa-gold">
                  🚀 Crash
                </h3>
                <p className="text-sm text-white/70">Multiplica em segundos</p>
              </div>
              <Link
                href="/crash"
                className="rounded-lg bg-sa-gold text-black font-bold px-5 py-2.5 text-sm hover:bg-sa-gold-dim transition"
              >
                Jogar agora
              </Link>
            </div>
          </div>
        </section>

        {/* Live strip */}
        {(liveEvents as any[]).length > 0 && (
          <section>
            <h2 className="font-display text-xs font-bold uppercase tracking-widest text-sa-muted mb-3 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-sa-red animate-pulse" />
              Ao Vivo
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x snap-mandatory">
              {(liveEvents as any[]).slice(0, 8).map((ev) => (
                <Link
                  key={ev.id}
                  href="/sports?isLive=true"
                  className="snap-start flex-shrink-0 w-48 sa-panel p-3 hover:border-sa-red/70 transition"
                >
                  <span className="sa-chip mb-2 text-[10px]">AO VIVO</span>
                  <p className="font-display text-sm font-bold text-white truncate">
                    {ev.name || 'Evento ao vivo'}
                  </p>
                  <p className="text-[10px] text-sa-muted mt-1 truncate">{ev.league || ''}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}
