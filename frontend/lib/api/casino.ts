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
  thumbnail: string;
  rtp?: number;
  minBet: number;
  maxBet: number;
  isActive: boolean;
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
  async getGames(category?: string): Promise<CasinoGame[]> {
    const params = category ? { category } : {};
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
};
