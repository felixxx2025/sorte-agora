import { z } from 'zod';
import apiClient from './client';

export const CrashStateSchema = z.object({
  status: z.enum(['waiting', 'running', 'crashed']),
  multiplier: z.number(),
  crashedAt: z.number().nullable().optional(),
  roundId: z.string().optional(),
});

export const PlaceCrashBetSchema = z.object({
  amount: z.number().min(1),
  autoCashout: z.number().nullable().optional(),
});

export type CrashState = z.infer<typeof CrashStateSchema>;
export type PlaceCrashBetInput = z.infer<typeof PlaceCrashBetSchema>;

export type CrashBetResult = {
  id: string;
  amount: number;
  status: string;
  cashoutMultiplier?: number;
  profit?: number;
};

export const crashApi = {
  getState: async (): Promise<CrashState> => {
    const res = await apiClient.get<CrashState>('/crash/state');
    return res.data;
  },
  placeBet: async (data: PlaceCrashBetInput): Promise<CrashBetResult> => {
    const res = await apiClient.post<CrashBetResult>('/crash/bet', data);
    return res.data;
  },
  cashout: async (): Promise<CrashBetResult> => {
    const res = await apiClient.post<CrashBetResult>('/crash/cashout', {});
    return res.data;
  },
};
