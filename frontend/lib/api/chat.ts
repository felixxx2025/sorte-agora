import apiClient from './client';

export type ChatMessage = {
  id: string;
  room: string;
  body: string;
  createdAt: string;
  user?: { name?: string; email?: string };
};

export const chatApi = {
  getMessages: async (room: string, limit = 40): Promise<ChatMessage[]> => {
    const res = await apiClient.get<ChatMessage[]>(
      `/chat/messages?room=${room}&limit=${limit}`,
    );
    return Array.isArray(res.data) ? res.data : [];
  },
  sendMessage: async (room: string, body: string): Promise<ChatMessage> => {
    const res = await apiClient.post<ChatMessage>('/chat/messages', { room, body });
    return res.data;
  },
};
