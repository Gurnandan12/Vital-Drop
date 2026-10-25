'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  TrendingUp,
  LayoutGrid,
  List as ListIcon,
  ExternalLink,
  ShoppingCart,
  Building2,
  PieChart,
  ShoppingBag,
  Check,
} from 'lucide-react';
import { INDIAN_STOCKS } from '@/lib/indianStocks';
import { filterStocks } from '@/lib/stockSearch';
import { useStockStore } from '@/store/stockStore';
import { useBasketStore } from '@/store/basketStore';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

const SECTORS = [
  'All',
  'Banking',
  'IT',
  'Pharma',
  'FMCG',
  'Energy',
  'Metal',
  'Automobile',
  'Telecom',
  'Infrastructure',
  'PSU',
  'Realty',
  'NBFC',
];

const CAP_TIERS = ['All', 'Large Cap', 'Mid Cap', 'Small Cap'];

/**
 * Child Component: StockCard
 * Demonstrates: Props, Prop Drilling (receives onTrade & onAddToBasket from parent), Reusable UI
 */
function StockCard({ stock, onTrade, onAddToBasket, inBasket, isDark }) {
  const isBSE = stock.exchange === 'BSE' || stock.symbol.endsWith('.BO');

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        isDark
          ? 'bg-[#0d0d1a] border-white/8 hover:border-violet-500/40 hover:shadow-violet-600/5'
          : 'bg-white border-gray-200 hover:border-violet-300 shadow-sm'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h4 className="font-bold text-base tracking-tight">{stock.symbol}</h4>
            <p className="text-xs text-gray-400 line-clamp-1">{stock.name}</p>
          </div>
          <Badge variant={isBSE ? 'bse' : 'nse'}>{stock.exchange}</Badge>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge variant="primary">{stock.sector}</Badge>
          <Badge variant={stock.capCategory === 'Large Cap' ? 'largeCap' : stock.capCategory === 'Mid Cap' ? 'midCap' : 'smallCap'}>
            {stock.capCategory}
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5 flex-wrap">
        <Link
          to={`/stock/${stock.symbol}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
        >
          <span>Details</span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onAddToBasket(stock)}
            title={inBasket ? 'Already in Investment Basket' : 'Add to Investment Planning Basket'}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
              inBasket
                ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400'
                : isDark
                ? 'border-white/10 hover:bg-white/5 text-gray-300 hover:text-white'
                : 'border-gray-200 hover:bg-gray-100 text-gray-700'
            }`}
          >
            {inBasket ? <Check className="w-3.5 h-3.5 text-indigo-400" /> : <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />}
            <span className="hidden sm:inline">{inBasket ? 'In Basket' : '+ Basket'}</span>
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onTrade(stock)}
            className="gap-1.5"
          >
            <ShoppingCart className="w-3 h-3" />
            <span>Trade</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * MarketPage — Stock Market Directory
 * Demonstrates:
 * - Rendering lists with .map()
 * - Controlled Multi-filter Form
 * - Lifting state up (filters in parent)
 * - Prop drilling pattern (passing onTrade callback down to child cards)
 * - useMemo for performant client-side filtering of 200+ stocks
 * - useCallback for memoized trade trigger
 * - Dynamic route links to /stock/:symbol
 */
export function MarketPage() {
  const { theme } = useStockStore();
  const isDark = theme === 'dark';

  const addItemToBasket = useBasketStore((s) => s.addItem);
  const isInBasket = useBasketStore((s) => s.isInBasket);
  const [basketToast, setBasketToast] = useState(null);

  const handleAddToBasket = useCallback((stock) => {
    const res = addItemToBasket({
      symbol: stock.symbol,
      name: stock.name,
      exchange: stock.exchange,
      sector: stock.sector,
      category: stock.capCategory,
    });
    setBasketToast(res.message);
    setTimeout(() => setBasketToast(null), 3500);
  }, [addItemToBasket]);

  // Controlled Filter States (Lifting state up)
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('All');
  const [capCategory, setCapCategory] = useState('All');
  const [exchange, setExchange] = useState('All'); // 'All' | 'NSE' | 'BSE'
  const [sortBy, setSortBy] = useState('SYMBOL_ASC');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Filter stocks using useMemo
  const filteredStocks = useMemo(() => {
    let result = filterStocks({
      query,
      sector,
      capCategory,
      exchange,
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'SYMBOL_ASC') return a.symbol.localeCompare(b.symbol);
      if (sortBy === 'SYMBOL_DESC') return b.symbol.localeCompare(a.symbol);
      if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [query, sector, capCategory, exchange, sortBy]);

  // Memoized trade trigger callback
  const handleTradeStock = useCallback((stock) => {
    window.dispatchEvent(
      new CustomEvent('vitaldrop_open_trade', {
        detail: {
          stock: {
            symbol: stock.symbol,
            name: stock.name,
            exchange: stock.exchange,
            sector: stock.sector,
          },
          initialAction: 'BUY',
        },
      })
    );
  }, []);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-400 mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>NSE &amp; BSE Equity Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Indian Stock Market
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Browse, analyze, and trade 200+ bluechip, mid-cap, and emerging Indian equities in real time.
          </p>
        </div>

        {/* View mode toggle & total count */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <span className="text-xs text-gray-400">
            Showing <strong className="text-white">{filteredStocks.length}</strong> stocks
          </span>

          <div className="flex rounded-xl p-1 bg-white/5 border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              aria-label="List view"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTROLLED FILTER TOOLBAR ── */}
      <div
        className={`p-4 rounded-2xl border space-y-4 ${
          isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200 shadow-sm'
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ticker, company, or sector..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border outline-none transition-all ${
                isDark
                  ? 'bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-violet-500'
              }`}
            />
          </div>

          {/* Sector Filter */}
          <div>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold border outline-none ${
                isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-800'
              }`}
            >
              {SECTORS.map((sec) => (
                <option key={sec} value={sec}>
                  Sector: {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Cap Category Filter */}
          <div>
            <select
              value={capCategory}
              onChange={(e) => setCapCategory(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold border outline-none ${
                isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-800'
              }`}
            >
              {CAP_TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  Tier: {tier}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold border outline-none ${
                isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-800'
              }`}
            >
              <option value="SYMBOL_ASC">Symbol (A → Z)</option>
              <option value="SYMBOL_DESC">Symbol (Z → A)</option>
              <option value="NAME_ASC">Company Name (A → Z)</option>
            </select>
          </div>
        </div>

        {/* Exchange Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/5 text-xs">
          <span className="text-gray-400 font-semibold mr-1">Exchange:</span>
          {['All', 'NSE', 'BSE'].map((ex) => (
            <button
              key={ex}
              onClick={() => setExchange(ex)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                exchange === ex
                  ? ex === 'NSE'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : ex === 'BSE'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-violet-600 text-white'
                  : isDark
                  ? 'bg-white/5 text-gray-400 hover:text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              {ex === 'All' ? 'All Exchanges' : ex}
            </button>
          ))}

          {(query || sector !== 'All' || capCategory !== 'All' || exchange !== 'All') && (
            <button
              onClick={() => {
                setQuery('');
                setSector('All');
                setCapCategory('All');
                setExchange('All');
              }}
              className="ml-auto text-xs text-rose-400 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── STOCK LISTING DISPLAY ── */}
      {filteredStocks.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No stocks match your filter"
          description="Try relaxing your search terms, changing the sector, or switching exchanges."
          actionLabel="Clear All Filters"
          onAction={() => {
            setQuery('');
            setSector('All');
            setCapCategory('All');
            setExchange('All');
          }}
          isDark={isDark}
        />
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredStocks.map((stock) => (
            <StockCard
              key={stock.symbol}
              stock={stock}
              onTrade={handleTradeStock}
              onAddToBasket={handleAddToBasket}
              inBasket={isInBasket(stock.symbol)}
              isDark={isDark}
            />
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div
          className={`rounded-2xl border overflow-hidden ${
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
                  <th className="py-3.5 px-4">Symbol</th>
                  <th className="py-3.5 px-4">Company Name</th>
                  <th className="py-3.5 px-4">Exchange</th>
                  <th className="py-3.5 px-4">Sector</th>
                  <th className="py-3.5 px-4">Cap Tier</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                {filteredStocks.map((stock) => {
                  const inBasket = isInBasket(stock.symbol);
                  return (
                    <tr
                      key={stock.symbol}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-sm">
                        <Link
                          to={`/stock/${stock.symbol}`}
                          className="text-violet-400 hover:underline"
                        >
                          {stock.symbol}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-gray-300 font-medium">{stock.name}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={stock.exchange === 'BSE' ? 'bse' : 'nse'}>{stock.exchange}</Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="primary">{stock.sector}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-gray-400">{stock.capCategory}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddToBasket(stock)}
                            title={inBasket ? 'In Investment Basket' : 'Add to Investment Planning Basket'}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                              inBasket
                                ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400'
                                : isDark
                                ? 'border-white/10 hover:bg-white/5 text-gray-300 hover:text-white'
                                : 'border-gray-200 hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {inBasket ? <Check className="w-3.5 h-3.5 text-indigo-400" /> : <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />}
                            <span>{inBasket ? 'In Basket' : '+ Basket'}</span>
                          </button>

                          <Link
                            to={`/stock/${stock.symbol}`}
                            className="px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/5 text-gray-300 transition-colors"
                          >
                            Details
                          </Link>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleTradeStock(stock)}
                          >
                            Trade
                          </Button>
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

      {/* Floating Basket Notification Toast */}
      {basketToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-indigo-950/95 border border-indigo-500/40 text-white shadow-2xl flex items-center gap-3 text-xs animate-in slide-in-from-bottom-3">
          <ShoppingBag className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{basketToast}</span>
          <Link
            to="/basket"
            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] ml-2"
          >
            View Basket →
          </Link>
        </div>
      )}
    </div>
  );
}

export default MarketPage;
