import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { casinoApi, type LaunchGameInput } from '@/lib/api';

export function useCasinoGames(category?: string) {
  return useQuery({
    queryKey: ['casino', 'games', category],
    queryFn: () => casinoApi.getGames(category),
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
