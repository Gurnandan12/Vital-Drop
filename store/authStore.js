import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      user: null,
      investorProfile: null,
      setUser: (user) => set({ user }),
      setInvestorProfile: (profile) => set({ investorProfile: profile }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'vitaldrop-auth',
    }
  )
);
