'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export type PromoItem = {
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  imageUrl?: string;
  accent?: 'red' | 'gold';
};

export function PromoCarousel({
  items,
  className,
}: {
  items: PromoItem[];
  className?: string;
}) {
  const [idx, setIdx] = useState(0);
  const list = items.length ? items : [];

  useEffect(() => {
    if (list.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % list.length), 4500);
    return () => clearInterval(t);
  }, [list.length]);

  if (!list.length) {
    return (
      <div className={cn('sa-panel h-36 md:h-44 flex items-center justify-center', className)}>
        <p className="text-sa-muted text-sm">Promoções em breve</p>
      </div>
    );
  }

  const current = list[idx];
  const inner = (
    <div
      className={cn(
        'relative h-36 md:h-44 overflow-hidden rounded-lg border border-sa-red/40',
        className,
      )}
      style={{
        background: current.imageUrl
          ? `linear-gradient(90deg,rgba(0,0,0,.75),rgba(0,0,0,.35)), url(${current.imageUrl}) center/cover`
          : current.accent === 'gold'
            ? 'linear-gradient(120deg,#8b0000,#1a0a0a 40%,#ffd70055)'
            : 'linear-gradient(120deg,#c41e3a,#0a0a0a 55%)',
      }}
    >
      <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
        <p className="font-display text-xl md:text-2xl font-extrabold text-sa-gold drop-shadow">
          {current.title}
        </p>
        {current.subtitle && (
          <p className="text-sm text-white/85 mt-1">{current.subtitle}</p>
        )}
      </div>
      {list.length > 1 && (
        <div className="absolute bottom-2 right-3 flex gap-1">
          {list.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIdx(i)}
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                i === idx ? 'bg-sa-gold' : 'bg-white/40',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );

  return current.href ? <Link href={current.href}>{inner}</Link> : inner;
}
