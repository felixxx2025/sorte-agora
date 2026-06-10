import { z } from 'zod';
import apiClient from './client';

// Zod schemas
export const BanUserSchema = z.object({
  reason: z.string(),
  banDuration: z.number().optional(),
});

export const UpdateBonusSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['DEPOSIT', 'WELCOME', 'LOYALTY']),
  amount: z.number(),
  percentage: z.number().optional(),
  maxAmount: z.number().optional(),
  wagerMultiplier: z.number().optional(),
  validFrom: z.string(),
  validTo: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Types
export type BanUserInput = z.infer<typeof BanUserSchema>;
export type UpdateBonusInput = z.infer<typeof UpdateBonusSchema>;

export interface AdminDashboard {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  totalBets: number;
  pendingWithdrawals: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isVerified: boolean;
  isKycVerified: boolean;
  isBanned: boolean;
  balance: number;
  createdAt: string;
}

export interface AdminTransaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface Bonus {
  id: string;
  name: string;
  description?: string;
  type: string;
  amount: number;
  percentage?: number;
  maxAmount?: number;
  wagerMultiplier: number;
  validFrom: string;
  validTo?: string;
  isActive: boolean;
}

// API functions
export const adminApi = {
  async getDashboard(): Promise<AdminDashboard> {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },

  async getUsers(): Promise<AdminUser[]> {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  async banUser(id: string, data: BanUserInput): Promise<void> {
    await apiClient.put(`/admin/users/${id}/ban`, data);
  },

  async unbanUser(id: string): Promise<void> {
    await apiClient.put(`/admin/users/${id}/unban`);
  },

  async getTransactions(): Promise<AdminTransaction[]> {
    const response = await apiClient.get('/admin/financial/transactions');
    return response.data;
  },

  async getPendingWithdrawals(): Promise<AdminTransaction[]> {
    const response = await apiClient.get('/admin/financial/withdrawals');
    return response.data;
  },

  async approveWithdrawal(id: string): Promise<void> {
    await apiClient.put(`/admin/financial/withdrawals/${id}/approve`);
  },

  async rejectWithdrawal(id: string): Promise<void> {
    await apiClient.put(`/admin/financial/withdrawals/${id}/reject`);
  },

  async getReports(): Promise<any> {
    const response = await apiClient.get('/admin/reports');
    return response.data;
  },

  async createBonus(data: Partial<Bonus>): Promise<Bonus> {
    const response = await apiClient.post('/admin/bonuses', data);
    return response.data;
  },

  async updateBonus(id: string, data: UpdateBonusInput): Promise<Bonus> {
    const response = await apiClient.put(`/admin/bonuses/${id}`, data);
    return response.data;
  },

  async deleteBonus(id: string): Promise<void> {
    await apiClient.delete(`/admin/bonuses/${id}`);
  },
};
