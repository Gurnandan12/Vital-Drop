'use client';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Briefcase,
  Star,
  LineChart,
  ShieldCheck,
  Zap,
  Percent,
  Layers,
} from 'lucide-react';
import { PageHeader } from '../layout/PageHeader';
import { InvestmentBasket } from '../basket/InvestmentBasket';
import { useStockStore } from '@/store/stockStore';
import { useBasketStore, selectBasketItemCount, selectBasketTotalAllocation, selectIsBasketBalanced } from '@/store/basketStore';
import { usePortfolio } from '@/hooks/usePortfolio';

/**
 * BasketPage — Thematic Multi-Stock Investment Basket Page (/basket)
 *
 * Demonstrates:
 * - Dedicated Zustand basket store consumption (useBasketStore)
 * - Derived selectors for allocation totals, item counts, balance status
 * - Cross-store integration: 1-click execution into Virtual Portfolio
 * - Local form/modal state isolated from global basket state
 * - Theme-reactive UI styling
 */
export function BasketPage() {
  const { theme } = useStockStore();
  const isDark = theme === 'dark';

  const count = useBasketStore(selectBasketItemCount);
  const totalAllocation = useBasketStore(selectBasketTotalAllocation);
  const isBalanced = useBasketStore(selectIsBasketBalanced);
  const totalBudget = useBasketStore((s) => s.totalBudget);
  const { balance } = usePortfolio();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <PageHeader
        title="Investment Baskets & Thematic Portfolios"
        description="Construct custom multi-stock thematic baskets, allocate percentage targets, auto-calculate share quantities, and execute 1-click bulk portfolio investments."
        badge="Smart Rebalancer"
        badgeVariant="primary"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Investment Basket' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/portfolio"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isDark
                  ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white'
                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span>View Portfolio</span>
            </Link>
            <Link
              to="/watchlist"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isDark
                  ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white'
                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-800'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Watchlist</span>
            </Link>
          </div>
        }
      />

      {/* Feature Highlights Banner */}
      <div
        className={`p-4 rounded-2xl border grid grid-cols-1 md:grid-cols-3 gap-4 text-xs ${
          isDark
            ? 'bg-gradient-to-r from-indigo-950/30 via-purple-950/20 to-transparent border-indigo-500/20 text-gray-300'
            : 'bg-gradient-to-r from-indigo-50 via-purple-50 to-transparent border-indigo-100 text-gray-700'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-gray-900 dark:text-white">Percentage Weighting</div>
            <p className="mt-0.5 text-gray-500">
              Target exact percentage allocations summing to 100%. Use 1-click Equal Weighting anytime.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-gray-900 dark:text-white">Dynamic Budget Allocation</div>
            <p className="mt-0.5 text-gray-500">
              Set any total rupee budget (e.g. ₹1,00,000) and watch individual rupee amounts recalculate instantly.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-gray-900 dark:text-white">1-Click Portfolio Execution</div>
            <p className="mt-0.5 text-gray-500">
              Execute all stocks directly into your simulated holdings without entering repetitive orders.
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Investment Basket Component */}
      <InvestmentBasket />
    </div>
  );
}

export default BasketPage;
