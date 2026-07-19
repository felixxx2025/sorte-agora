'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export function GameTile({
  name,
  category,
  thumbnail,
  href,
  badge,
  className,
}: {
  name: string;
  category?: string;
  thumbnail?: string;
  href: string;
  badge?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative overflow-hidden rounded-lg border border-sa-red/30 bg-sa-surface aspect-[3/4] flex flex-col',
        className,
      )}
    >
      <div
        className="flex-1 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        style={{
          backgroundImage: thumbnail
            ? `url(${thumbnail})`
            : 'linear-gradient(145deg,#8b0000,#1a0a0a 60%,#ffd70033)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      {badge && (
        <span className="absolute top-2 left-2 sa-chip">{badge}</span>
      )}
      <div className="absolute bottom-0 inset-x-0 p-2">
        <p className="font-display text-sm font-bold text-white truncate">{name}</p>
        {category && (
          <p className="text-[10px] uppercase tracking-wide text-sa-gold/80">{category}</p>
        )}
      </div>
    </Link>
  );
}
