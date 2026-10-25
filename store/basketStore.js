import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const PRESET_BASKETS = {
  bluechip: {
    name: 'Nifty Bluechip Titans',
    budget: 100000,
    description: 'High-conviction core large-cap Indian companies with resilient balance sheets.',
    items: [
      { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd.', exchange: 'NSE', sector: 'Energy', price: 2950, allocationPercent: 30 },
      { symbol: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE', sector: 'IT', price: 3820, allocationPercent: 25 },
      { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd.', exchange: 'NSE', sector: 'Banking', price: 1680, allocationPercent: 25 },
      { symbol: 'INFY.NS', name: 'Infosys Ltd.', exchange: 'NSE', sector: 'IT', price: 1740, allocationPercent: 20 },
    ],
  },
  tech: {
    name: 'India Tech & Digital Alpha',
    budget: 150000,
    description: 'Leading IT consulting, software exports, and digital transformation heavyweights.',
    items: [
      { symbol: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE', sector: 'IT', price: 3820, allocationPercent: 35 },
      { symbol: 'INFY.NS', name: 'Infosys Ltd.', exchange: 'NSE', sector: 'IT', price: 1740, allocationPercent: 35 },
      { symbol: 'WIPRO.NS', name: 'Wipro Ltd.', exchange: 'NSE', sector: 'IT', price: 490, allocationPercent: 30 },
    ],
  },
  greenEnergy: {
    name: 'Green Energy & Sustainability',
    budget: 120000,
    description: 'Power generation, renewable expansion, and clean infrastructure pioneers.',
    items: [
      { symbol: 'TATAPOWER.NS', name: 'Tata Power Company Ltd.', exchange: 'NSE', sector: 'Energy', price: 410, allocationPercent: 40 },
      { symbol: 'NTPC.NS', name: 'NTPC Ltd.', exchange: 'NSE', sector: 'Energy', price: 395, allocationPercent: 35 },
      { symbol: 'ADANIGREEN.NS', name: 'Adani Green Energy Ltd.', exchange: 'NSE', sector: 'Energy', price: 1780, allocationPercent: 25 },
    ],
  },
  dividend: {
    name: 'High Dividend Aristocrats',
    budget: 100000,
    description: 'Cash-flow generative enterprises with dependable historical dividend yields.',
    items: [
      { symbol: 'ITC.NS', name: 'ITC Ltd.', exchange: 'NSE', sector: 'FMCG', price: 485, allocationPercent: 35 },
      { symbol: 'COALINDIA.NS', name: 'Coal India Ltd.', exchange: 'NSE', sector: 'Energy', price: 490, allocationPercent: 35 },
      { symbol: 'VEDL.NS', name: 'Vedanta Ltd.', exchange: 'NSE', sector: 'Metal', price: 470, allocationPercent: 30 },
    ],
  },
};

/**
 * useBasketStore — Global Zustand store managing custom investment baskets,
 * target budget allocations, and portfolio rebalancing.
 */
export const useBasketStore = create()(
  persist(
    (set, get) => ({
      basketName: 'My Diversified Core Basket',
      totalBudget: 100000, // ₹1,00,000 default budget
      items: PRESET_BASKETS.bluechip.items,

      // Set target budget
      setTotalBudget: (amount) => {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
          return { success: false, message: 'Budget must be a positive number.' };
        }
        set({ totalBudget: Math.round(val) });
        return { success: true };
      },

      // Set basket name
      setBasketName: (name) => {
        if (!name || !name.trim()) return;
        set({ basketName: name.trim() });
      },

      // Check whether symbol is in basket
      isInBasket: (symbol) => {
        if (!symbol) return false;
        const clean = symbol.trim().toUpperCase();
        return get().items.some((i) => i.symbol.toUpperCase() === clean);
      },

      // Add stock to basket (prevents duplicates)
      addItem: (item, allocationPercent = null) => {
        if (!item || !item.symbol) return { success: false, message: 'Invalid asset data.' };
        const cleanSymbol = item.symbol.trim().toUpperCase();

        if (get().isInBasket(cleanSymbol)) {
          return { success: false, message: `${cleanSymbol} is already in the investment basket.` };
        }

        // Determine sensible default allocation: remaining budget up to 25%, min 5%
        let alloc = allocationPercent !== null ? parseFloat(allocationPercent) : null;
        if (alloc === null || isNaN(alloc) || alloc <= 0) {
          const currentTotal = get().items.reduce((s, i) => s + (parseFloat(i.allocationPercent) || 0), 0);
          const remaining = Math.max(0, 100 - currentTotal);
          alloc = remaining > 5 ? Math.min(25, remaining) : 10;
        } else {
          alloc = Math.max(0, Math.min(alloc, 100));
        }

        const newItem = {
          symbol: cleanSymbol,
          name: item.name || item.shortName || cleanSymbol,
          exchange: item.exchange || (cleanSymbol.endsWith('.BO') ? 'BSE' : 'NSE'),
          sector: item.sector || item.category || 'General',
          price: parseFloat(item.price || item.currentPrice || 1000),
          allocationPercent: parseFloat(alloc.toFixed(2)),
          addedAt: new Date().toISOString(),
        };

        set((state) => ({
          items: [...state.items, newItem],
        }));

        return { success: true, message: `Added ${cleanSymbol} to investment basket with ${alloc}% target weight.` };
      },

      // Remove stock from basket
      removeItem: (symbol) => {
        if (!symbol) return;
        const clean = symbol.trim().toUpperCase();
        set((state) => ({
          items: state.items.filter((i) => i.symbol.toUpperCase() !== clean),
        }));
        return { success: true, message: `Removed ${clean} from basket.` };
      },

      // Update allocation percentage of an item
      updateAllocation: (symbol, percent) => {
        if (!symbol) return;
        const clean = symbol.trim().toUpperCase();
        const raw = parseFloat(percent);
        const alloc = isNaN(raw) ? 0 : Math.max(0, Math.min(raw, 100));

        set((state) => ({
          items: state.items.map((i) =>
            i.symbol.toUpperCase() === clean
              ? { ...i, allocationPercent: parseFloat(alloc.toFixed(2)) }
              : i
          ),
        }));
      },

      // Update item target Rupee amount directly, deriving new allocation percent
      updateAmount: (symbol, amount) => {
        if (!symbol) return;
        const clean = symbol.trim().toUpperCase();
        const amt = parseFloat(amount);
        const budget = get().totalBudget;

        if (isNaN(amt) || amt < 0 || budget <= 0) return;
        const derivedAlloc = Math.max(0, Math.min(parseFloat(((amt / budget) * 100).toFixed(2)), 100));

        set((state) => ({
          items: state.items.map((i) =>
            i.symbol.toUpperCase() === clean
              ? { ...i, allocationPercent: derivedAlloc }
              : i
          ),
        }));
      },

      // Rebalance all items evenly so sum equals exactly 100%
      rebalanceEvenly: () => {
        set((state) => {
          const count = state.items.length;
          if (count === 0) return state;

          const evenShare = parseFloat((100 / count).toFixed(2));
          const updated = state.items.map((item, idx) => ({
            ...item,
            // Absorb any decimal rounding difference into the last constituent
            allocationPercent:
              idx === count - 1
                ? parseFloat((100 - evenShare * (count - 1)).toFixed(2))
                : evenShare,
          }));

          return { items: updated };
        });
      },

      // Load curated preset basket
      loadPresetBasket: (presetKey) => {
        const preset = PRESET_BASKETS[presetKey];
        if (!preset) return { success: false, message: 'Preset not found.' };
        set({
          basketName: preset.name,
          totalBudget: preset.budget,
          items: preset.items.map((item) => ({ ...item })),
        });
        return { success: true, message: `Loaded ${preset.name} preset.` };
      },

      // Clear all basket items
      clearBasket: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'vitaldrop_basket_v2',
    }
  )
);

/* ─────────────────────────────────────────────────────────────
   DERIVED SELECTORS
   Pure functions returning primitive values or memoizable shapes
───────────────────────────────────────────────────────────── */

/** Total count of items in the basket */
export const selectBasketItemCount = (state) => state.items.length;

/** Sum of all allocation percentages (ideal target: 100%) */
export const selectBasketTotalAllocation = (state) =>
  parseFloat(
    state.items
      .reduce((sum, item) => sum + (parseFloat(item.allocationPercent) || 0), 0)
      .toFixed(2)
  );

/** Checks whether total allocation equals 100% (tolerance within 0.1%) */
export const selectIsBasketBalanced = (state) => {
  const total = selectBasketTotalAllocation(state);
  return Math.abs(total - 100) < 0.1;
};

/** Total calculated Rupee amount planned based on allocations */
export const selectBasketTotalAllocatedAmount = (state) => {
  const totalAlloc = selectBasketTotalAllocation(state);
  return Math.round((totalAlloc / 100) * (state.totalBudget || 0));
};

/** Remaining unallocated budget in Rupees */
export const selectBasketRemainingFunds = (state) => {
  const allocated = selectBasketTotalAllocatedAmount(state);
  return Math.max(0, (state.totalBudget || 0) - allocated);
};

/**
 * Returns basket items augmented with target Rupee amounts and estimated share units
 * targetAmount = (allocationPercent / 100) * totalBudget
 * units = Math.floor(targetAmount / price)
 */
export const selectBasketItemsWithAmounts = ({ items, totalBudget }) => {
  const budget = totalBudget || 0;
  return (items || []).map((item) => {
    const alloc = parseFloat(item.allocationPercent) || 0;
    const targetAmount = Math.round((alloc / 100) * budget);
    const unitPrice = parseFloat(item.price) || 1000;
    const estimatedUnits = unitPrice > 0 ? Math.floor(targetAmount / unitPrice) : 0;

    return {
      ...item,
      targetAmount,
      estimatedUnits,
      unitPrice,
    };
  });
};
