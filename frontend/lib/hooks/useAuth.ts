import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, type LoginInput, type RegisterInput, type EnableMfaInput, type VerifyMfaInput, type ForgotPasswordInput, type ResetPasswordInput } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/authStore';

export function useLogin() {
  const queryClient = useQueryClient();
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (data) => {
      if (data.mfaRequired || !data.accessToken) {
        return;
      }
      setUser(data.user);
      setToken(data.accessToken);
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useCompleteMfaLogin() {
  const queryClient = useQueryClient();
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: { mfaToken: string; token: string }) =>
      authApi.completeMfaLogin(data),
    onSuccess: (data) => {
      if (!data.accessToken) return;
      setUser(data.user);
      setToken(data.accessToken);
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (data) => {
      if (!data.accessToken) return;
      setUser(data.user);
      setToken(data.accessToken);
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      queryClient.clear();
    },
  });
}

export function useProfile() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: () => authApi.getProfile(),
    enabled: isAuthenticated,
  });
}

export function useRefreshToken() {
  const queryClient = useQueryClient();
  const { setToken } = useAuthStore();

  return useMutation({
    mutationFn: () => authApi.refresh(),
    onSuccess: (data) => {
      setToken(data.accessToken);
      localStorage.setItem('accessToken', data.accessToken);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useGenerateMfaSecret() {
  return useMutation({
    mutationFn: () => authApi.generateMfaSecret(),
  });
}

export function useEnableMfa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EnableMfaInput) => authApi.enableMfa(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
    },
  });
}

export function useDisableMfa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyMfaInput) => authApi.disableMfa(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
    },
  });
}

export function useVerifyMfa() {
  return useMutation({
    mutationFn: (data: VerifyMfaInput) => authApi.verifyMfa(data),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordInput) => authApi.forgotPassword(data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordInput) => authApi.resetPassword(data),
  });
}
