import { create } from 'zustand';

interface WalletState {
  balance: number;
  bonusBalance: number;
  lockedBalance: number;
  currency: string;
  setBalance: (balance: number) => void;
  setBonusBalance: (bonusBalance: number) => void;
  setLockedBalance: (lockedBalance: number) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  bonusBalance: 0,
  lockedBalance: 0,
  currency: 'BRL',
  setBalance: (balance) => set({ balance }),
  setBonusBalance: (bonusBalance) => set({ bonusBalance }),
  setLockedBalance: (lockedBalance) => set({ lockedBalance }),
}));
