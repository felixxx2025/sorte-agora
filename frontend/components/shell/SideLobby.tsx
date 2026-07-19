'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const SIDE_ITEMS = [
  { href: '/home', label: 'Início', icon: '🏠' },
  { href: '/casino', label: 'Cassino', icon: '🎰' },
  { href: '/casino?category=live', label: 'Ao Vivo', icon: '🔴' },
  { href: '/crash', label: 'Crash', icon: '📈' },
  { href: '/sports', label: 'Esportes', icon: '⚽' },
  { href: '/sports?isLive=true', label: 'Esportes Live', icon: '📺' },
  { href: '/wallet', label: 'Carteira', icon: '💰' },
  { href: '/vip', label: 'VIP', icon: '👑' },
  { href: '/affiliates', label: 'Afiliados', icon: '🤝' },
  { href: '/profile', label: 'Perfil', icon: '👤' },
];

export function SideLobby() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col gap-1 border-r border-sa-red/30 bg-sa-elevated/80 p-3 min-h-[calc(100vh-3.5rem)] sticky top-14">
      <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-sa-gold">
        Lobby
      </p>
      {SIDE_ITEMS.map((item) => {
        const base = item.href.split('?')[0];
        const active =
          pathname === base ||
          (base !== '/home' && pathname.startsWith(base));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
              active
                ? 'bg-sa-red/25 text-sa-gold border border-sa-red/40'
                : 'text-gray-300 hover:bg-white/5 hover:text-white',
            )}
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
