import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sportsApi, type PlaceBetInput } from '@/lib/api';

export function useSportsEvents(isLive?: boolean) {
  return useQuery({
    queryKey: ['sports', 'events', isLive],
    queryFn: () => sportsApi.getEvents(isLive),
  });
}

export function useSportsEvent(id: string) {
  return useQuery({
    queryKey: ['sports', 'events', id],
    queryFn: () => sportsApi.getEvent(id),
    enabled: !!id,
  });
}

export function usePlaceBet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PlaceBetInput) => sportsApi.placeBet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['sports', 'bets'] });
    },
  });
}

export function useSportsBets() {
  return useQuery({
    queryKey: ['sports', 'bets'],
    queryFn: () => sportsApi.getBets(),
  });
}
