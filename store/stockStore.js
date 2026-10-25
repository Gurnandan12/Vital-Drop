import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useWatchlistStore } from './watchlistStore';
import { useUIPreferencesStore } from './uiPreferencesStore';

/**
 * useStockStore — Facade store maintaining backwards compatibility while delegating
 * to domain-specific watchlistStore and uiPreferencesStore.
 */
export const useStockStore = create()(
  persist(
    (set, get) => ({
      selectedSymbol: 'RELIANCE.NS',
      selectedName: 'Reliance Industries Ltd.',
      watchlist: [
        { symbol: 'RELIANCE.NS', shortName: 'Reliance Industries' },
        { symbol: 'TCS.NS', shortName: 'Tata Consultancy Services' },
        { symbol: 'HDFCBANK.NS', shortName: 'HDFC Bank' },
        { symbol: 'INFY.NS', shortName: 'Infosys' },
        { symbol: 'ICICIBANK.NS', shortName: 'ICICI Bank' },
      ],
      theme: 'dark',

      setSelectedStock: (symbol, name) => {
        if (!symbol) return;
        const clean = symbol.trim().toUpperCase();
        const stockName = name ? name.trim() : clean;
        set({ selectedSymbol: clean, selectedName: stockName });
        useUIPreferencesStore.getState().setSelectedStock(clean, stockName);
      },

      addToWatchlist: (item) => {
        if (!item || !item.symbol) return;
        const res = useWatchlistStore.getState().addItem(item);
        set({ watchlist: useWatchlistStore.getState().watchlist });
        return res;
      },

      removeFromWatchlist: (symbol) => {
        useWatchlistStore.getState().removeItem(symbol);
        set({ watchlist: useWatchlistStore.getState().watchlist });
      },

      isInWatchlist: (symbol) => useWatchlistStore.getState().isInWatchlist(symbol),

      toggleTheme: () => {
        useUIPreferencesStore.getState().toggleTheme();
        const nextTheme = useUIPreferencesStore.getState().theme;
        set({ theme: nextTheme });
      },

      setTheme: (t) => {
        useUIPreferencesStore.getState().setTheme(t);
        set({ theme: t });
      },
    }),
    {
      name: 'vitaldrop-india-v1',
      partialize: (state) => ({ watchlist: state.watchlist, theme: state.theme }),
    }
  )
);

// Keep facade store in sync with domain stores
if (typeof window !== 'undefined') {
  useWatchlistStore.subscribe((state) => {
    useStockStore.setState({ watchlist: state.watchlist });
  });
  useUIPreferencesStore.subscribe((state) => {
    useStockStore.setState({
      theme: state.theme,
      selectedSymbol: state.selectedSymbol,
      selectedName: state.selectedName,
    });
  });
}

export default useStockStore;

