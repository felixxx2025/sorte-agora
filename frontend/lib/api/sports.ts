import apiClient from './client';
import { z } from 'zod';

// Zod schemas
export const PlaceBetSchema = z.object({
  selectionId: z.string(),
  stake: z.number().min(1),
  userId: z.string(),
});

// Types
export type PlaceBetInput = z.infer<typeof PlaceBetSchema>;

export interface SportsEvent {
  id: string;
  name: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  isLive: boolean;
  status: string;
  markets?: SportsMarket[];
}

export interface SportsMarket {
  id: string;
  eventId: string;
  name: string;
  selections?: SportsSelection[];
}

export interface SportsSelection {
  id: string;
  marketId: string;
  name: string;
  odds: number;
}

export interface SportsBet {
  id: string;
  userId: string;
  eventId: string;
  selectionId: string;
  selection: SportsSelection;
  stake: number;
  odds: number;
  status: 'PENDING' | 'WON' | 'LOST' | 'CANCELLED';
  createdAt: string;
}

// API functions
export const sportsApi = {
  async getEvents(isLive?: boolean): Promise<SportsEvent[]> {
    const params = isLive !== undefined ? { isLive: String(isLive) } : {};
    const response = await apiClient.get('/sports/events', { params });
    return response.data;
  },

  async getEvent(id: string): Promise<SportsEvent> {
    const response = await apiClient.get(`/sports/events/${id}`);
    return response.data;
  },

  async placeBet(data: PlaceBetInput): Promise<SportsBet> {
    const response = await apiClient.post('/sports/bets', data);
    return response.data;
  },

  async getBets(): Promise<SportsBet[]> {
    const response = await apiClient.get('/sports/bets');
    return response.data;
  },
};
