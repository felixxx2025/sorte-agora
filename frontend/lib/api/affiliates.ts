import apiClient from './client';
import { z } from 'zod';

// Zod schemas
export const RegisterAffiliateSchema = z.object({
  commissionType: z.enum(['CPA', 'REVSHARE']),
  commissionRate: z.number().min(0).max(100),
});

// Types
export type RegisterAffiliateInput = z.infer<typeof RegisterAffiliateSchema>;

export interface Affiliate {
  id: string;
  userId: string;
  commissionType: string;
  commissionRate: number;
  trackingCode: string;
}

export interface AffiliateDashboard {
  totalReferrals: number;
  activeReferrals: number;
  totalCommission: number;
  pendingCommission: number;
  conversionRate: number;
}

export interface Commission {
  id: string;
  affiliateId: string;
  amount: number;
  status: 'PENDING' | 'PAID';
  period: string;
  createdAt: string;
}

// API functions
export const affiliatesApi = {
  async register(data: RegisterAffiliateInput): Promise<Affiliate> {
    const response = await apiClient.post('/affiliates/register', data);
    return response.data;
  },

  async getDashboard(): Promise<AffiliateDashboard> {
    const response = await apiClient.get('/affiliates/dashboard');
    return response.data;
  },

  async getCommissions(): Promise<Commission[]> {
    const response = await apiClient.get('/affiliates/commissions');
    return response.data;
  },
};
