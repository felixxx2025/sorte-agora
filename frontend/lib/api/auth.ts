import apiClient from './client';
import { z } from 'zod';

// Zod schemas for type safety
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  currency: z.enum(['BRL', 'USD', 'EUR']).optional(),
});

export const EnableMfaSchema = z.object({
  token: z.string(),
});

export const VerifyMfaSchema = z.object({
  token: z.string(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

// Types
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type EnableMfaInput = z.infer<typeof EnableMfaSchema>;
export type VerifyMfaInput = z.infer<typeof VerifyMfaSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    country?: string;
    currency?: string;
    isVerified?: boolean;
    isKycVerified?: boolean;
    mfaEnabled?: boolean;
    createdAt?: string;
  };
}

export interface MfaSecretResponse {
  secret: string;
  qrCode: string;
}

// API functions
export const authApi = {
  async login(data: LoginInput): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterInput): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  async getProfile(): Promise<AuthResponse['user']> {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  async refresh(): Promise<{ accessToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async generateMfaSecret(): Promise<MfaSecretResponse> {
    const response = await apiClient.post('/auth/mfa/generate');
    return response.data;
  },

  async enableMfa(data: EnableMfaInput): Promise<void> {
    await apiClient.post('/auth/mfa/enable', data);
  },

  async disableMfa(data: VerifyMfaInput): Promise<void> {
    await apiClient.post('/auth/mfa/disable', data);
  },

  async verifyMfa(data: VerifyMfaInput): Promise<{ valid: boolean }> {
    const response = await apiClient.post('/auth/mfa/verify', data);
    return response.data;
  },

  async forgotPassword(data: ForgotPasswordInput): Promise<{ message: string; resetToken?: string }> {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  },

  async resetPassword(data: ResetPasswordInput): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },
};
