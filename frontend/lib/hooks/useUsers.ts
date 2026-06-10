import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, type UpdateUserInput } from '@/lib/api';

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
