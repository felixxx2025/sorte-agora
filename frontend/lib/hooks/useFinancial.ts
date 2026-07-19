import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { financialApi, type DepositInput, type WithdrawInput } from '@/lib/api';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useEffect } from 'react';

export function useBalance() {
  const setFromApi = useWalletStore((s) => s.setFromApi);
  const query = useQuery({
    queryKey: ['financial', 'balance'],
    queryFn: () => financialApi.getBalance(),
  });

  useEffect(() => {
    if (query.data) {
      setFromApi(query.data);
    }
  }, [query.data, setFromApi]);

  return query;
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
