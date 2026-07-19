import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { crashApi, type PlaceCrashBetInput } from '../api/crash';

export function useCrashState(enabled = true) {
  return useQuery({
    queryKey: ['crash-state'],
    queryFn: crashApi.getState,
    refetchInterval: enabled ? 750 : false,
    staleTime: 0,
  });
}

export function usePlaceCrashBet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PlaceCrashBetInput) => crashApi.placeBet(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crash-state'] }),
  });
}

export function useCrashCashout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => crashApi.cashout(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crash-state'] }),
  });
}
