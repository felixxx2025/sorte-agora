import { useQuery } from '@tanstack/react-query';
import { vipApi } from '@/lib/api';

export function useVipStatus() {
  return useQuery({
    queryKey: ['vip', 'status'],
    queryFn: () => vipApi.getStatus(),
  });
}

export function useVipLevels() {
  return useQuery({
    queryKey: ['vip', 'levels'],
    queryFn: () => vipApi.getLevels(),
  });
}

export function useVipMissions() {
  return useQuery({
    queryKey: ['vip', 'missions'],
    queryFn: () => vipApi.getMissions(),
  });
}
