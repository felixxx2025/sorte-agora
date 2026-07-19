import apiClient from './client';

export interface VipLevel {
  id: string;
  name: string;
  level: number;
  pointsRequired: number;
  cashbackPercent: number;
  bonusAmount?: number;
}

export interface VipStatus {
  level: VipLevel;
  points: number;
  progress: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
}

export interface Missions {
  daily: Mission[];
  weekly: Mission[];
}

// API functions
export const vipApi = {
  async getStatus(): Promise<VipStatus> {
    const response = await apiClient.get('/vip/status');
    return response.data;
  },

  async getLevels(): Promise<VipLevel[]> {
    const response = await apiClient.get('/vip/levels');
    return response.data;
  },

  async getMissions(): Promise<Mission[] | Missions> {
    const response = await apiClient.get('/vip/missions');
    return response.data;
  },
};
