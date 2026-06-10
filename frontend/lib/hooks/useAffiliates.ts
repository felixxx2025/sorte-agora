import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { affiliatesApi, type RegisterAffiliateInput } from '@/lib/api';

export function useAffiliateDashboard() {
  return useQuery({
    queryKey: ['affiliates', 'dashboard'],
    queryFn: () => affiliatesApi.getDashboard(),
  });
}

export function useAffiliateCommissions() {
  return useQuery({
    queryKey: ['affiliates', 'commissions'],
    queryFn: () => affiliatesApi.getCommissions(),
  });
}

export function useRegisterAffiliate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterAffiliateInput) => affiliatesApi.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliates'] });
    },
  });
}
