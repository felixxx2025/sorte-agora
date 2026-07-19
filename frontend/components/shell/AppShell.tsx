'use client';

import { usePathname } from 'next/navigation';
import { ShellHeader } from './ShellHeader';
import { SideLobby } from './SideLobby';
import { BottomNav } from './BottomNav';
import { ChatDock } from '@/components/chat/ChatDock';

/** Rotas full-bleed sem side lobby (ainda com header). */
const FULL_BLEED = ['/casino/play', '/crash'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fullBleed = FULL_BLEED.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );

  return (
    <div className="sa-page min-h-screen pb-16 lg:pb-0">
      <ShellHeader />
      <div className="flex">
        {!fullBleed && <SideLobby />}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <BottomNav />
      <ChatDock />
    </div>
  );
}
