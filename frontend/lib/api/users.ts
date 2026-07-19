import apiClient from './client';
import { z } from 'zod';

// Zod schemas
export const UpdateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
});

// Types
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  currency?: string;
  isVerified?: boolean;
  isKycVerified?: boolean;
  mfaEnabled?: boolean;
  createdAt?: string;
}

// API functions
export const usersApi = {
  async getProfile(): Promise<User> {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  async updateProfile(data: UpdateUserInput): Promise<User> {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },

  async submitKyc(data: {
    documentType: string;
    documentNumber: string;
    documentFront: string;
    selfie: string;
  }) {
    const response = await apiClient.post('/users/kyc', data);
    return response.data;
  },

  async getKycStatus() {
    const response = await apiClient.get('/users/kyc');
    return response.data;
  },

  async exportMyData() {
    const response = await apiClient.get('/users/me/export');
    return response.data;
  },

  async deleteMyAccount() {
    const response = await apiClient.delete('/users/me');
    return response.data;
  },

  async selfExclude(days: number) {
    const response = await apiClient.post('/users/me/self-exclude', { days });
    return response.data;
  },
};
