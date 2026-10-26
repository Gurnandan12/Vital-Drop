'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  X,
  Clock,
  Star,
  Check,
  TrendingUp,
  Globe,
  Building,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useWatchlistStore } from '@/store/watchlistStore';

const POPULAR_STOCKS = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', exchange: 'NSE', currency: 'INR' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE', currency: 'INR' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', exchange: 'NSE', currency: 'INR' },
  { symbol: 'INFY.NS', name: 'Infosys', exchange: 'NSE', currency: 'INR' },
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', currency: 'USD' },
];

export function StockSearchSelect({
  selectedSymbol,
  onSelectPrimary,
  compareSymbols = [],
  onAddCompare,
  onRemoveCompare,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);

  const { addItem, isInWatchlist } = useWatchlistStore();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('vitaldrop_recent_stocks');
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    } catch {}
  }, []);

  const saveRecentSearch = (stock) => {
    try {
      const updated = [stock, ...recentSearches.filter((s) => s.symbol !== stock.symbol)].slice(
        0,
        6
      );
      setRecentSearches(updated);
      localStorage.setItem('vitaldrop_recent_stocks', JSON.stringify(updated));
    } catch {}
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search query
  useEffect(() => {
    if (!query.trim() || query.length < 1) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setResults(json.data);
        }
      } catch (err) {
        console.warn('Search query failed:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (stock, asCompare = false) => {
    saveRecentSearch(stock);
    setIsOpen(false);
    setQuery('');
    if (asCompare) {
      onAddCompare(stock.symbol);
    } else {
      onSelectPrimary(stock.symbol);
    }
  };

  const handleAddToWatchlist = (e, stock) => {
    e.stopPropagation();
    addItem({
      symbol: stock.symbol,
      shortName: stock.shortname || stock.name || stock.symbol,
      exchange: stock.exchange,
    });
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      {/* Search Bar Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search Indian (NSE/BSE) or US equities (e.g., RELIANCE, TCS, AAPL, NVDA)..."
            className="w-full pl-10 pr-10 py-3 bg-[#121226] border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-inner"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Popular Pills */}
        <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <span className="text-gray-500 shrink-0 mr-1">Popular:</span>
          {POPULAR_STOCKS.slice(0, 5).map((pop) => (
            <button
              key={pop.symbol}
              onClick={() => onSelectPrimary(pop.symbol)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                selectedSymbol === pop.symbol
                  ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {pop.symbol.replace('.NS', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Basket Tags Bar */}
      {compareSymbols.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
          <span className="text-gray-400 font-medium">Comparison Basket:</span>
          {compareSymbols.map((sym) => (
            <span
              key={sym}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-mono"
            >
              <span>{sym}</span>
              <button
                onClick={() => onRemoveCompare(sym)}
                className="hover:text-white text-indigo-400 transition-colors"
                title="Remove from comparison"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <span className="text-gray-500">({compareSymbols.length}/4 max)</span>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0e0e1e] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[420px] overflow-y-auto backdrop-blur-xl">
          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-3 border-b border-white/5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Recent Searches</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {recentSearches.map((rec) => (
                  <div
                    key={rec.symbol}
                    onClick={() => handleSelect(rec)}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-violet-600/20 hover:border-violet-500/30 border border-transparent cursor-pointer transition-colors"
                  >
                    <div className="truncate">
                      <span className="text-white text-xs font-semibold block">{rec.symbol}</span>
                      <span className="text-gray-400 text-[11px] truncate block">
                        {rec.shortname || rec.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          {results.length > 0 ? (
            <div className="p-2 space-y-1">
              <div className="px-2 py-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Matching Equities
              </div>
              {results.map((item) => {
                const inWatchlist = isInWatchlist(item.symbol);
                const isSelected = selectedSymbol === item.symbol;
                const isCompared = compareSymbols.includes(item.symbol);

                return (
                  <div
                    key={item.symbol}
                    onClick={() => handleSelect(item)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-violet-600/25 border border-violet-500/40 text-white'
                        : 'hover:bg-white/5 text-gray-300 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10 font-bold text-xs text-violet-300">
                        {item.symbol.slice(0, 2)}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white">{item.symbol}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                              item.currency === 'INR'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {item.exchange || 'STOCK'} • {item.currency || 'INR'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {item.shortname || item.name || item.symbol}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {/* Compare Button */}
                      {!isSelected && !isCompared && compareSymbols.length < 4 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(item, true);
                          }}
                          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-indigo-600 hover:text-white text-gray-400 text-xs border border-white/10 transition-colors flex items-center gap-1"
                          title="Add to comparison"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Compare</span>
                        </button>
                      )}

                      {/* Watchlist Star */}
                      <button
                        onClick={(e) => handleAddToWatchlist(e, item)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          inWatchlist
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                            : 'border-white/10 text-gray-400 hover:text-amber-400 hover:border-amber-400/30'
                        }`}
                        title={inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                      >
                        <Star className={`w-3.5 h-3.5 ${inWatchlist ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : query && !loading ? (
            <div className="p-6 text-center text-gray-400">
              <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-300">No matching equities found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-gray-500 mt-1">
                Try searching by NSE symbol (e.g. RELIANCE, TCS) or US ticker (e.g. AAPL, NVDA).
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
