'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVipLevels, useVipMissions, useVipStatus } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/authStore';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VipPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { data: vipStatus, isLoading: statusLoading } = useVipStatus();
  const { data: vipLevels, isLoading: levelsLoading } = useVipLevels();
  const { data: missions, isLoading: missionsLoading } = useVipMissions();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const isLoading = statusLoading || levelsLoading || missionsLoading;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Programa VIP</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            {vipStatus && (
              <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-700 mb-8">
                <CardHeader>
                  <CardTitle className="text-white">Seu Status VIP</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-purple-300">Nível Atual</p>
                      <p className="text-2xl font-bold">{vipStatus.level?.name || 'Bronze'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-300">Pontos</p>
                      <p className="text-2xl font-bold">{vipStatus.points}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-300">Progresso</p>
                      <p className="text-2xl font-bold">{vipStatus.progress?.toFixed(1)}%</p>
                    </div>
                  </div>
                  {vipStatus.progress < 100 && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${vipStatus.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <h2 className="text-2xl font-bold mb-4">Níveis VIP</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {vipLevels?.map((level) => (
                <Card
                  key={level.id}
                  className={`bg-gray-800 border-gray-700 ${vipStatus?.level?.id === level.id ? 'border-purple-500 border-2' : ''
                    }`}
                >
                  <CardHeader>
                    <CardTitle className="text-gray-300">{level.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Nível: {level.level}</p>
                      <p className="text-sm text-gray-400">Pontos necessários: {level.pointsRequired}</p>
                      <p className="text-sm text-gray-400">Cashback: {level.cashbackPercent}%</p>
                      <p className="text-sm text-gray-400">Bônus: R$ {Number(level.bonusAmount).toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {missions && (
              <>
                <h2 className="text-2xl font-bold mb-4">Missões Diárias</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {missions.daily?.map((mission: any) => (
                    <Card key={mission.id} className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-gray-300">{mission.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-400 mb-2">{mission.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-400 font-bold">+{mission.reward} pts</span>
                          <span className="text-sm text-gray-400">
                            {mission.progress}/{mission.target}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${(mission.progress / mission.target) * 100}%` }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <h2 className="text-2xl font-bold mb-4">Missões Semanais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {missions.weekly?.map((mission: any) => (
                    <Card key={mission.id} className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-gray-300">{mission.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-400 mb-2">{mission.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-400 font-bold">+{mission.reward} pts</span>
                          <span className="text-sm text-gray-400">
                            {mission.progress}/{mission.target}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${(mission.progress / mission.target) * 100}%` }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
