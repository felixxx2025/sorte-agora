'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVipLevels, useVipMissions, useVipStatus } from '@/lib/hooks';
import { Loader2 } from 'lucide-react';

function VipContent() {
  const { data: vipStatus, isLoading: statusLoading } = useVipStatus();
  const { data: vipLevels, isLoading: levelsLoading } = useVipLevels();
  const { data: missions, isLoading: missionsLoading } = useVipMissions();

  const isLoading = statusLoading || levelsLoading || missionsLoading;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Programa VIP</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#FFD700]" />
        </div>
      ) : (
        <>
          {vipStatus && (
            <Card className="bg-gradient-to-r from-[#16213E] to-[#1A1A2E] border-[#FFD700]/30 mb-8">
              <CardHeader>
                <CardTitle className="text-white">Seu Status VIP</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[#FFD700]">
                  {vipStatus.level?.name || 'Bronze'}
                </p>
                <p className="text-gray-300 mt-2">Pontos: {vipStatus.points || 0}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#16213E] border-white/10">
              <CardHeader>
                <CardTitle className="text-gray-300">Níveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!vipLevels || vipLevels.length === 0 ? (
                  <p className="text-gray-400">Níveis indisponíveis.</p>
                ) : (
                  vipLevels.map((level: any) => (
                    <div key={level.id} className="flex justify-between border-b border-white/5 pb-2">
                      <span>{level.name}</span>
                      <span className="text-[#FFD700]">{level.pointsRequired} pts</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#16213E] border-white/10">
              <CardHeader>
                <CardTitle className="text-gray-300">Missões</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  const list = Array.isArray(missions)
                    ? missions
                    : [
                        ...((missions as any)?.daily || []),
                        ...((missions as any)?.weekly || []),
                      ];
                  if (!list.length) {
                    return <p className="text-gray-400">Nenhuma missão ativa.</p>;
                  }
                  return list.map((mission: any, idx: number) => (
                    <div key={mission.id || idx} className="border-b border-white/5 pb-2">
                      <p className="font-medium">{mission.title || mission.name}</p>
                      <p className="text-sm text-gray-400">{mission.description}</p>
                    </div>
                  ));
                })()}
              </CardContent>
            </Card>
          </div>
        </>
      )}
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
