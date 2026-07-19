'use client';

import { AuthGuard } from '@/components/AuthGuard';
import Loading from '@/components/ui/loading';
import { usePromos } from '@/lib/hooks';
import Link from 'next/link';

function PromotionsContent() {
  const { data: promos, isLoading } = usePromos();

  return (
    <div className="sa-page min-h-screen">
      <div className="max-w-screen-lg mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎁</span>
          <h1 className="font-display text-2xl font-extrabold text-sa-gold">Promoções</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loading size="lg" />
          </div>
        ) : !promos || promos.length === 0 ? (
          <div className="sa-panel py-16 text-center">
            <p className="text-sa-muted">Nenhuma promoção disponível no momento.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {promos.map((promo) => (
              <Link
                key={promo.id}
                href={`/promotions/${promo.slug ?? promo.id}`}
                className="sa-panel group flex flex-col overflow-hidden hover:border-sa-gold/50 transition"
              >
                {promo.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={promo.imageUrl}
                    alt={promo.title}
                    className="w-full h-36 object-cover"
                  />
                )}
                {!promo.imageUrl && (
                  <div
                    className="w-full h-36 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#8b0000,#1a0a0a 55%,#ffd70011)' }}
                  >
                    <span className="text-4xl">🎁</span>
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1 gap-2">
                  <h2 className="font-display font-bold text-white group-hover:text-sa-gold transition line-clamp-2">
                    {promo.title}
                  </h2>
                  {promo.subtitle && (
                    <p className="text-sm text-sa-muted line-clamp-2">{promo.subtitle}</p>
                  )}
                  {promo.bonusPercent != null && (
                    <span className="sa-chip self-start">+{promo.bonusPercent}% Bônus</span>
                  )}
                  {promo.endsAt && (
                    <p className="text-xs text-sa-muted mt-auto">
                      Válida até {new Date(promo.endsAt).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  <span className="mt-2 block w-full text-center rounded-lg bg-sa-red py-2 text-sm font-bold text-sa-gold border border-sa-gold/20 group-hover:bg-sa-red/80 transition">
                    Ver detalhes
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PromotionsPage() {
  return (
    <AuthGuard>
      <PromotionsContent />
    </AuthGuard>
  );
}
