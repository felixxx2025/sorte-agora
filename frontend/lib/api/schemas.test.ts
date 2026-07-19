import { describe, it, expect, beforeEach } from 'vitest';
import { PlaceBetSchema } from '@/lib/api/sports';
import { DepositSchema } from '@/lib/api/financial';

describe('API schemas', () => {
  it('PlaceBetSchema aceita stake e selectionId', () => {
    const parsed = PlaceBetSchema.parse({
      selectionId: 'sel_1',
      stake: 10,
    });
    expect(parsed.stake).toBe(10);
  });

  it('PlaceBetSchema rejeita stake < 1', () => {
    expect(() =>
      PlaceBetSchema.parse({ selectionId: 'x', stake: 0 }),
    ).toThrow();
  });

  it('DepositSchema exige amount >= 10', () => {
    expect(DepositSchema.parse({ amount: 10 }).amount).toBe(10);
    expect(() => DepositSchema.parse({ amount: 5 })).toThrow();
  });
});

describe('API URL normalize', () => {
  it('garante sufixo /api', () => {
    const normalize = (base: string) =>
      base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;
    expect(normalize('http://localhost:3001')).toBe('http://localhost:3001/api');
    expect(normalize('http://localhost:3001/api')).toBe('http://localhost:3001/api');
  });
});

describe('auth store helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persiste tokens no localStorage pattern', () => {
    localStorage.setItem('accessToken', 'abc');
    localStorage.setItem('refreshToken', 'xyz');
    expect(localStorage.getItem('accessToken')).toBe('abc');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});
