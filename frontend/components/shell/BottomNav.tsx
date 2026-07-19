'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/home', label: 'Início', icon: '🏠' },
  { href: '/casino', label: 'Cassino', icon: '🎰' },
  { href: '/sports', label: 'Esportes', icon: '⚽' },
  { href: '/wallet', label: 'Carteira', icon: '💰' },
  { href: '/profile', label: 'Eu', icon: '👤' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-sa-red/40 bg-black/95 backdrop-blur">
      <div className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/home' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2 text-[10px]',
                active ? 'text-sa-gold' : 'text-sa-muted',
              )}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
