import apiClient from './client';
import { z } from 'zod';

// Zod schemas
export const LaunchGameSchema = z.object({
  betAmount: z.number().min(1),
});

// Types
export type LaunchGameInput = z.infer<typeof LaunchGameSchema>;

export interface CasinoGame {
  id: string;
  provider: string;
  providerGameId: string;
  name: string;
  category: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  rtp?: number;
  volatility?: string;
  minBet: number;
  maxBet: number;
  isActive: boolean;
  isNew?: boolean;
  isHot?: boolean;
}

export interface JackpotGame {
  id: string;
  name: string;
  amount: number;
  currency: string;
  thumbnailUrl?: string;
}

export interface CasinoSession {
  id: string;
  userId: string;
  gameId: string;
  sessionToken: string;
  startedAt: string;
  endedAt?: string;
  totalBet: number;
  totalWin: number;
}

export interface LaunchGameResponse {
  gameUrl: string;
  sessionToken: string;
}

// API functions
export const casinoApi = {
  async getGames(category?: string, provider?: string): Promise<CasinoGame[]> {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (provider) params.provider = provider;
    const response = await apiClient.get('/casino/games', { params });
    return response.data;
  },

  async getGame(id: string): Promise<CasinoGame> {
    const response = await apiClient.get(`/casino/games/${id}`);
    return response.data;
  },

  async launchGame(id: string, data: LaunchGameInput): Promise<LaunchGameResponse> {
    const response = await apiClient.post(`/casino/games/${id}/launch`, data);
    return response.data;
  },

  async getSessions(): Promise<CasinoSession[]> {
    const response = await apiClient.get('/casino/sessions');
    return response.data;
  },

  async getJackpots(): Promise<JackpotGame[]> {
    const response = await apiClient.get('/casino/jackpots');
    const raw = Array.isArray(response.data) ? response.data : [];
    return raw.map((g: any) => ({
      id: g.id,
      name: g.name,
      amount: Number(g.amount ?? g.jackpotAmount ?? 0),
      currency: g.currency || 'BRL',
      thumbnailUrl: g.thumbnailUrl || g.thumbnail,
    }));
  },

  async launchDemo(id: string): Promise<LaunchGameResponse> {
    const response = await apiClient.post(`/casino/games/${id}/demo`);
    return response.data;
  },
};
