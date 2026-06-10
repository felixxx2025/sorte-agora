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
