import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_WATCHLIST = [
  { symbol: 'RELIANCE.NS', shortName: 'Reliance Industries Ltd.', exchange: 'NSE', sector: 'Energy' },
  { symbol: 'TCS.NS', shortName: 'Tata Consultancy Services', exchange: 'NSE', sector: 'IT' },
  { symbol: 'HDFCBANK.NS', shortName: 'HDFC Bank Ltd.', exchange: 'NSE', sector: 'Banking' },
  { symbol: 'INFY.NS', shortName: 'Infosys Ltd.', exchange: 'NSE', sector: 'IT' },
  { symbol: 'ICICIBANK.NS', shortName: 'ICICI Bank Ltd.', exchange: 'NSE', sector: 'Banking' },
];

/**
 * useWatchlistStore — Global Zustand store managing watchlisted Indian stocks and starred favourites.
 */
export const useWatchlistStore = create()(
  persist(
    (set, get) => ({
      watchlist: DEFAULT_WATCHLIST,
      favourites: ['RELIANCE.NS', 'TCS.NS'],

      // Add single item (prevents duplicates)
      addItem: (item) => {
        if (!item || !item.symbol) return { success: false, message: 'Invalid stock data.' };
        const cleanSymbol = item.symbol.trim().toUpperCase();

        if (get().isInWatchlist(cleanSymbol)) {
          return { success: false, message: 'Stock is already in your watchlist.' };
        }

        const exchange = item.exchange || (cleanSymbol.endsWith('.BO') ? 'BSE' : 'NSE');
        const newItem = {
          symbol: cleanSymbol,
          shortName: item.shortName || item.name || cleanSymbol,
          exchange,
          sector: item.sector || 'General',
          addedAt: new Date().toISOString(),
        };

        set((state) => ({
          watchlist: [newItem, ...state.watchlist],
        }));

        return { success: true, message: `Added ${cleanSymbol} to watchlist.` };
      },

      // Add multiple items in one batch (skips existing duplicates)
      addBatch: (items) => {
        if (!Array.isArray(items)) return;
        set((state) => {
          const currentSymbols = new Set(state.watchlist.map((w) => w.symbol.toUpperCase()));
          const newEntries = [];

          items.forEach((item) => {
            if (item?.symbol) {
              const clean = item.symbol.trim().toUpperCase();
              if (!currentSymbols.has(clean)) {
                currentSymbols.add(clean);
                newEntries.push({
                  symbol: clean,
                  shortName: item.shortName || item.name || clean,
                  exchange: item.exchange || (clean.endsWith('.BO') ? 'BSE' : 'NSE'),
                  sector: item.sector || 'General',
                  addedAt: new Date().toISOString(),
                });
              }
            }
          });

          return { watchlist: [...newEntries, ...state.watchlist] };
        });
      },

      // Remove single item by symbol
      removeItem: (symbol) => {
        if (!symbol) return;
        const clean = symbol.trim().toUpperCase();

        set((state) => ({
          watchlist: state.watchlist.filter((w) => w.symbol.toUpperCase() !== clean),
          favourites: state.favourites.filter((f) => f.toUpperCase() !== clean),
        }));
      },

      // Toggle favourite flag
      toggleFavourite: (symbol) => {
        if (!symbol) return;
        const clean = symbol.trim().toUpperCase();

        set((state) => {
          const isFav = state.favourites.some((f) => f.toUpperCase() === clean);
          if (isFav) {
            return {
              favourites: state.favourites.filter((f) => f.toUpperCase() !== clean),
            };
          } else {
            return {
              favourites: [...state.favourites, clean],
            };
          }
        });
      },

      // Fast boolean existence checks
      isInWatchlist: (symbol) => {
        if (!symbol) return false;
        const clean = symbol.trim().toUpperCase();
        return get().watchlist.some((w) => w.symbol.toUpperCase() === clean);
      },

      isFavourite: (symbol) => {
        if (!symbol) return false;
        const clean = symbol.trim().toUpperCase();
        return get().favourites.some((f) => f.toUpperCase() === clean);
      },

      // Clear all
      clearWatchlist: () => {
        set({ watchlist: [], favourites: [] });
      },
    }),
    {
      name: 'vitaldrop_watchlist_v2',
      // Safe data migration from legacy store key if present
      onRehydrateStorage: () => (state) => {
        if (typeof window === 'undefined') return;
        try {
          const legacyStorage = localStorage.getItem('vitaldrop-india-v1');
          if (legacyStorage && state && state.watchlist.length === DEFAULT_WATCHLIST.length) {
            const parsed = JSON.parse(legacyStorage);
            if (Array.isArray(parsed?.state?.watchlist) && parsed.state.watchlist.length > 0) {
              state.watchlist = parsed.state.watchlist;
            }
          }
        } catch {
          // Fall back gracefully
        }
      },
    }
  )
);

/* ─────────────────────────────────────────────────────────────
   DERIVED SELECTORS
───────────────────────────────────────────────────────────── */

/** Total count of items on watchlist */
export const selectWatchlistCount = (state) => state.watchlist.length;

/** Total count of starred favourites */
export const selectFavouritesCount = (state) => state.favourites.length;

/** Filter watchlist by exchange ('NSE' | 'BSE' | 'ALL') */
export const selectWatchlistByExchange = (exchange) => (state) => {
  if (!exchange || exchange === 'ALL') return state.watchlist;
  return state.watchlist.filter((item) =>
    exchange === 'BSE' ? item.symbol.endsWith('.BO') : item.symbol.endsWith('.NS')
  );
};

/** Selector creator checking whether a specific symbol is watchlisted */
export const selectIsSymbolWatchlisted = (symbol) => (state) => {
  if (!symbol) return false;
  const clean = symbol.trim().toUpperCase();
  return state.watchlist.some((w) => w.symbol.toUpperCase() === clean);
};
