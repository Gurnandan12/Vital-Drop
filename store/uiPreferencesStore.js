import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * useUIPreferencesStore — Global Zustand store managing UI view modes, themes,
 * ticker selection, and market filters.
 */
export const useUIPreferencesStore = create()(
  persist(
    (set) => ({
      theme: 'dark',
      selectedSymbol: 'RELIANCE.NS',
      selectedName: 'Reliance Industries Ltd.',
      activeExchange: 'NSE',
      chartInterval: '1M',
      marketSectorFilter: 'All',
      marketCapTierFilter: 'All',
      sidebarCollapsed: false,

      // Theme controls
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme: theme === 'light' ? 'light' : 'dark' }),

      // Stock selection
      setSelectedStock: (symbol, name) => {
        if (!symbol) return;
        set({
          selectedSymbol: symbol.trim().toUpperCase(),
          selectedName: name ? name.trim() : symbol.trim().toUpperCase(),
        });
      },

      // Exchange preference (NSE / BSE)
      setActiveExchange: (exchange) => set({ activeExchange: exchange }),

      // Chart timeframe preference (e.g. '1D', '1W', '1M', '1Y')
      setChartInterval: (interval) => set({ chartInterval: interval }),

      // Market directory filters
      setMarketSectorFilter: (sector) => set({ marketSectorFilter: sector }),
      setMarketCapTierFilter: (tier) => set({ marketCapTierFilter: tier }),

      // Sidebar collapsed preference
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: Boolean(collapsed) }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'vitaldrop_ui_prefs_v2',
      onRehydrateStorage: () => (state) => {
        if (typeof window === 'undefined') return;
        try {
          // Read legacy theme if present
          const legacyStorage = localStorage.getItem('vitaldrop-india-v1');
          if (legacyStorage && state) {
            const parsed = JSON.parse(legacyStorage);
            if (parsed?.state?.theme) {
              state.theme = parsed.state.theme;
            }
          }
        } catch {
          // Fall back gracefully
        }
      },
    }
  )
);
