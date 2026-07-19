'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLogout, useProfile } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/authStore';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/casino', label: 'Cassino' },
  { href: '/sports', label: 'Esportes' },
  { href: '/wallet', label: 'Carteira' },
  { href: '/vip', label: 'VIP' },
  { href: '/affiliates', label: 'Afiliados' },
  { href: '/profile', label: 'Perfil' },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { data: profile } = useProfile();
  const logout = useLogout();

  if (!isAuthenticated) {
    return null;
  }

  const role = (profile as any)?.role || (user as any)?.role;
  const items =
    role === 'ADMIN'
      ? [...NAV_ITEMS, { href: '/admin', label: 'Admin' }]
      : NAV_ITEMS;

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch {
      useAuthStore.getState().logout();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    router.push('/login');
  };

  return (
    <header className="border-b border-white/10 bg-[#0F0F1A]/90 backdrop-blur sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-lg flex items-center justify-center">
            <span className="text-[#1A1A2E] font-bold">S</span>
          </div>
          <span className="text-white font-bold">SORTE AGORA</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  active
                    ? 'bg-[#FFD700]/15 text-[#FFD700]'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm hidden sm:inline">
            {user?.email || 'Usuário'}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-[#FFD700] hover:underline"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
