import React, { useMemo } from 'react';
import {
  usePortfolioStore,
  selectTotalInvested,
  selectHoldingsCount,
  selectTotalShares,
} from '@/store/portfolioStore';

/**
 * usePortfolio — Unified domain hook delegating to centralized Zustand portfolioStore.
 * Provides backwards-compatible API for existing components while delivering
 * real-time reactivity and derived selector calculations across the entire application.
 */
export function usePortfolio() {
  const balance = usePortfolioStore((s) => s.balance);
  const holdings = usePortfolioStore((s) => s.holdings);
  const transactions = usePortfolioStore((s) => s.transactions);

  const setBalance = usePortfolioStore((s) => s.setBalance);
  const addHolding = usePortfolioStore((s) => s.addHolding);
  const updateHolding = usePortfolioStore((s) => s.updateHolding);
  const removeHolding = usePortfolioStore((s) => s.removeHolding);
  const buyStock = usePortfolioStore((s) => s.buyStock);
  const sellStock = usePortfolioStore((s) => s.sellStock);
  const resetPortfolio = usePortfolioStore((s) => s.resetPortfolio);
  const getHolding = usePortfolioStore((s) => s.getHolding);

  // Derived metrics computed via pure selectors (primitive numbers)
  const totalInvested = usePortfolioStore(selectTotalInvested);
  const holdingsCount = usePortfolioStore(selectHoldingsCount);
  const totalShares = usePortfolioStore(selectTotalShares);

  // Memoize recent transactions slice to guarantee referential stability
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  }, [transactions]);

  return {
    balance,
    holdings,
    transactions,
    totalInvested,
    holdingsCount,
    totalShares,
    recentTransactions,
    getHolding,
    addHolding,
    updateHolding,
    removeHolding,
    buyStock,
    sellStock,
    resetPortfolio,
    setBalance,
  };
}

export default usePortfolio;
