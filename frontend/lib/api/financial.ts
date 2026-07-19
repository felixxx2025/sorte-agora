import apiClient from './client';
import { z } from 'zod';

// Zod schemas
export const DepositSchema = z.object({
  amount: z.number().min(10),
  pixKey: z.string().optional(),
});

export const WithdrawSchema = z.object({
  amount: z.number().min(20),
  pixKey: z.string(),
});

// Types
export type DepositInput = z.infer<typeof DepositSchema>;
export type WithdrawInput = z.infer<typeof WithdrawSchema>;

export interface Account {
  id: string;
  userId: string;
  balance: number;
  bonusBalance: number;
  lockedBalance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'BET' | 'WIN' | 'BONUS';
  amount: number;
  method?: string;
  pixKey?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  processedAt?: string;
  createdAt: string;
}

// API functions
export const financialApi = {
  async getBalance(): Promise<Account> {
    const response = await apiClient.get('/financial/balance');
    return response.data;
  },

  async deposit(data: DepositInput): Promise<any> {
    const response = await apiClient.post('/financial/deposit', data);
    return response.data;
  },

  async getDepositStatus(id: string): Promise<any> {
    const response = await apiClient.get(`/financial/deposit/${id}`);
    return response.data;
  },

  async confirmDeposit(id: string): Promise<any> {
    const response = await apiClient.post(`/financial/deposit/${id}/confirm`);
    return response.data;
  },

  async withdraw(data: WithdrawInput): Promise<Transaction> {
    const response = await apiClient.post('/financial/withdraw', data);
    return response.data;
  },

  async getTransactions(): Promise<Transaction[]> {
    const response = await apiClient.get('/financial/transactions');
    return response.data;
  },
};
