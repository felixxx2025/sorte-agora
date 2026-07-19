import { z } from 'zod';
import apiClient from './client';

export const PromoSchema = z.object({
  id: z.string(),
  slug: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  terms: z.string().optional(),
  bonusAmount: z.number().optional(),
  bonusPercent: z.number().optional(),
  minDeposit: z.number().optional(),
  maxBonus: z.number().optional(),
  wagerRequirement: z.number().optional(),
  href: z.string().optional(),
  imageUrl: z.string().optional(),
  sortOrder: z.number().default(0),
  active: z.boolean().default(true),
  endsAt: z.string().optional(),
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
  getByIdOrSlug: async (idOrSlug: string): Promise<Promo> => {
    const res = await apiClient.get<Promo>(`/promos/${idOrSlug}`);
    return res.data;
  },
  claim: async (idOrSlug: string): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>(`/promos/${idOrSlug}/claim`);
    return res.data;
  },
  create: async (data: CreatePromoInput): Promise<Promo> => {
    const res = await apiClient.post<Promo>('/admin/promos', data);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/promos/${id}`);
  },
};
