/**
 * Vital Drop Centralized Zustand Store Architecture
 * ─────────────────────────────────────────────────────────────
 * Domain-specific stores with derived selectors:
 * - portfolioStore: Cash balance, equity holdings, order executions, derived portfolio metrics
 * - watchlistStore: Watchlisted stocks, favourites, deduplication, exchange filters
 * - basketStore: Curated and custom investment baskets, target allocations, rebalancing
 * - uiPreferencesStore: Theme mode, active ticker selection, market filters, UI options
 * - authStore: User session, investor persona calibration
 */

export {
  usePortfolioStore,
  selectTotalInvested,
  selectHoldingsCount,
  selectTotalShares,
  selectPortfolioNetWorth,
  selectHoldingsWithAllocations,
  selectHoldingBySymbol,
  selectRecentTransactions,
} from './portfolioStore';

export {
  useWatchlistStore,
  selectWatchlistCount,
  selectFavouritesCount,
  selectWatchlistByExchange,
  selectIsSymbolWatchlisted,
} from './watchlistStore';

export {
  useBasketStore,
  PRESET_BASKETS,
  selectBasketItemCount,
  selectBasketTotalAllocation,
  selectIsBasketBalanced,
  selectBasketTotalAllocatedAmount,
  selectBasketRemainingFunds,
  selectBasketItemsWithAmounts,
} from './basketStore';

export { useUIPreferencesStore } from './uiPreferencesStore';

export { useAuthStore } from './authStore';

export { useStockStore } from './stockStore';

export { useSandboxStore } from './sandboxStore';

