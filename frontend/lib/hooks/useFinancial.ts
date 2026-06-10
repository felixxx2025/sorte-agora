import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { financialApi, type DepositInput, type WithdrawInput } from '@/lib/api';

export function useBalance() {
  return useQuery({
    queryKey: ['financial', 'balance'],
    queryFn: () => financialApi.getBalance(),
  });
}

export function useDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DepositInput) => financialApi.deposit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['financial', 'transactions'] });
    },
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WithdrawInput) => financialApi.withdraw(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['financial', 'transactions'] });
    },
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ['financial', 'transactions'],
    queryFn: () => financialApi.getTransactions(),
  });
}
