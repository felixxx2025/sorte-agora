'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLogout, useProfile } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/authStore';
import { BalancePill } from './BalancePill';
import { Button } from '@/components/ui/button';

export function ShellHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: profile } = useProfile();
  const logout = useLogout();
  const role = (profile as any)?.role || (user as any)?.role;

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
    <header className="sticky top-0 z-40 border-b border-sa-red/40 bg-black/90 backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-3 px-3 md:px-4">
        <Link href="/home" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-gradient-to-br from-sa-red to-sa-red-dark shadow-[0_0_12px_rgba(196,30,58,0.45)]">
            <span className="font-display text-lg font-extrabold text-sa-gold">S</span>
          </div>
          <div className="leading-tight">
            <p className="font-display text-sm font-bold tracking-wide text-sa-gold">
              SORTE AGORA
            </p>
            <p className="text-[10px] text-sa-muted hidden sm:block">Cassino &amp; Esportes</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          <BalancePill className="hidden xs:flex sm:flex" />
          <Button
            size="sm"
            variant="destructive"
            className="bg-sa-red hover:bg-sa-red-dark text-white border-0 font-bold"
            onClick={() => router.push('/wallet')}
          >
            Depositar
          </Button>
          <Link
            href="/vip"
            className={`hidden md:inline text-xs font-semibold ${
              pathname.startsWith('/vip') ? 'text-sa-gold' : 'text-sa-muted hover:text-sa-gold'
            }`}
          >
            VIP
          </Link>
          {role === 'ADMIN' && (
            <Link href="/admin" className="hidden md:inline text-xs text-sa-gold hover:underline">
              Admin
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-sa-muted hover:text-white"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
