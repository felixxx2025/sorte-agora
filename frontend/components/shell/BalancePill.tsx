'use client';

import { useBalance } from '@/lib/hooks';
import { cn } from '@/lib/utils';

export function BalancePill({ className }: { className?: string }) {
  const { data } = useBalance();
  const balance = Number((data as any)?.balance ?? 0);

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border border-sa-red/40 bg-black/50 px-3 py-1.5',
        className,
      )}
    >
      <span className="text-[10px] uppercase tracking-wide text-sa-muted">Saldo</span>
      <span className="font-display text-sm font-bold text-sa-gold">
        R$ {balance.toFixed(2)}
      </span>
    </div>
  );
}
