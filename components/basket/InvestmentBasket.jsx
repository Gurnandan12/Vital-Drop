'use client';
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Sliders,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  PieChart,
  ArrowRight,
  TrendingUp,
  Search,
  Layers,
  Sparkles,
  Info,
  DollarSign,
  Percent,
  Check,
  X,
  Compass,
} from 'lucide-react';
import {
  useBasketStore,
  PRESET_BASKETS,
  selectBasketItemCount,
  selectBasketTotalAllocation,
  selectIsBasketBalanced,
  selectBasketTotalAllocatedAmount,
  selectBasketRemainingFunds,
  selectBasketItemsWithAmounts,
} from '@/store/basketStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useStockStore } from '@/store/stockStore';
import { INDIAN_STOCKS } from '@/lib/indianStocks';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { StatCard } from '../ui/StatCard';
import { Badge } from '../ui/Badge';

/**
 * InvestmentBasket — Interactive Shopping Cart for Thematic Asset Allocation
 *
 * Demonstrates:
 * - Shopping cart workflow applied to portfolio planning
 * - Live live-recalculation of weights, amounts, and remaining unallocated funds
 * - Prevention of duplicate entries with explicit user feedback
 * - In-place editing of target allocations and direct Rupee amounts
 * - Clear basket workflow with confirmation dialog
 * - Curated model presets with 1-click equal rebalancing
 * - Clear distinction between planning model and live portfolio holdings
 */
export function InvestmentBasket() {
  const { theme } = useStockStore();
  const isDark = theme === 'dark';

  // Zustand Basket Store
  const basketName = useBasketStore((s) => s.basketName);
  const totalBudget = useBasketStore((s) => s.totalBudget);
  const items = useBasketStore((s) => s.items);

  const addItem = useBasketStore((s) => s.addItem);
  const removeItem = useBasketStore((s) => s.removeItem);
  const updateAllocation = useBasketStore((s) => s.updateAllocation);
  const updateAmount = useBasketStore((s) => s.updateAmount);
  const rebalanceEvenly = useBasketStore((s) => s.rebalanceEvenly);
  const setTotalBudget = useBasketStore((s) => s.setTotalBudget);
  const setBasketName = useBasketStore((s) => s.setBasketName);
  const loadPresetBasket = useBasketStore((s) => s.loadPresetBasket);
  const clearBasket = useBasketStore((s) => s.clearBasket);
  const isInBasket = useBasketStore((s) => s.isInBasket);

  // Derived Selectors (primitive values for optimal React rendering)
  const itemCount = useBasketStore(selectBasketItemCount);
  const totalAllocation = useBasketStore(selectBasketTotalAllocation);
  const isBalanced = useBasketStore(selectIsBasketBalanced);
  const totalAllocatedAmount = useBasketStore(selectBasketTotalAllocatedAmount);
  const remainingFunds = useBasketStore(selectBasketRemainingFunds);

  // Memoize augmented items to guarantee referential stability
  const itemsWithAmounts = useMemo(() => {
    return selectBasketItemsWithAmounts({ items, totalBudget });
  }, [items, totalBudget]);

  // Portfolio Store integration for paper simulation
  const balance = usePortfolioStore((s) => s.balance);
  const buyStock = usePortfolioStore((s) => s.buyStock);

  // Local UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [notification, setNotification] = useState(null);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(totalBudget.toString());

  // Search suggestions from INDIAN_STOCKS
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return INDIAN_STOCKS.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery]);

  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddStock = (stock) => {
    const res = addItem(stock);
    if (!res.success) {
      showToast('error', res.message);
      return;
    }
    setSearchQuery('');
    setIsSearchOpen(false);
    showToast('success', res.message);
  };

  const handleRemoveStock = (symbol) => {
    const res = removeItem(symbol);
    showToast('info', res.message);
  };

  const handleSaveBudget = (e) => {
    e.preventDefault();
    const res = setTotalBudget(budgetInput);
    if (!res.success) {
      showToast('error', res.message);
    } else {
      setEditingBudget(false);
      showToast('success', `Updated target basket budget to ₹${parseInt(budgetInput, 10).toLocaleString('en-IN')}`);
    }
  };

  // Optional paper trading deployment (pure simulation, not real trade execution)
  const handleDeployToSimulator = () => {
    if (items.length === 0) return;

    if (totalBudget > balance) {
      showToast(
        'error',
        `Insufficient simulated cash. Required: ₹${totalBudget.toLocaleString('en-IN')}, available balance: ₹${balance.toLocaleString('en-IN')}.`
      );
      return;
    }

    setSimulating(true);
    let successCount = 0;

    itemsWithAmounts.forEach((item) => {
      const price = item.unitPrice || 1000;
      const quantity = Math.max(1, item.estimatedUnits || 1);

      const res = buyStock(
        {
          symbol: item.symbol,
          name: item.name,
          exchange: item.exchange,
          sector: item.sector,
        },
        quantity,
        price
      );

      if (res.success) successCount++;
    });

    setSimulating(false);
    showToast(
      'success',
      `Simulation successful: Deployed ${successCount} planned positions into your virtual paper portfolio.`
    );
  };

  const handleConfirmClear = () => {
    clearBasket();
    setShowClearConfirm(false);
    showToast('info', 'Investment basket cleared.');
  };

  return (
    <div className="space-y-6">
      {/* ── Status Notifications / Toast ── */}
      {notification && (
        <div
          role="alert"
          className={`p-4 rounded-2xl border text-sm flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'error'
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              : notification.type === 'info'
              ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : notification.type === 'info' ? (
              <Info className="w-4 h-4 shrink-0 text-blue-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-white text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Financial Clarity & Educational Model Disclaimer ── */}
      <div
        className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
          isDark
            ? 'bg-indigo-950/20 border-indigo-500/20 text-indigo-300'
            : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
        }`}
      >
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Planning Cart Simulation: </span>
          The Investment Basket allows you to model target allocations, simulate multi-stock budget distribution,
          and plan thematic portfolios before committing funds. Adding assets to this basket{' '}
          <strong className="underline">does not execute real-money market orders</strong>. All values and quotes are
          illustrative models.
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Target Budget Card */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold mb-1">
            <span>Planned Budget</span>
            <button
              onClick={() => {
                setBudgetInput(totalBudget.toString());
                setEditingBudget(!editingBudget);
              }}
              className="text-violet-400 hover:underline text-[11px]"
            >
              {editingBudget ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editingBudget ? (
            <form onSubmit={handleSaveBudget} className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min="1000"
                step="5000"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-sm font-bold outline-none ${
                  isDark ? 'bg-white/5 border-white/20 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
              <Button type="submit" size="sm" variant="primary">
                Save
              </Button>
            </form>
          ) : (
            <div className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              ₹{totalBudget.toLocaleString('en-IN')}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">Total capital allocated to basket</p>
        </div>

        {/* Total Planned Allocation Card */}
        <StatCard
          title="Planned Allocation"
          value={`${totalAllocation.toFixed(1)}%`}
          subtitle={
            isBalanced
              ? '✓ Balanced (100% Target)'
              : totalAllocation > 100
              ? `Exceeds budget by ${(totalAllocation - 100).toFixed(1)}%`
              : `${(100 - totalAllocation).toFixed(1)}% unallocated`
          }
          icon={Percent}
          isDark={isDark}
        />

        {/* Allocated vs Unallocated Rupee Card */}
        <StatCard
          title="Allocated Capital"
          value={`₹${totalAllocatedAmount.toLocaleString('en-IN')}`}
          subtitle={`₹${remainingFunds.toLocaleString('en-IN')} unallocated funds`}
          icon={Wallet}
          isDark={isDark}
        />

        {/* Constituents Count */}
        <StatCard
          title="Basket Constituents"
          value={`${itemCount} Assets`}
          subtitle={itemCount > 0 ? 'Across diverse sectors' : 'No items added'}
          icon={Layers}
          isDark={isDark}
        />
      </div>

      {/* ── Model Presets & Controls Bar ── */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200 shadow-sm'
        }`}
      >
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">
            Model Presets:
          </span>
          {Object.entries(PRESET_BASKETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                const res = loadPresetBasket(key);
                showToast('info', res.message);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                basketName === preset.name
                  ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/25'
                  : isDark
                  ? 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                  : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset.name.replace('Nifty ', '').replace('India ', '')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={rebalanceEvenly}
            disabled={itemCount === 0}
            className="gap-1.5"
            title="Distribute 100% weight evenly across all constituents"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Equal Weight (100%)</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Asset</span>
          </Button>

          {itemCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearConfirm(true)}
              className="text-rose-400 hover:text-rose-300 hover:border-rose-500/40"
              title="Clear all basket items"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Clear Confirmation Modal / Banner ── */}
      {showClearConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 ${
            isDark ? 'bg-rose-950/30 border-rose-500/30 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-sm block">Clear Entire Investment Basket?</span>
              This will remove all {itemCount} constituents from your planning model.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowClearConfirm(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={handleConfirmClear}>
              Yes, Clear Basket
            </Button>
          </div>
        </div>
      )}

      {/* ── Ticker Search Bar (When Open) ── */}
      {isSearchOpen && (
        <div
          className={`p-4 rounded-2xl border transition-all animate-in fade-in slide-in-from-top-2 ${
            isDark ? 'bg-[#0d0d1a] border-violet-500/30' : 'bg-white border-violet-200 shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Add Investment Idea to Basket
            </span>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="text-gray-400 hover:text-white text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Indian stock to add (e.g. Infosys, ITC, Tata Motors, L&T)..."
              autoFocus
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border transition-all ${
                isDark
                  ? 'bg-white/5 border-white/10 focus:border-violet-500 text-white placeholder-gray-500'
                  : 'bg-gray-50 border-gray-200 focus:border-violet-500 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          {suggestions.length > 0 && (
            <div
              className={`mt-3 rounded-xl border divide-y overflow-hidden ${
                isDark
                  ? 'bg-[#121224] border-white/10 divide-white/5'
                  : 'bg-white border-gray-200 divide-gray-100 shadow-lg'
              }`}
            >
              {suggestions.map((stock) => {
                const alreadyAdded = isInBasket(stock.symbol);
                return (
                  <div
                    key={stock.symbol}
                    className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{stock.symbol}</span>
                        <Badge variant="primary">{stock.sector}</Badge>
                        <Badge variant="largeCap">{stock.capCategory || 'Mid Cap'}</Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{stock.name}</p>
                    </div>

                    <button
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => handleAddStock(stock)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        alreadyAdded
                          ? 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
                          : 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30'
                      }`}
                    >
                      {alreadyAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>In Basket</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Basket</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Allocation Distribution Bar ── */}
      {itemCount > 0 && (
        <div
          className={`p-4 rounded-2xl border space-y-2 ${
            isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-2">
              <span>Target Weight Distribution</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                  isBalanced
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : totalAllocation > 100
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {isBalanced
                  ? '✓ Balanced (100%)'
                  : totalAllocation > 100
                  ? `Overallocated: ${totalAllocation.toFixed(1)}%`
                  : `Planned: ${totalAllocation.toFixed(1)}%`}
              </span>
            </span>

            <span className="text-gray-400 font-semibold">
              Remaining: ₹{remainingFunds.toLocaleString('en-IN')} (
              {Math.max(0, 100 - totalAllocation).toFixed(1)}%)
            </span>
          </div>

          {/* Multi-segment Progress Bar */}
          <div className="h-3 w-full rounded-full overflow-hidden flex bg-white/5 shadow-inner">
            {items.map((item, idx) => {
              const colors = [
                'bg-violet-600',
                'bg-indigo-500',
                'bg-blue-500',
                'bg-emerald-500',
                'bg-amber-500',
                'bg-rose-500',
                'bg-cyan-500',
                'bg-fuchsia-500',
              ];
              const color = colors[idx % colors.length];
              return (
                <div
                  key={item.symbol}
                  style={{ width: `${Math.min(item.allocationPercent, 100)}%` }}
                  className={`h-full ${color} transition-all duration-300`}
                  title={`${item.symbol}: ${item.allocationPercent}% (₹${Math.round(
                    (item.allocationPercent / 100) * totalBudget
                  ).toLocaleString('en-IN')})`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ── Basket Items List or Empty State ── */}
      {itemCount > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {itemsWithAmounts.map((item, idx) => {
              const borderAccents = [
                'border-violet-500/30',
                'border-indigo-500/30',
                'border-blue-500/30',
                'border-emerald-500/30',
                'border-amber-500/30',
                'border-rose-500/30',
              ];
              const borderAccent = borderAccents[idx % borderAccents.length];

              return (
                <div
                  key={item.symbol}
                  className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
                    isDark ? `bg-[#0d0d1a] ${borderAccent}` : 'bg-white border-gray-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/stock/${item.symbol}`}
                          className="font-extrabold text-base hover:underline text-gray-900 dark:text-white"
                        >
                          {item.symbol}
                        </Link>
                        <Badge variant={item.exchange === 'BSE' ? 'bse' : 'nse'}>
                          {item.exchange}
                        </Badge>
                        <Badge variant="primary">{item.sector}</Badge>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.name}</p>
                      <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-2">
                        <span>Est. Price: ₹{item.unitPrice.toLocaleString('en-IN')}</span>
                        <span>•</span>
                        <span>Est. Units: ~{item.estimatedUnits} shares</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveStock(item.symbol)}
                      title="Remove from basket"
                      className="p-1.5 rounded-xl text-gray-500 hover:text-rose-400 hover:bg-white/5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Allocation Editing Controls */}
                  <div className="pt-3 border-t border-white/6 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-400">Target Allocation:</span>
                      <div className="flex items-center gap-1.5 font-bold text-violet-400">
                        <span>{item.allocationPercent}%</span>
                        <span className="text-gray-500 font-normal">
                          (₹{item.targetAmount.toLocaleString('en-IN')})
                        </span>
                      </div>
                    </div>

                    {/* Range Slider for Percentage */}
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={item.allocationPercent}
                        onChange={(e) => updateAllocation(item.symbol, e.target.value)}
                        className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-violet-500 bg-white/10"
                      />

                      {/* Percentage Input */}
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={item.allocationPercent}
                          onChange={(e) => updateAllocation(item.symbol, e.target.value)}
                          className={`w-16 px-2 py-1 rounded-lg border text-xs font-bold text-center outline-none ${
                            isDark
                              ? 'bg-white/5 border-white/10 text-white'
                              : 'bg-gray-50 border-gray-200 text-gray-900'
                          }`}
                        />
                        <span className="text-xs text-gray-400 font-bold">%</span>
                      </div>
                    </div>

                    {/* Direct Rupee Amount Input */}
                    <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-gray-400">
                      <span>Or set Rupee amount:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 font-bold">₹</span>
                        <input
                          type="number"
                          min={0}
                          max={totalBudget}
                          step={500}
                          value={item.targetAmount}
                          onChange={(e) => updateAmount(item.symbol, e.target.value)}
                          className={`w-24 px-2 py-0.5 rounded-md border text-xs font-semibold text-right outline-none ${
                            isDark
                              ? 'bg-white/5 border-white/10 text-white'
                              : 'bg-gray-50 border-gray-200 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Simulator / Export Action Bar ── */}
          <div
            className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isDark ? 'bg-[#0f0f24] border-violet-500/30' : 'bg-violet-50 border-violet-200'
            }`}
          >
            <div>
              <h4 className="font-bold text-base flex items-center gap-2">
                <span>Model Complete: {itemCount} Constituents</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-normal">
                  Educational Cart
                </span>
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Target budget: ₹{totalBudget.toLocaleString('en-IN')} • Planned capital: ₹
                {totalAllocatedAmount.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Link to="/market">
                <Button variant="outline" size="md" className="gap-1.5">
                  <Compass className="w-4 h-4 text-violet-400" />
                  <span>Browse More Stocks</span>
                </Button>
              </Link>

              <Button
                variant="primary"
                size="md"
                onClick={handleDeployToSimulator}
                isLoading={simulating}
                disabled={simulating || itemCount === 0}
                className="gap-2"
                title="Simulate planned basket in virtual paper trading portfolio"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Simulate in Paper Portfolio</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="Your Investment Basket is Empty"
          description="Your investment planning cart contains no assets. Construct a custom diversified portfolio model or get started immediately with a curated model preset."
          actionLabel="Load Nifty Bluechip Titans Preset"
          onAction={() => loadPresetBasket('bluechip')}
          isDark={isDark}
          secondaryActionLabel="Explore Indian Market Directory"
          secondaryActionTo="/market"
        />
      )}
    </div>
  );
}

export default InvestmentBasket;
