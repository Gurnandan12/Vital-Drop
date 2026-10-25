'use client';
import React from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  Wallet,
  TrendingUp,
  PieChart,
  ShoppingBag,
  ArrowRight,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useStockStore } from '@/store/stockStore';
import { StatCard } from '../ui/StatCard';
import { PageHeader } from './PageHeader';

/**
 * DashboardLayout — Demonstrates React Router Nested Routing
 * - Hosts /dashboard/overview and /dashboard/activity
 * - Uses <Outlet /> for rendering child routes
 * - Uses <NavLink> for nested tab switching
 * - Demonstrates useMemo for aggregate metric calculations
 */
export function DashboardLayout() {
  const { balance, holdings, totalInvested, holdingsCount, recentTransactions } = usePortfolio();
  const { theme } = useStockStore();
  const isDark = theme === 'dark';
  const location = useLocation();

  // Format currency
  const formatINR = (val) =>
    `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const isOverviewActive =
    location.pathname === '/dashboard' || location.pathname === '/dashboard/overview';
  const isActivityActive = location.pathname === '/dashboard/activity';

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* ── Page Header ── */}
      <PageHeader
        title="Investment Dashboard"
        description="Monitor real-time Indian stock market feeds, analyze price candles, stress-test risks, and execute zero-risk virtual trades."
        badge="Live Simulator"
        badgeVariant="violet"
        badgeIcon={LayoutDashboard}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/watchlist"
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                isDark
                  ? 'border-white/10 hover:bg-white/5 text-gray-300 hover:text-white'
                  : 'border-gray-200 hover:bg-gray-100 text-gray-700 hover:text-gray-900'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Watchlist</span>
            </Link>

            <Link
              to="/risk-analyzer"
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                isDark
                  ? 'border-white/10 hover:bg-white/5 text-gray-300 hover:text-white'
                  : 'border-gray-200 hover:bg-gray-100 text-gray-700 hover:text-gray-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
              <span>Risk Analyzer</span>
            </Link>
          </div>
        }
      />

      {/* ── TOP KPI SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Virtual Cash Balance"
          value={`₹${balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subtitle="Available for instantaneous execution"
          icon={Wallet}
          isDark={isDark}
        />

        <StatCard
          title="Capital Invested"
          value={formatINR(totalInvested)}
          subtitle={`${holdingsCount} stock positions held`}
          icon={PieChart}
          isDark={isDark}
        />

        <StatCard
          title="Total Portfolio Worth"
          value={formatINR(balance + totalInvested)}
          subtitle="Cash + active equities"
          icon={TrendingUp}
          isDark={isDark}
        />

        <StatCard
          title="Trades Executed"
          value={recentTransactions.length.toString()}
          subtitle="Lifetime simulator activity"
          icon={ShoppingBag}
          isDark={isDark}
        />
      </div>

      {/* ── NESTED SUB-NAVIGATION TABS ── */}
      <div className="flex items-center justify-between border-b border-white/10 pb-1 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/overview"
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              isOverviewActive
                ? isDark
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'bg-violet-600 text-white'
                : isDark
                ? 'text-gray-400 hover:text-white hover:bg-white/5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </Link>

          <Link
            to="/dashboard/activity"
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              isActivityActive
                ? isDark
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'bg-violet-600 text-white'
                : isDark
                ? 'text-gray-400 hover:text-white hover:bg-white/5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Trade Activity Log</span>
          </Link>
        </div>

        <Link
          to="/market"
          className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
        >
          <span>Explore All 200+ Indian Stocks</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── NESTED ROUTE CONTENT RENDERED VIA OUTLET ── */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
