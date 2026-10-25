import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_CASH_BALANCE = 1000000; // ₹10,00,000 (10 Lakhs)
const DEFAULT_HOLDINGS = [
  {
    symbol: 'RELIANCE.NS',
    name: 'Reliance Industries Ltd.',
    exchange: 'NSE',
    sector: 'Energy',
    quantity: 15,
    avgBuyPrice: 2820.5,
    totalInvested: 42307.5,
  },
  {
    symbol: 'TCS.NS',
    name: 'Tata Consultancy Services',
    exchange: 'NSE',
    sector: 'IT',
    quantity: 10,
    avgBuyPrice: 3850.0,
    totalInvested: 38500.0,
  },
];

const DEFAULT_TRANSACTIONS = [
  {
    id: 'tx-init-1',
    symbol: 'RELIANCE.NS',
    name: 'Reliance Industries Ltd.',
    type: 'BUY',
    quantity: 15,
    price: 2820.5,
    total: 42307.5,
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'COMPLETED',
  },
  {
    id: 'tx-init-2',
    symbol: 'TCS.NS',
    name: 'Tata Consultancy Services',
    type: 'BUY',
    quantity: 10,
    price: 3850.0,
    total: 38500.0,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: 'COMPLETED',
  },
];

/**
 * usePortfolioStore — Global Zustand store managing virtual cash, active equity holdings,
 * and historical trade executions.
 */
export const usePortfolioStore = create()(
  persist(
    (set, get) => ({
      balance: DEFAULT_CASH_BALANCE,
      holdings: DEFAULT_HOLDINGS,
      transactions: DEFAULT_TRANSACTIONS,

      // Set Cash Balance safely
      setBalance: (amount) => {
        const val = parseFloat(amount);
        if (isNaN(val) || val < 0) return;
        set({ balance: val });
      },

      // Add a holding (or increase quantity if already held)
      addHolding: ({ symbol, name, exchange = 'NSE', sector = 'General', quantity, avgBuyPrice }) => {
        const qty = parseInt(quantity, 10);
        const price = parseFloat(avgBuyPrice);

        if (!symbol || isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
          return { success: false, message: 'Invalid holding symbol, quantity, or price.' };
        }

        const cleanSymbol = symbol.trim().toUpperCase();
        const cost = qty * price;

        set((state) => {
          const existingIdx = state.holdings.findIndex(
            (h) => h.symbol.toUpperCase() === cleanSymbol
          );

          if (existingIdx >= 0) {
            const existing = state.holdings[existingIdx];
            const newQty = existing.quantity + qty;
            const newTotalInvested = existing.totalInvested + cost;
            const newAvgPrice = newTotalInvested / newQty;

            const updatedHoldings = [...state.holdings];
            updatedHoldings[existingIdx] = {
              ...existing,
              quantity: newQty,
              avgBuyPrice: newAvgPrice,
              totalInvested: newTotalInvested,
            };
            return { holdings: updatedHoldings };
          } else {
            return {
              holdings: [
                ...state.holdings,
                {
                  symbol: cleanSymbol,
                  name: name || cleanSymbol,
                  exchange,
                  sector,
                  quantity: qty,
                  avgBuyPrice: price,
                  totalInvested: cost,
                },
              ],
            };
          }
        });

        return { success: true };
      },

      // Update an existing holding (or remove if qty <= 0)
      updateHolding: (symbol, { quantity, avgBuyPrice }) => {
        if (!symbol) return { success: false, message: 'Stock symbol required.' };
        const cleanSymbol = symbol.trim().toUpperCase();
        const qty = parseInt(quantity, 10);
        const price = parseFloat(avgBuyPrice);

        if (isNaN(qty) || qty < 0) {
          return { success: false, message: 'Invalid quantity.' };
        }

        set((state) => {
          if (qty === 0) {
            // Remove holding if quantity zeroed
            return {
              holdings: state.holdings.filter((h) => h.symbol.toUpperCase() !== cleanSymbol),
            };
          }

          const existingIdx = state.holdings.findIndex(
            (h) => h.symbol.toUpperCase() === cleanSymbol
          );
          if (existingIdx < 0) return state;

          const existing = state.holdings[existingIdx];
          const newPrice = !isNaN(price) && price > 0 ? price : existing.avgBuyPrice;
          const updated = [...state.holdings];
          updated[existingIdx] = {
            ...existing,
            quantity: qty,
            avgBuyPrice: newPrice,
            totalInvested: qty * newPrice,
          };

          return { holdings: updated };
        });

        return { success: true };
      },

      // Remove a holding by symbol
      removeHolding: (symbol) => {
        if (!symbol) return;
        const cleanSymbol = symbol.trim().toUpperCase();
        set((state) => ({
          holdings: state.holdings.filter((h) => h.symbol.toUpperCase() !== cleanSymbol),
        }));
      },

      // Execute Buy Order (checks cash balance, creates tx, updates holding)
      buyStock: ({ symbol, name, exchange = 'NSE', sector = 'General' }, quantity, currentPrice) => {
        const qty = parseInt(quantity, 10);
        const price = parseFloat(currentPrice);

        if (!symbol || isNaN(qty) || qty <= 0) {
          return { success: false, message: 'Please enter a valid positive quantity.' };
        }
        if (isNaN(price) || price <= 0) {
          return { success: false, message: 'Invalid execution price.' };
        }

        const totalCost = qty * price;
        const currentBalance = get().balance;

        if (currentBalance < totalCost) {
          return {
            success: false,
            message: `Insufficient virtual cash. Required: ₹${totalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}, Available: ₹${currentBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}.`,
          };
        }

        const cleanSymbol = symbol.trim().toUpperCase();

        set((state) => {
          // Deduct cash
          const nextBalance = state.balance - totalCost;

          // Update holdings
          const existingIdx = state.holdings.findIndex(
            (h) => h.symbol.toUpperCase() === cleanSymbol
          );

          let updatedHoldings;
          if (existingIdx >= 0) {
            const existing = state.holdings[existingIdx];
            const newQty = existing.quantity + qty;
            const newTotalInvested = existing.totalInvested + totalCost;
            const newAvgPrice = newTotalInvested / newQty;

            updatedHoldings = [...state.holdings];
            updatedHoldings[existingIdx] = {
              ...existing,
              quantity: newQty,
              avgBuyPrice: newAvgPrice,
              totalInvested: newTotalInvested,
            };
          } else {
            updatedHoldings = [
              ...state.holdings,
              {
                symbol: cleanSymbol,
                name: name || cleanSymbol,
                exchange,
                sector,
                quantity: qty,
                avgBuyPrice: price,
                totalInvested: totalCost,
              },
            ];
          }

          // Append transaction log
          const newTx = {
            id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            symbol: cleanSymbol,
            name: name || cleanSymbol,
            type: 'BUY',
            quantity: qty,
            price,
            total: totalCost,
            timestamp: new Date().toISOString(),
            status: 'COMPLETED',
          };

          return {
            balance: nextBalance,
            holdings: updatedHoldings,
            transactions: [newTx, ...state.transactions],
          };
        });

        return {
          success: true,
          message: `Successfully purchased ${qty} shares of ${cleanSymbol} for ₹${totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
        };
      },

      // Execute Sell Order (checks shares, credits cash, computes PnL, logs tx)
      sellStock: ({ symbol, name }, quantity, currentPrice) => {
        const qty = parseInt(quantity, 10);
        const price = parseFloat(currentPrice);

        if (!symbol || isNaN(qty) || qty <= 0) {
          return { success: false, message: 'Please enter a valid positive quantity.' };
        }
        if (isNaN(price) || price <= 0) {
          return { success: false, message: 'Invalid execution price.' };
        }

        const cleanSymbol = symbol.trim().toUpperCase();
        const currentHoldings = get().holdings;
        const existingHolding = currentHoldings.find(
          (h) => h.symbol.toUpperCase() === cleanSymbol
        );

        if (!existingHolding || existingHolding.quantity < qty) {
          return {
            success: false,
            message: `Insufficient shares owned. You hold ${existingHolding ? existingHolding.quantity : 0} shares of ${cleanSymbol}.`,
          };
        }

        const totalProceeds = qty * price;
        const costBasis = qty * existingHolding.avgBuyPrice;
        const realizedPnL = totalProceeds - costBasis;

        set((state) => {
          const nextBalance = state.balance + totalProceeds;

          const updatedHoldings = state.holdings
            .map((h) => {
              if (h.symbol.toUpperCase() === cleanSymbol) {
                const remainingQty = h.quantity - qty;
                if (remainingQty <= 0) return null;
                return {
                  ...h,
                  quantity: remainingQty,
                  totalInvested: remainingQty * h.avgBuyPrice,
                };
              }
              return h;
            })
            .filter(Boolean);

          const newTx = {
            id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            symbol: cleanSymbol,
            name: name || existingHolding.name,
            type: 'SELL',
            quantity: qty,
            price,
            total: totalProceeds,
            realizedPnL,
            timestamp: new Date().toISOString(),
            status: 'COMPLETED',
          };

          return {
            balance: nextBalance,
            holdings: updatedHoldings,
            transactions: [newTx, ...state.transactions],
          };
        });

        return {
          success: true,
          realizedPnL,
          message: `Successfully sold ${qty} shares of ${cleanSymbol} for ₹${totalProceeds.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
        };
      },

      // Reset portfolio
      resetPortfolio: (newBalance = DEFAULT_CASH_BALANCE) => {
        set({
          balance: newBalance,
          holdings: [],
          transactions: [],
        });
      },

      // Specific lookup helper
      getHolding: (symbol) => {
        if (!symbol) return null;
        const clean = symbol.trim().toUpperCase();
        return get().holdings.find((h) => h.symbol.toUpperCase() === clean) || null;
      },
    }),
    {
      name: 'vitaldrop_portfolio_v2',
      // Safe data migration from legacy localStorage keys if present
      onRehydrateStorage: () => (state) => {
        if (typeof window === 'undefined') return;
        try {
          // If state is empty or at default, check if user had legacy keys
          const legacyCash = localStorage.getItem('vitaldrop_cash_balance');
          const legacyHoldings = localStorage.getItem('vitaldrop_portfolio_holdings');
          const legacyTxs = localStorage.getItem('vitaldrop_transactions');

          if (legacyCash && state) {
            const parsedCash = JSON.parse(legacyCash);
            if (typeof parsedCash === 'number' && parsedCash > 0) {
              state.setBalance(parsedCash);
            }
          }
          if (legacyHoldings && state && state.holdings.length === DEFAULT_HOLDINGS.length) {
            const parsedHoldings = JSON.parse(legacyHoldings);
            if (Array.isArray(parsedHoldings) && parsedHoldings.length > 0) {
              state.holdings = parsedHoldings;
            }
          }
          if (legacyTxs && state && state.transactions.length === DEFAULT_TRANSACTIONS.length) {
            const parsedTxs = JSON.parse(legacyTxs);
            if (Array.isArray(parsedTxs) && parsedTxs.length > 0) {
              state.transactions = parsedTxs;
            }
          }
        } catch {
          // Fall back gracefully if legacy parse fails
        }
      },
    }
  )
);

/* ─────────────────────────────────────────────────────────────
   DERIVED SELECTORS
   Pure functions operating on store state for optimal rendering
───────────────────────────────────────────────────────────── */

/** Calculates total capital currently tied up in holdings */
export const selectTotalInvested = (state) =>
  state.holdings.reduce((sum, item) => sum + item.quantity * item.avgBuyPrice, 0);

/** Total count of distinct stock positions held */
export const selectHoldingsCount = (state) => state.holdings.length;

/** Total sum of all shares owned across all positions */
export const selectTotalShares = (state) =>
  state.holdings.reduce((sum, item) => sum + item.quantity, 0);

/** Total net worth: cash balance + total capital invested */
export const selectPortfolioNetWorth = (state) =>
  state.balance + selectTotalInvested(state);

/**
 * Returns holdings with calculated portfolio allocation percentages
 * Allocation % = (holding totalInvested / sum of all totalInvested) * 100
 */
export const selectHoldingsWithAllocations = (state) => {
  const total = selectTotalInvested(state);
  return state.holdings.map((h) => ({
    ...h,
    allocationPercent: total > 0 ? ((h.totalInvested / total) * 100).toFixed(1) : '0.0',
  }));
};

/** Selector creator to lookup a holding by symbol */
export const selectHoldingBySymbol = (symbol) => (state) => {
  if (!symbol) return null;
  const clean = symbol.trim().toUpperCase();
  return state.holdings.find((h) => h.symbol.toUpperCase() === clean) || null;
};

/** Returns most recent transactions sorted newest first */
export const selectRecentTransactions = (limit = 10) => (state) =>
  [...state.transactions]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
