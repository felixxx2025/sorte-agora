'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { useVipLevels, useVipMissions, useVipStatus } from '@/lib/hooks';
import { Loader2 } from 'lucide-react';

function VipContent() {
  const { data: vipStatus, isLoading: statusLoading } = useVipStatus();
  const { data: vipLevels, isLoading: levelsLoading } = useVipLevels();
  const { data: missions, isLoading: missionsLoading } = useVipMissions();

  const isLoading = statusLoading || levelsLoading || missionsLoading;

  return (
    <div className="sa-page min-h-screen">
      <div className="max-w-screen-md mx-auto px-4 py-6 space-y-5">
        <h1 className="font-display text-2xl font-extrabold text-sa-gold">👑 Programa VIP</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-sa-gold" />
          </div>
        ) : (
          <>
            {vipStatus && (
              <div
                className="sa-panel p-5"
                style={{ background: 'linear-gradient(120deg,#8b0000,#1a0a0a 60%,#ffd70022)' }}
              >
                <p className="text-xs uppercase tracking-widest text-sa-muted">Seu nível</p>
                <p className="font-display text-3xl font-extrabold text-sa-gold mt-1">
                  {vipStatus.level?.name || 'Bronze'}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <p className="text-sm text-white/70">
                    Pontos: <span className="font-bold text-sa-gold">{vipStatus.points || 0}</span>
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="sa-panel p-5">
                <h2 className="font-display font-bold text-sa-gold mb-4">Níveis</h2>
                <div className="space-y-2">
                  {!vipLevels || vipLevels.length === 0 ? (
                    <p className="text-sa-muted text-sm">Níveis indisponíveis.</p>
                  ) : (
                    vipLevels.map((level: any) => (
                      <div
                        key={level.id}
                        className={`flex justify-between items-center rounded-lg px-3 py-2 ${
                          vipStatus?.level?.id === level.id
                            ? 'bg-sa-gold/10 border border-sa-gold/30'
                            : 'bg-black/30'
                        }`}
                      >
                        <span className="text-sm text-white">{level.name}</span>
                        <span className="text-xs font-bold text-sa-gold">{level.pointsRequired} pts</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="sa-panel p-5">
                <h2 className="font-display font-bold text-sa-gold mb-4">Missões Ativas</h2>
                <div className="space-y-3">
                  {(() => {
                    const list = Array.isArray(missions)
                      ? missions
                      : [
                          ...((missions as any)?.daily || []),
                          ...((missions as any)?.weekly || []),
                        ];
                    if (!list.length) {
                      return <p className="text-sa-muted text-sm">Nenhuma missão ativa.</p>;
                    }
                    return list.map((mission: any, idx: number) => (
                      <div
                        key={mission.id || idx}
                        className="rounded-lg bg-black/30 px-3 py-2.5 border border-sa-red/20"
                      >
                        <p className="font-medium text-sm text-white">{mission.title || mission.name}</p>
                        {mission.description && (
                          <p className="text-xs text-sa-muted mt-1">{mission.description}</p>
                        )}
                        {mission.reward && (
                          <p className="text-xs text-sa-gold mt-1">+{mission.reward} pts</p>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VipPage() {
  return (
    <AuthGuard>
      <VipContent />
    </AuthGuard>
  );
}
