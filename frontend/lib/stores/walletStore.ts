import { create } from 'zustand';

interface WalletState {
  balance: number;
  bonusBalance: number;
  lockedBalance: number;
  currency: string;
  setFromApi: (data: {
    balance: number | string;
    bonusBalance?: number | string;
    lockedBalance?: number | string;
    currency?: string;
  }) => void;
  setBalance: (balance: number) => void;
  setBonusBalance: (bonusBalance: number) => void;
  setLockedBalance: (lockedBalance: number) => void;
  reset: () => void;
}

const initial = {
  balance: 0,
  bonusBalance: 0,
  lockedBalance: 0,
  currency: 'BRL',
};

export const useWalletStore = create<WalletState>((set) => ({
  ...initial,
  setFromApi: (data) =>
    set({
      balance: Number(data.balance) || 0,
      bonusBalance: Number(data.bonusBalance) || 0,
      lockedBalance: Number(data.lockedBalance) || 0,
      currency: data.currency || 'BRL',
    }),
  setBalance: (balance) => set({ balance }),
  setBonusBalance: (bonusBalance) => set({ bonusBalance }),
  setLockedBalance: (lockedBalance) => set({ lockedBalance }),
  reset: () => set(initial),
}));
