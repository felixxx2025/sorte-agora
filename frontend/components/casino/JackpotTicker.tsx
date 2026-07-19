'use client';

import { useJackpots } from '@/lib/hooks';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

function AnimatedAmount({ value }: { value: number }) {
  const safe = Number.isFinite(value) ? value : 0;
  const [displayed, setDisplayed] = useState(safe);
  const prevRef = useRef(safe);

  useEffect(() => {
    const end = Number.isFinite(value) ? value : 0;
    if (prevRef.current === end) {
      setDisplayed(end);
      return;
    }
    const start = prevRef.current;
    const duration = 800;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(animate);
      else prevRef.current = end;
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span>
      R${' '}
      {displayed.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  );
}

export function JackpotTicker() {
  const { data: jackpots } = useJackpots();

  if (!jackpots || jackpots.length === 0) return null;

  return (
    <section aria-label="Jackpots ao vivo">
      <h2 className="font-display text-xs font-bold uppercase tracking-widest text-sa-muted mb-2 flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-sa-gold animate-pulse" />
        Jackpots ao vivo
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x snap-mandatory">
        {jackpots.map((j) => {
          const amount = Number(
            (j as any).amount ?? (j as any).jackpotAmount ?? 0,
          );
          const thumb =
            (j as any).thumbnailUrl || (j as any).thumbnail || undefined;
          return (
            <Link
              key={j.id}
              href={`/casino/${j.id}`}
              className="snap-start flex-shrink-0 w-44 sa-panel p-3 hover:border-sa-gold/60 transition group"
              style={{ background: 'linear-gradient(135deg,#1a0a0a,#2d1000 80%)' }}
            >
              {thumb && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumb}
                  alt={j.name}
                  className="w-full h-16 object-cover rounded mb-2"
                />
              )}
              <p className="text-xs text-sa-muted truncate">{j.name}</p>
              <p className="font-display text-base font-extrabold text-sa-gold mt-0.5">
                <AnimatedAmount value={amount} />
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
