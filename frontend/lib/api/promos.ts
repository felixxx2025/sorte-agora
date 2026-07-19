import { z } from 'zod';
import apiClient from './client';

export const PromoSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  href: z.string().optional(),
  imageUrl: z.string().optional(),
  sortOrder: z.number().default(0),
  active: z.boolean().default(true),
});

export const CreatePromoSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  href: z.string().optional(),
  imageUrl: z.string().optional(),
  sortOrder: z.number().default(0),
});

export type Promo = z.infer<typeof PromoSchema>;
export type CreatePromoInput = z.infer<typeof CreatePromoSchema>;

export const promosApi = {
  list: async (): Promise<Promo[]> => {
    const res = await apiClient.get<Promo[]>('/promos');
    return Array.isArray(res.data) ? res.data : [];
  },
  create: async (data: CreatePromoInput): Promise<Promo> => {
    const res = await apiClient.post<Promo>('/admin/promos', data);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/promos/${id}`);
  },
};
