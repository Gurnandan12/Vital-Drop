'use client';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import dynamic from 'next/dynamic';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Star,
  StarOff,
  AlertTriangle,
  Wallet,
  ShoppingCart,
  CheckCircle2,
  ShoppingBag,
  Check,
} from 'lucide-react';
import { useStockStore } from '@/store/stockStore';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useBasketStore } from '@/store/basketStore';
import { INDIAN_STOCKS } from '@/lib/indianStocks';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { ChartSkeleton } from '../ui/ChartSkeleton';
import { ErrorState } from '../ui/ErrorState';
import { DataUpdatedLabel } from '../ui/DataUpdatedLabel';
import { fetchWithTimeout, validateQuote } from '@/lib/fetcher';

// Dynamic import of chart
const StockChart = dynamic(() => import('@/components/StockChart').then((m) => ({ default: m.StockChart })), {
  ssr: false,
  loading: () => <ChartSkeleton height="380px" />,
});

/**
 * StockDetailPage — Dynamic Route Component (/stock/:symbol)
 * Demonstrates:
 * - Dynamic Routes & Route Parameters (useParams)
 * - Live resilient data fetching with timeout, abort controller, and auto-refresh
 * - Honest handling of API errors, network failures, rate limiting, and stale data
 * - Controlled trade execution terminal with usePortfolio
 * - Reusable LoadingSkeleton and ErrorState with Retry actions
 */
export function StockDetailPage() {
  const { symbol } = useParams();
  const { theme, setSelectedStock, addToWatchlist, removeFromWatchlist, isInWatchlist } = useStockStore();
  const { balance, getHolding, buyStock, sellStock } = usePortfolio();

  const isDark = theme === 'dark';
  const cleanSymbol = (symbol || '').toUpperCase();

  // Find local metadata if available
  const localStockMeta = useMemo(() => {
    return INDIAN_STOCKS.find((s) => s.symbol.toUpperCase() === cleanSymbol) || null;
  }, [cleanSymbol]);

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [isStale, setIsStale] = useState(false);
  const [meta, setMeta] = useState({ timestamp: null, source: 'api' });

  // Local embedded trade form state
  const [tradeAction, setTradeAction] = useState('BUY');
  const [quantity, setQuantity] = useState('5');
  const [tradeStatus, setTradeStatus] = useState(null);

  const holding = getHolding(cleanSymbol);
  const inWatchlist = isInWatchlist(cleanSymbol);

  // Basket Store Integration
  const addItemToBasket = useBasketStore((s) => s.addItem);
  const removeItemFromBasket = useBasketStore((s) => s.removeItem);
  const isInBasket = useBasketStore((s) => s.isInBasket);
  const inBasket = isInBasket(cleanSymbol);
  const [basketToast, setBasketToast] = useState(null);

  const abortControllerRef = useRef(null);

  const fetchQuoteData = useCallback(
    async (isBackground = false) => {
      if (!cleanSymbol) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (isBackground) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const json = await fetchWithTimeout(`/api/quote?symbol=${encodeURIComponent(cleanSymbol)}`, {
          signal: controller.signal,
          timeout: 10000,
        });

        const validated = validateQuote(json.data);
        if (!validated) {
          throw new Error(`Market data unavailable for ticker ${cleanSymbol}.`);
        }

        setQuote(validated);
        setMeta({
          timestamp: json.timestamp || new Date().toISOString(),
          source: json.source || 'api',
        });
        setError(null);
        setErrorType(null);
        setIsStale(false);
      } catch (err) {
        if (err.name === 'AbortError') return;

        const classifiedType = err.type || 'GENERIC';
        setErrorType(classifiedType);
        setError(err.message || 'Unable to retrieve current market quote.');

        // If previous quote existed, preserve it but mark as stale
        if (quote) {
          setIsStale(true);
        }
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [cleanSymbol, quote]
  );

  // Synchronize with global selected stock and fetch live quote
  useEffect(() => {
    if (!cleanSymbol) return;

    setSelectedStock(cleanSymbol, localStockMeta?.name || cleanSymbol);
    setQuote(null);
    setError(null);

    fetchQuoteData(false);
    const interval = setInterval(() => {
      fetchQuoteData(true);
    }, 30000);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      clearInterval(interval);
    };
  }, [cleanSymbol, localStockMeta, setSelectedStock]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentPrice = quote?.currentPrice;
  const isPriceValid = typeof currentPrice === 'number' && isFinite(currentPrice) && currentPrice > 0;
  const isPositive = (quote?.percentChange ?? 0) >= 0;
  const parsedQty = parseInt(quantity, 10) || 0;
  const totalCost = isPriceValid ? parsedQty * currentPrice : 0;

  // Handle direct trade execution from page
  const handleExecuteTrade = (e) => {
    e.preventDefault();
    setTradeStatus(null);

    if (!isPriceValid) {
      setTradeStatus({ type: 'error', message: 'Trade cannot be placed without a verified market price.' });
      return;
    }

    let result;
    if (tradeAction === 'BUY') {
      result = buyStock(
        {
          symbol: cleanSymbol,
          name: quote?.shortName || localStockMeta?.name || cleanSymbol,
          exchange: localStockMeta?.exchange || (cleanSymbol.endsWith('.BO') ? 'BSE' : 'NSE'),
          sector: localStockMeta?.sector || 'General',
        },
        parsedQty,
        currentPrice
      );
    } else {
      result = sellStock(
        {
          symbol: cleanSymbol,
          name: quote?.shortName || localStockMeta?.name || cleanSymbol,
        },
        parsedQty,
        currentPrice
      );
    }

    if (result.success) {
      setTradeStatus({ type: 'success', message: result.message });
      setTimeout(() => setTradeStatus(null), 4000);
    } else {
      setTradeStatus({ type: 'error', message: result.message });
    }
  };

  // Format INR price helper honestly
  const fmt = (v) =>
    typeof v === 'number' && isFinite(v)
      ? `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : '--';

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* ── Breadcrumb & Back Navigation ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
          <Link to="/market" className="hover:text-violet-400 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Market</span>
          </Link>
          <span>/</span>
          <span className={isDark ? 'text-white' : 'text-gray-900'}>{cleanSymbol}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Basket toggle */}
          <button
            type="button"
            disabled={!isPriceValid && !quote}
            onClick={() => {
              if (inBasket) {
                removeItemFromBasket(cleanSymbol);
                setBasketToast(`Removed ${cleanSymbol} from basket.`);
              } else {
                const res = addItemToBasket({
                  symbol: cleanSymbol,
                  name: quote?.shortName || localStockMeta?.name || cleanSymbol,
                  exchange: cleanSymbol.endsWith('.BO') ? 'BSE' : 'NSE',
                  sector: localStockMeta?.sector || 'General',
                  price: isPriceValid ? currentPrice : 0,
                });
                setBasketToast(res.message);
              }
              setTimeout(() => setBasketToast(null), 3500);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              inBasket
                ? 'border-indigo-500/50 text-indigo-400 bg-indigo-500/10'
                : 'border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {inBasket ? <Check className="w-3.5 h-3.5 text-indigo-400" /> : <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{inBasket ? 'In Basket' : '+ Add to Basket'}</span>
          </button>

          {/* Watchlist toggle */}
          <button
            onClick={() => {
              if (inWatchlist) removeFromWatchlist(cleanSymbol);
              else addToWatchlist({ symbol: cleanSymbol, shortName: quote?.shortName || localStockMeta?.name || cleanSymbol });
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              inWatchlist
                ? 'border-violet-500/50 text-violet-400 bg-violet-500/10'
                : 'border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {inWatchlist ? <Star className="w-3.5 h-3.5 fill-current" /> : <StarOff className="w-3.5 h-3.5" />}
            <span>{inWatchlist ? 'Watchlisted' : 'Add to Watchlist'}</span>
          </button>
        </div>
      </div>

      {/* ── Main Stock Overview Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left Column: Ticker Header + Interactive Chart + Metrics */}
        <div className="space-y-6">
          {/* Header Card */}
          <div
            className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            {loading && !quote ? (
              <div className="space-y-3">
                <LoadingSkeleton width="220px" height="36px" variant="rect" isDark={isDark} />
                <LoadingSkeleton width="180px" height="20px" variant="text" isDark={isDark} />
                <div className="pt-2">
                  <LoadingSkeleton width="160px" height="40px" variant="rect" isDark={isDark} />
                </div>
              </div>
            ) : error && !quote ? (
              <ErrorState
                errorType={errorType || 'GENERIC'}
                message={error}
                onRetry={() => fetchQuoteData(false)}
                isDark={isDark}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{cleanSymbol}</h1>
                      <Badge variant={cleanSymbol.endsWith('.BO') ? 'bse' : 'nse'}>
                        {cleanSymbol.endsWith('.BO') ? 'BSE Listed' : 'NSE Listed'}
                      </Badge>
                      {localStockMeta?.sector && <Badge variant="primary">{localStockMeta.sector}</Badge>}
                      {localStockMeta?.capCategory && <Badge variant="largeCap">{localStockMeta.capCategory}</Badge>}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{quote?.shortName || localStockMeta?.name}</p>
                  </div>

                  {/* Price Display */}
                  <div className="text-right">
                    <p className="text-3xl sm:text-4xl font-black">{fmt(quote?.currentPrice)}</p>
                    {quote?.percentChange !== undefined && quote?.percentChange !== null && (
                      <div
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md mt-1 ${
                          isPositive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span>
                          {isPositive ? '+' : ''}₹{Math.abs(quote?.change || 0).toFixed(2)} ({isPositive ? '+' : ''}
                          {(quote?.percentChange || 0).toFixed(2)}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <DataUpdatedLabel
                    timestamp={meta.timestamp}
                    source={meta.source}
                    isStale={isStale}
                    onRefresh={() => fetchQuoteData(true)}
                    isRefreshing={isRefreshing}
                    isDark={isDark}
                  />
                  {quote?.marketState && (
                    <span className="text-[11px] font-medium text-gray-400">
                      Market: {quote.marketState}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Chart */}
          <StockChart />

          {/* Key Fundamentals Grid */}
          {quote && (
            <div
              className={`p-6 rounded-3xl border ${
                isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
                Key Fundamentals &amp; Trading Range
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Day's Open", value: fmt(quote.open) },
                  { label: "Day's High", value: fmt(quote.high) },
                  { label: "Day's Low", value: fmt(quote.low) },
                  { label: '52W High', value: fmt(quote.fiftyTwoWeekHigh) },
                  { label: '52W Low', value: fmt(quote.fiftyTwoWeekLow) },
                  {
                    label: 'Volume',
                    value: typeof quote.volume === 'number' && isFinite(quote.volume) ? quote.volume.toLocaleString('en-IN') : '--',
                  },
                  { label: 'Exchange', value: cleanSymbol.endsWith('.BO') ? 'BSE' : 'NSE' },
                  { label: 'Settlement', value: 'T+1 Live' },
                ].map((item) => (
                  <div key={item.label} className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <p className="text-[11px] text-gray-400 mb-0.5">{item.label}</p>
                    <p className="text-sm font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Order Terminal & Current Holding */}
        <div className="space-y-6">
          {/* Current Holding Banner */}
          {holding ? (
            <div className="p-5 rounded-3xl border border-blue-500/20 bg-blue-500/10 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>You Own This Stock</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Quantity Owned:</span>
                <span className="font-bold">{holding.quantity} shares</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Avg. Purchase Price:</span>
                <span className="font-bold">{fmt(holding.avgBuyPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Total Cost Basis:</span>
                <span className="font-bold">{fmt(holding.totalInvested)}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-3xl border border-white/5 bg-white/[0.02] text-xs text-gray-400 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-violet-400" />
              <span>You currently do not hold shares of {cleanSymbol}.</span>
            </div>
          )}

          {/* Embedded Order Execution Form */}
          <div
            className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-violet-400" />
                <span>Instant Execution Terminal</span>
              </h3>
              <span className="text-xs text-emerald-400 font-semibold">
                ₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Free Cash
              </span>
            </div>

            {tradeStatus && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
                  tradeStatus.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                }`}
              >
                {tradeStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{tradeStatus.message}</span>
              </div>
            )}

            {!isPriceValid && !loading && (
              <div className="p-3 mb-4 rounded-xl text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Market price unavailable. Real-time pricing is required for trade execution.</span>
              </div>
            )}

            <form onSubmit={handleExecuteTrade} className="space-y-4 text-xs">
              {/* Action Tab */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setTradeAction('BUY')}
                  className={`py-2 font-bold rounded-lg transition-all ${
                    tradeAction === 'BUY'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setTradeAction('SELL')}
                  className={`py-2 font-bold rounded-lg transition-all ${
                    tradeAction === 'SELL'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  SELL
                </button>
              </div>

              {/* Quantity Input */}
              <div>
                <label htmlFor="detail-quantity" className="block font-semibold text-gray-400 mb-1">
                  Quantity (Shares)
                </label>
                <input
                  id="detail-quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl font-medium border outline-none ${
                    isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                />
              </div>

              {/* Cost Summary */}
              <div className="p-3 rounded-xl border border-white/5 space-y-1 bg-white/[0.02]">
                <div className="flex justify-between text-gray-400">
                  <span>Price per Share:</span>
                  <span>{fmt(currentPrice)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-white pt-1 border-t border-white/10">
                  <span>Total {tradeAction === 'BUY' ? 'Payable' : 'Receivable'}:</span>
                  <span className={tradeAction === 'BUY' ? 'text-violet-400' : 'text-emerald-400'}>
                    {fmt(totalCost)}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant={tradeAction === 'BUY' ? 'primary' : 'danger'}
                size="md"
                className="w-full"
                disabled={
                  !isPriceValid ||
                  parsedQty <= 0 ||
                  (tradeAction === 'BUY' && totalCost > balance) ||
                  (tradeAction === 'SELL' && (!holding || holding.quantity < parsedQty))
                }
              >
                {!isPriceValid ? 'Price Required' : `Place ${tradeAction} Order`}
              </Button>
            </form>
          </div>
        </div>
      </div>

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

export default StockDetailPage;
