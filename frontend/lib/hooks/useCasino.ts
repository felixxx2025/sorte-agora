import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { casinoApi, type LaunchGameInput } from '@/lib/api';

export function useCasinoGames(category?: string, provider?: string) {
  return useQuery({
    queryKey: ['casino', 'games', category, provider],
    queryFn: () => casinoApi.getGames(category, provider),
  });
}

export function useCasinoGame(id: string) {
  return useQuery({
    queryKey: ['casino', 'games', id],
    queryFn: () => casinoApi.getGame(id),
    enabled: !!id,
  });
}

export function useLaunchGame() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LaunchGameInput }) => 
      casinoApi.launchGame(id, data),
  });
}

export function useCasinoSessions() {
  return useQuery({
    queryKey: ['casino', 'sessions'],
    queryFn: () => casinoApi.getSessions(),
  });
}

export function useJackpots() {
  return useQuery({
    queryKey: ['casino', 'jackpots'],
    queryFn: () => casinoApi.getJackpots(),
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}

export function useLaunchDemo() {
  return useMutation({
    mutationFn: (id: string) => casinoApi.launchDemo(id),
  });
}
