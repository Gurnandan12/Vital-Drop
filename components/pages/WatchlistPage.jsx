'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Search,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  ShoppingCart,
  RefreshCw,
  Building2,
  Filter,
  ShoppingBag,
  Check,
} from 'lucide-react';
import { useStockStore } from '@/store/stockStore';
import { useBasketStore } from '@/store/basketStore';
import { INDIAN_STOCKS } from '@/lib/indianStocks';
import { PageHeader } from '../layout/PageHeader';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

/**
 * WatchlistStockCard — Live quote card for a watchlisted stock
 */
function WatchlistStockCard({ item, onRemove, onTrade, onAddToBasket, inBasket, isDark }) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchQuote = () => {
      fetch(`/api/quote?symbol=${item.symbol}`)
        .then((res) => res.json())
        .then((resData) => {
          if (active && resData.data) {
            setQuote(resData.data);
            setLoading(false);
          }
        })
        .catch(() => {
          if (active) setLoading(false);
        });
    };

    fetchQuote();
    // Auto refresh every 20 seconds
    const interval = setInterval(fetchQuote, 20000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [item.symbol]);

  const isBSE = item.symbol.endsWith('.BO');
  const isPositive = (quote?.percentChange ?? 0) >= 0;
  const cleanSymbol = item.symbol.replace(/\.(NS|BO)$/, '');

  // Look up metadata from INDIAN_STOCKS
  const meta = useMemo(() => {
    return INDIAN_STOCKS.find((s) => s.symbol === item.symbol) || null;
  }, [item.symbol]);

  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        isDark
          ? 'bg-[#0d0d1a] border-white/8 hover:border-violet-500/30'
          : 'bg-white border-gray-200 hover:border-violet-300 shadow-sm'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg tracking-tight">{cleanSymbol}</h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                  isBSE
                    ? isDark
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-orange-50 text-orange-600 border border-orange-200'
                    : isDark
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                }`}
              >
                {isBSE ? 'BSE' : 'NSE'}
              </span>
            </div>
            <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
              {item.shortName || meta?.name || cleanSymbol}
            </p>
          </div>

          <button
            onClick={() => onRemove(item.symbol)}
            title="Remove from watchlist"
            className="p-1.5 rounded-xl text-amber-400 hover:text-red-400 hover:bg-white/5 transition-colors"
          >
            <Star className="w-4 h-4 fill-amber-400" />
          </button>
        </div>

        {meta?.sector && (
          <div className="mt-2">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {meta.sector}
            </span>
          </div>
        )}
      </div>

      {/* Price & Change Block */}
      <div className="py-2 border-y border-white/5">
        {quote ? (
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-extrabold tracking-tight">
                ₹{quote.currentPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">Real-time quote</div>
            </div>

            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                isPositive
                  ? isDark
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-emerald-50 text-emerald-700'
                  : isDark
                  ? 'bg-red-500/15 text-red-400'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>
                {isPositive ? '+' : ''}
                {quote.percentChange?.toFixed(2)}%
              </span>
            </div>
          </div>
        ) : loading ? (
          <div className="h-10 flex items-center gap-2 text-xs text-gray-500 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Fetching live quotes…</span>
          </div>
        ) : (
          <div className="text-xs text-gray-500">Price unavailable</div>
        )}
      </div>

      {/* Action CTA Buttons */}
      <div className="flex items-center gap-2 pt-1 flex-wrap">
        <button
          type="button"
          onClick={() => onAddToBasket(item)}
          title={inBasket ? 'In Investment Basket' : 'Add to Investment Planning Basket'}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            inBasket
              ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400'
              : isDark
              ? 'border-white/10 hover:bg-white/5 text-gray-300 hover:text-white'
              : 'border-gray-200 hover:bg-gray-100 text-gray-700 hover:text-gray-900'
          }`}
        >
          {inBasket ? <Check className="w-3.5 h-3.5 text-indigo-400" /> : <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />}
          <span>{inBasket ? 'In Basket' : '+ Basket'}</span>
        </button>

        <Button
          variant="success"
          size="sm"
          onClick={() => onTrade(item)}
          className="flex-1 gap-1.5"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Trade</span>
        </Button>

        <Link
          to={`/stock/${item.symbol}`}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            isDark
              ? 'border-white/10 hover:bg-white/5 text-gray-300 hover:text-white'
              : 'border-gray-200 hover:bg-gray-100 text-gray-700 hover:text-gray-900'
          }`}
        >
          <span>Chart</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

/**
 * WatchlistPage — Full Dedicated Watchlist Management Page (/watchlist)
 */
export function WatchlistPage() {
  const { watchlist, addToWatchlist, removeFromWatchlist, theme } = useStockStore();
  const isDark = theme === 'dark';

  const addItemToBasket = useBasketStore((s) => s.addItem);
  const isInBasket = useBasketStore((s) => s.isInBasket);
  const [basketToast, setBasketToast] = useState(null);

  const handleAddToBasket = (item) => {
    const res = addItemToBasket({
      symbol: item.symbol,
      name: item.shortName || item.symbol,
      exchange: item.exchange,
      sector: item.sector,
    });
    setBasketToast(res.message);
    setTimeout(() => setBasketToast(null), 3500);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterExchange, setFilterExchange] = useState('ALL'); // 'ALL' | 'NSE' | 'BSE'
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Search suggestions from INDIAN_STOCKS
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return INDIAN_STOCKS.filter(
      (s) =>
        s.symbol.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query)
    ).slice(0, 6);
  }, [searchQuery]);

  // Filtered watchlist items
  const filteredWatchlist = useMemo(() => {
    return (watchlist || []).filter((item) => {
      if (filterExchange === 'NSE' && !item.symbol.endsWith('.NS')) return false;
      if (filterExchange === 'BSE' && !item.symbol.endsWith('.BO')) return false;
      return true;
    });
  }, [watchlist, filterExchange]);

  const handleAddStock = (stock) => {
    addToWatchlist({
      symbol: stock.symbol,
      shortName: stock.name,
    });
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleAddTopStocks = () => {
    const TOP_5 = [
      { symbol: 'RELIANCE.NS', shortName: 'Reliance Industries Ltd.' },
      { symbol: 'TCS.NS', shortName: 'Tata Consultancy Services' },
      { symbol: 'HDFCBANK.NS', shortName: 'HDFC Bank Ltd.' },
      { symbol: 'INFY.NS', shortName: 'Infosys Ltd.' },
      { symbol: 'ICICIBANK.NS', shortName: 'ICICI Bank Ltd.' },
    ];
    TOP_5.forEach((s) => addToWatchlist(s));
  };

  const handleTrade = (item) => {
    window.dispatchEvent(
      new CustomEvent('vitaldrop_open_trade', {
        detail: {
          stock: {
            symbol: item.symbol,
            name: item.shortName,
            exchange: item.symbol.endsWith('.BO') ? 'BSE' : 'NSE',
          },
          initialAction: 'BUY',
        },
      })
    );
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* ── Page Header ── */}
      <PageHeader
        title="Market Watchlist"
        description="Track real-time price action for your curated Indian stocks, monitor daily performance, and execute simulated trades with one click."
        badge="Live Portfolio Monitor"
        badgeVariant="amber"
        badgeIcon={Star}
        actions={
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-3 py-1.5 rounded-xl border font-bold ${
                isDark ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-700'
              }`}
            >
              {watchlist?.length || 0} Stocks Tracked
            </span>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsSearchOpen((prev) => !prev)}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Ticker</span>
            </Button>
          </div>
        }
      />

      {/* ── Quick Stock Finder Bar ── */}
      {isSearchOpen && (
        <div
          className={`p-4 rounded-2xl border transition-all animate-in fade-in slide-in-from-top-2 relative ${
            isDark ? 'bg-[#0d0d1a] border-violet-500/30' : 'bg-white border-violet-200 shadow-md'
          }`}
        >
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 200+ Indian stocks to add (e.g. Tata Motors, ITC, SBI, RELIANCE.NS)..."
              autoFocus
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border transition-all ${
                isDark
                  ? 'bg-white/5 border-white/10 focus:border-violet-500 text-white placeholder-gray-500'
                  : 'bg-gray-50 border-gray-200 focus:border-violet-500 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          {/* Search Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div
              className={`mt-3 rounded-xl border divide-y overflow-hidden ${
                isDark ? 'bg-[#121224] border-white/10 divide-white/5' : 'bg-white border-gray-200 divide-gray-100 shadow-lg'
              }`}
            >
              {suggestions.map((stock) => {
                const isAlreadyAdded = (watchlist || []).some((w) => w.symbol === stock.symbol);
                return (
                  <div
                    key={stock.symbol}
                    className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{stock.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                          {stock.exchange || 'NSE'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{stock.name} • {stock.sector}</p>
                    </div>

                    <button
                      onClick={() => handleAddStock(stock)}
                      disabled={isAlreadyAdded}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        isAlreadyAdded
                          ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                          : 'bg-violet-600 hover:bg-violet-500 text-white'
                      }`}
                    >
                      {isAlreadyAdded ? 'Added' : 'Add to List'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Filter Tabs ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-1 border-b border-white/10">
        <div className="flex items-center gap-2">
          {['ALL', 'NSE', 'BSE'].map((ex) => (
            <button
              key={ex}
              onClick={() => setFilterExchange(ex)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterExchange === ex
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : isDark
                  ? 'text-gray-400 hover:text-white hover:bg-white/5'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {ex === 'ALL' ? 'All Exchanges' : `${ex} Stocks`}
            </button>
          ))}
        </div>

        <Link
          to="/market"
          className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
        >
          Browse All 200+ Market Stocks →
        </Link>
      </div>

      {/* ── Watchlist Cards Grid or EmptyState ── */}
      {filteredWatchlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredWatchlist.map((item) => (
            <WatchlistStockCard
              key={item.symbol}
              item={item}
              onRemove={removeFromWatchlist}
              onTrade={handleTrade}
              onAddToBasket={handleAddToBasket}
              inBasket={isInBasket(item.symbol)}
              isDark={isDark}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Star}
          title="Your Watchlist is Empty"
          description="You haven't pinned any stocks to your watchlist yet. Add top Indian equities to track live market trends and trade seamlessly."
          actionLabel="Add Top 5 Blue-Chip Stocks"
          onAction={handleAddTopStocks}
          isDark={isDark}
        />
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

export default WatchlistPage;
