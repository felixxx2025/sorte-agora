import apiClient from './client';
import { z } from 'zod';

export const UpdateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
});

export const ResponsibleGamingSchema = z.object({
  depositLimitDaily: z.number().nullable().optional(),
  depositLimitWeekly: z.number().nullable().optional(),
  depositLimitMonthly: z.number().nullable().optional(),
  lossLimitDaily: z.number().nullable().optional(),
  lossLimitWeekly: z.number().nullable().optional(),
  lossLimitMonthly: z.number().nullable().optional(),
  sessionTimeLimitMinutes: z.number().nullable().optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type ResponsibleGamingInput = z.infer<typeof ResponsibleGamingSchema>;

export interface ResponsibleGamingLimits {
  depositLimitDaily?: number | null;
  depositLimitWeekly?: number | null;
  depositLimitMonthly?: number | null;
  lossLimitDaily?: number | null;
  lossLimitWeekly?: number | null;
  lossLimitMonthly?: number | null;
  sessionTimeLimitMinutes?: number | null;
}

export interface FavoriteGame {
  id?: string;
  gameId: string;
  createdAt?: string;
  game?: {
    id: string;
    name: string;
    category?: string;
    thumbnail?: string;
    rtp?: number;
  };
}

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
  depositLimitDaily?: number | null;
  depositLimitWeekly?: number | null;
  depositLimitMonthly?: number | null;
  lossLimitDaily?: number | null;
  lossLimitWeekly?: number | null;
  lossLimitMonthly?: number | null;
  sessionTimeLimitMinutes?: number | null;
}

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

  async getFavorites(): Promise<FavoriteGame[]> {
    const response = await apiClient.get('/users/favorites');
    const data = response.data;
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => ({
      id: item.id,
      gameId: item.gameId || item.game?.id,
      createdAt: item.createdAt,
      game: item.game,
    }));
  },

  async toggleFavorite(gameId: string): Promise<{ favorited: boolean }> {
    const response = await apiClient.post(`/users/favorites/${gameId}`);
    return response.data;
  },

  async getResponsibleGaming(): Promise<ResponsibleGamingLimits> {
    const profile = await this.getProfile();
    return {
      depositLimitDaily: profile.depositLimitDaily ?? null,
      depositLimitWeekly: profile.depositLimitWeekly ?? null,
      depositLimitMonthly: profile.depositLimitMonthly ?? null,
      lossLimitDaily: profile.lossLimitDaily ?? null,
      lossLimitWeekly: profile.lossLimitWeekly ?? null,
      lossLimitMonthly: profile.lossLimitMonthly ?? null,
      sessionTimeLimitMinutes: profile.sessionTimeLimitMinutes ?? null,
    };
  },

  async updateResponsibleGaming(
    data: ResponsibleGamingInput,
  ): Promise<ResponsibleGamingLimits> {
    const response = await apiClient.put('/users/responsible-gaming', data);
    return response.data;
  },
};
