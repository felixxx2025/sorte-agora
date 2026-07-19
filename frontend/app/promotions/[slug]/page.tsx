'use client';

import { AuthGuard } from '@/components/AuthGuard';
import Loading from '@/components/ui/loading';
import { useClaimPromo, usePromoDetail } from '@/lib/hooks';
import Link from 'next/link';
import { use, useState } from 'react';

function PromoDetailContent({ slug }: { slug: string }) {
  const { data: promo, isLoading, error } = usePromoDetail(slug);
  const claimPromo = useClaimPromo();
  const [message, setMessage] = useState('');
  const [claimError, setClaimError] = useState('');

  const handleClaim = async () => {
    setMessage('');
    setClaimError('');
    try {
      const result = await claimPromo.mutateAsync(slug);
      setMessage(result.message ?? 'Promoção resgatada com sucesso!');
    } catch (err: any) {
      setClaimError(err?.message ?? 'Não foi possível resgatar a promoção.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !promo) {
    return (
      <div className="sa-page min-h-screen">
        <div className="max-w-screen-md mx-auto px-4 py-12 text-center space-y-4">
          <p className="text-sa-muted">Promoção não encontrada.</p>
          <Link href="/promotions" className="text-sa-gold hover:underline text-sm">
            ← Voltar às promoções
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="sa-page min-h-screen">
      <div className="max-w-screen-md mx-auto px-4 py-6 space-y-5">
        <Link href="/promotions" className="text-sa-muted hover:text-sa-gold text-sm transition">
          ← Promoções
        </Link>

        <div className="sa-panel overflow-hidden">
          {promo.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={promo.imageUrl} alt={promo.title} className="w-full h-48 object-cover" />
          )}
          {!promo.imageUrl && (
            <div
              className="w-full h-48 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#8b0000,#1a0a0a 55%,#ffd70011)' }}
            >
              <span className="text-6xl">🎁</span>
            </div>
          )}
          <div className="p-6 space-y-4">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-sa-gold">{promo.title}</h1>
              {promo.subtitle && (
                <p className="text-sa-muted mt-1">{promo.subtitle}</p>
              )}
            </div>

            {/* Bonus details grid */}
            {(promo.bonusAmount != null || promo.bonusPercent != null || promo.minDeposit != null || promo.maxBonus != null || promo.wagerRequirement != null) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {promo.bonusPercent != null && (
                  <div className="sa-panel p-3 text-center">
                    <p className="font-display text-xl font-extrabold text-sa-gold">+{promo.bonusPercent}%</p>
                    <p className="text-xs text-sa-muted mt-1">Bônus</p>
                  </div>
                )}
                {promo.bonusAmount != null && (
                  <div className="sa-panel p-3 text-center">
                    <p className="font-display text-xl font-extrabold text-sa-gold">R$ {promo.bonusAmount.toFixed(2)}</p>
                    <p className="text-xs text-sa-muted mt-1">Valor do bônus</p>
                  </div>
                )}
                {promo.minDeposit != null && (
                  <div className="sa-panel p-3 text-center">
                    <p className="font-display text-xl font-extrabold text-white">R$ {promo.minDeposit.toFixed(2)}</p>
                    <p className="text-xs text-sa-muted mt-1">Depósito mínimo</p>
                  </div>
                )}
                {promo.maxBonus != null && (
                  <div className="sa-panel p-3 text-center">
                    <p className="font-display text-xl font-extrabold text-white">R$ {promo.maxBonus.toFixed(2)}</p>
                    <p className="text-xs text-sa-muted mt-1">Bônus máximo</p>
                  </div>
                )}
                {promo.wagerRequirement != null && (
                  <div className="sa-panel p-3 text-center">
                    <p className="font-display text-xl font-extrabold text-white">{promo.wagerRequirement}x</p>
                    <p className="text-xs text-sa-muted mt-1">Rollover</p>
                  </div>
                )}
                {promo.endsAt && (
                  <div className="sa-panel p-3 text-center">
                    <p className="font-display text-base font-bold text-white">
                      {new Date(promo.endsAt).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-sa-muted mt-1">Válida até</p>
                  </div>
                )}
              </div>
            )}

            {promo.description && (
              <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                <p className="whitespace-pre-wrap">{promo.description}</p>
              </div>
            )}

            {(message || claimError) && (
              <p
                className={`text-sm ${claimError ? 'text-red-400' : 'text-green-400'}`}
                role={claimError ? 'alert' : 'status'}
              >
                {claimError || message}
              </p>
            )}

            <button
              type="button"
              onClick={handleClaim}
              disabled={claimPromo.isPending || !!message}
              className="w-full rounded-lg bg-sa-gold text-black font-display font-extrabold py-3 hover:bg-sa-gold-dim transition disabled:opacity-50"
            >
              {claimPromo.isPending ? 'Resgatando...' : message ? '✓ Resgatado' : 'Resgatar Promoção'}
            </button>

            {promo.terms && (
              <details className="text-xs text-sa-muted">
                <summary className="cursor-pointer hover:text-white transition">Termos e condições</summary>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed">{promo.terms}</p>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PromoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <AuthGuard>
      <PromoDetailContent slug={slug} />
    </AuthGuard>
  );
}
