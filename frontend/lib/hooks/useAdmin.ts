import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, type BanUserInput, type UpdateBonusInput } from '@/lib/api';

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getDashboard(),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.getUsers(),
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BanUserInput }) => 
      adminApi.banUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.unbanUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useAdminTransactions() {
  return useQuery({
    queryKey: ['admin', 'transactions'],
    queryFn: () => adminApi.getTransactions(),
  });
}

export function usePendingWithdrawals() {
  return useQuery({
    queryKey: ['admin', 'withdrawals'],
    queryFn: () => adminApi.getPendingWithdrawals(),
  });
}

export function useApproveWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.approveWithdrawal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions'] });
    },
  });
}

export function useRejectWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.rejectWithdrawal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions'] });
    },
  });
}

export function useAdminReports() {
  return useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: () => adminApi.getReports(),
  });
}

export function usePendingSportsBets() {
  return useQuery({
    queryKey: ['admin', 'sports', 'pending'],
    queryFn: () => adminApi.getPendingSportsBets(),
  });
}

export function useSettleSportsBet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, result }: { id: string; result: 'WON' | 'LOST' }) =>
      adminApi.settleSportsBet(id, result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sports', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useAdminBonuses() {
  return useQuery({
    queryKey: ['admin', 'bonuses'],
    queryFn: () => adminApi.getBonuses(),
  });
}

export function useCreateBonus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => adminApi.createBonus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bonuses'] });
    },
  });
}

export function useUpdateBonus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBonusInput }) => 
      adminApi.updateBonus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bonuses'] });
    },
  });
}

export function useDeleteBonus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteBonus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bonuses'] });
    },
  });
}

export function useAssignBonus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      adminApi.assignBonus(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bonuses'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useSettleAffiliateCommissions() {
  return useMutation({
    mutationFn: (affiliateId?: string) =>
      adminApi.settleAffiliateCommissions(affiliateId),
  });
}
