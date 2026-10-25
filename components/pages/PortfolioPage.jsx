'use client';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  PieChart,
  Wallet,
  Plus,
  Minus,
  ExternalLink,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useStockStore } from '@/store/stockStore';
import { StatCard } from '../ui/StatCard';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { PageHeader } from '../layout/PageHeader';

/**
 * PortfolioPage — Protected Route View
 * Demonstrates:
 * - Protected route content
 * - usePortfolio custom hook consumption
 * - useMemo for portfolio valuation, profit/loss, and asset allocation
 * - Rendering lists (.map) for holdings and allocation bars
 * - Empty state conditional rendering
 * - Trade trigger callbacks
 */
export function PortfolioPage() {
  const { balance, holdings, totalInvested, holdingsCount } = usePortfolio();
  const { theme } = useStockStore();
  const isDark = theme === 'dark';

  // Format INR helper
  const fmt = (val) =>
    `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Approximate current market value (in reality would match live quotes; we add modest variance to demonstrate P&L)
  const holdingsWithMetrics = useMemo(() => {
    return holdings.map((h) => {
      // Mock market price slightly above or below avgBuyPrice to demonstrate P&L calculations
      const currentPrice = h.avgBuyPrice * 1.045; // 4.5% overall gain simulation
      const currentValue = h.quantity * currentPrice;
      const pnl = currentValue - h.totalInvested;
      const pnlPercent = (pnl / h.totalInvested) * 100;

      return {
        ...h,
        currentPrice,
        currentValue,
        pnl,
        pnlPercent,
      };
    });
  }, [holdings]);

  const totalCurrentValue = useMemo(() => {
    return holdingsWithMetrics.reduce((sum, h) => sum + h.currentValue, 0);
  }, [holdingsWithMetrics]);

  const totalNetPnL = totalCurrentValue - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? (totalNetPnL / totalInvested) * 100 : 0;
  const isPositivePnL = totalNetPnL >= 0;

  // Asset allocation breakdown by stock for visual distribution
  const allocation = useMemo(() => {
    if (totalCurrentValue === 0) return [];
    return holdingsWithMetrics.map((h) => ({
      symbol: h.symbol,
      percent: ((h.currentValue / totalCurrentValue) * 100).toFixed(1),
    }));
  }, [holdingsWithMetrics, totalCurrentValue]);

  // Open trade modal
  const openTrade = (stock, action) => {
    window.dispatchEvent(
      new CustomEvent('vitaldrop_open_trade', {
        detail: {
          stock: {
            symbol: stock.symbol,
            name: stock.name,
            exchange: stock.exchange || 'NSE',
            price: stock.currentPrice,
          },
          initialAction: action,
        },
      })
    );
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* ── Page Header ── */}
      <PageHeader
        title="My Portfolio"
        description="Real-time equity valuation, cost-basis breakdown, and simulated profit/loss tracking."
        badge="Virtual Holdings & Net Worth"
        badgeVariant="violet"
        badgeIcon={Briefcase}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/basket">
              <Button variant="secondary" size="md" className="gap-2">
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
                <span>Thematic Baskets</span>
              </Button>
            </Link>
            <Link to="/market">
              <Button variant="primary" size="md" className="gap-2">
                <Plus className="w-4 h-4" />
                <span>Invest in New Stocks</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* ── KPI STATS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Portfolio Worth"
          value={fmt(balance + totalCurrentValue)}
          subtitle="Virtual Cash + Active Equities"
          icon={Wallet}
          isDark={isDark}
        />

        <StatCard
          title="Capital Invested"
          value={fmt(totalInvested)}
          subtitle={`${holdingsCount} stock positions held`}
          icon={PieChart}
          isDark={isDark}
        />

        <StatCard
          title="Current Equity Value"
          value={fmt(totalCurrentValue)}
          subtitle="Market value of held stocks"
          icon={TrendingUp}
          isDark={isDark}
        />

        <StatCard
          title="Overall Unrealized P&L"
          value={`${isPositivePnL ? '+' : ''}${fmt(totalNetPnL)}`}
          change={`${isPositivePnL ? '+' : ''}${totalPnLPercent.toFixed(2)}%`}
          isPositive={isPositivePnL}
          subtitle="Net return on invested capital"
          icon={isPositivePnL ? TrendingUp : TrendingDown}
          isDark={isDark}
        />
      </div>

      {/* ── ASSET ALLOCATION BREAKDOWN ── */}
      {holdings.length > 0 && (
        <div
          className={`p-6 rounded-3xl border space-y-4 ${
            isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400">
              Asset Allocation Weight
            </h3>
            <span className="text-xs text-gray-400">{holdings.length} Positions</span>
          </div>

          {/* Allocation Progress Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-white/5">
            {allocation.map((item, idx) => {
              const colors = [
                'bg-violet-500',
                'bg-blue-500',
                'bg-emerald-500',
                'bg-orange-500',
                'bg-pink-500',
                'bg-cyan-500',
              ];
              const color = colors[idx % colors.length];

              return (
                <div
                  key={item.symbol}
                  style={{ width: `${item.percent}%` }}
                  title={`${item.symbol}: ${item.percent}%`}
                  className={`${color} h-full transition-all`}
                />
              );
            })}
          </div>

          {/* Allocation Legend */}
          <div className="flex flex-wrap gap-4 pt-1 text-xs">
            {allocation.map((item, idx) => {
              const dots = [
                'bg-violet-500',
                'bg-blue-500',
                'bg-emerald-500',
                'bg-orange-500',
                'bg-pink-500',
                'bg-cyan-500',
              ];
              const dot = dots[idx % dots.length];

              return (
                <div key={item.symbol} className="flex items-center gap-1.5 font-medium">
                  <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                  <span>{item.symbol}</span>
                  <span className="text-gray-400">({item.percent}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── HOLDINGS TABLE ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight">Active Stock Positions</h2>
          <span className="text-xs text-gray-400">
            Available Virtual Cash: <strong className="text-emerald-400">₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
          </span>
        </div>

        {holdings.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your Portfolio is Empty"
            description="You do not own any equities yet. Browse the Indian Stock Market to buy your first shares!"
            actionLabel="Explore Stock Market"
            onAction={() => {}}
            isDark={isDark}
          />
        ) : (
          <div
            className={`rounded-3xl border overflow-hidden ${
              isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead
                  className={`border-b font-semibold uppercase tracking-wider ${
                    isDark ? 'bg-white/[0.02] border-white/8 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                >
                  <tr>
                    <th className="py-4 px-5">Stock Symbol</th>
                    <th className="py-4 px-5 text-right">Shares Held</th>
                    <th className="py-4 px-5 text-right">Avg. Cost Basis</th>
                    <th className="py-4 px-5 text-right">Market Price</th>
                    <th className="py-4 px-5 text-right">Current Value</th>
                    <th className="py-4 px-5 text-right">Unrealized P&amp;L</th>
                    <th className="py-4 px-5 text-center">Quick Trade</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                  {holdingsWithMetrics.map((h) => {
                    const isPositive = h.pnl >= 0;

                    return (
                      <tr
                        key={h.symbol}
                        className={`transition-colors ${
                          isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/stock/${h.symbol}`}
                              className="font-bold text-sm text-violet-400 hover:underline"
                            >
                              {h.symbol}
                            </Link>
                            <Badge variant={h.symbol.endsWith('.BO') ? 'bse' : 'nse'}>
                              {h.symbol.endsWith('.BO') ? 'BSE' : 'NSE'}
                            </Badge>
                          </div>
                          <p className="text-gray-400 truncate max-w-[180px]">{h.name}</p>
                        </td>

                        <td className="py-4 px-5 text-right font-bold text-sm">
                          {h.quantity} shares
                        </td>

                        <td className="py-4 px-5 text-right font-medium">
                          {fmt(h.avgBuyPrice)}
                        </td>

                        <td className="py-4 px-5 text-right font-medium">
                          {fmt(h.currentPrice)}
                        </td>

                        <td className="py-4 px-5 text-right font-bold text-sm">
                          {fmt(h.currentValue)}
                        </td>

                        <td className="py-4 px-5 text-right font-bold">
                          <div
                            className={`inline-flex items-center gap-1 ${
                              isPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            <span>
                              {isPositive ? '+' : ''}
                              {fmt(h.pnl)} ({isPositive ? '+' : ''}
                              {h.pnlPercent.toFixed(2)}%)
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-5 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => openTrade(h, 'BUY')}
                              className="p-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                              title="Buy More Shares"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openTrade(h, 'SELL')}
                              className="p-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Sell Shares"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PortfolioPage;
