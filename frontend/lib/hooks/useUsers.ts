import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, type UpdateUserInput, type ResponsibleGamingInput } from '@/lib/api';

export function useUserProfile() {
  return useQuery({
    queryKey: ['users', 'profile'],
    queryFn: () => usersApi.getProfile(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserInput) => usersApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
    },
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ['users', 'favorites'],
    queryFn: () => usersApi.getFavorites(),
    staleTime: 30_000,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gameId: string) => usersApi.toggleFavorite(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'favorites'] });
    },
  });
}

export function useResponsibleGaming() {
  return useQuery({
    queryKey: ['users', 'responsible-gaming'],
    queryFn: () => usersApi.getResponsibleGaming(),
  });
}

export function useUpdateResponsibleGaming() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ResponsibleGamingInput) => usersApi.updateResponsibleGaming(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'responsible-gaming'] });
    },
  });
}
