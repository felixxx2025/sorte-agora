import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { promosApi, type CreatePromoInput } from '../api/promos';

export function usePromos() {
  return useQuery({ queryKey: ['promos'], queryFn: promosApi.list, staleTime: 60_000 });
}

export function usePromoDetail(idOrSlug: string) {
  return useQuery({
    queryKey: ['promos', idOrSlug],
    queryFn: () => promosApi.getByIdOrSlug(idOrSlug),
    enabled: !!idOrSlug,
    staleTime: 60_000,
  });
}

export function useClaimPromo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idOrSlug: string) => promosApi.claim(idOrSlug),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promos'] }),
  });
}

export function useCreatePromo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePromoInput) => promosApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promos'] }),
  });
}

export function useDeletePromo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => promosApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promos'] }),
  });
}
