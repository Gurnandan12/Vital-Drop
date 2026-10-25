'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, Star, StarOff } from 'lucide-react';
import { useStockStore } from '@/store/stockStore';
import { fetchWithTimeout, validateQuote } from '@/lib/fetcher';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { DataUpdatedLabel } from '@/components/ui/DataUpdatedLabel';

/* ── Indian number formatter: Cr / L / plain ── */
function formatMarketCap(n) {
    if (!n || typeof n !== 'number' || !isFinite(n))
        return '--';
    if (n >= 1_00_00_00_00_000)
        return `₹${(n / 1_00_00_00_00_000).toFixed(2)} L Cr`;
    if (n >= 1_00_00_000)
        return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
    if (n >= 1_00_000)
        return `₹${(n / 1_00_000).toFixed(2)} L`;
    if (n >= 1_000)
        return `₹${(n / 1_000).toFixed(2)} K`;
    return `₹${n.toLocaleString('en-IN')}`;
}

function formatVolume(n) {
    if (!n || typeof n !== 'number' || !isFinite(n))
        return '--';
    if (n >= 1_00_00_000)
        return `${(n / 1_00_00_000).toFixed(2)} Cr`;
    if (n >= 1_00_000)
        return `${(n / 1_00_00_000).toFixed(2)} L`;
    if (n >= 1_000)
        return `${(n / 1_000).toFixed(2)} K`;
    return n.toLocaleString('en-IN');
}

/* ── Derive exchange badge from symbol ── */
function getExchangeBadge(symbol) {
    if (!symbol)
        return null;
    if (symbol.endsWith('.NS'))
        return { label: 'NSE Listed', className: 'bg-blue-500/15 text-blue-400 border border-blue-500/25' };
    if (symbol.endsWith('.BO'))
        return { label: 'BSE Listed', className: 'bg-orange-500/15 text-orange-400 border border-orange-500/25' };
    if (symbol.startsWith('^'))
        return { label: 'Index', className: 'bg-violet-500/15 text-violet-400 border border-violet-500/25' };
    return { label: 'NSE', className: 'bg-blue-500/15 text-blue-400 border border-blue-500/25' };
}

export function StockHeader() {
    const { selectedSymbol, selectedName, addToWatchlist, removeFromWatchlist, isInWatchlist, theme } = useStockStore();
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [errorType, setErrorType] = useState(null);
    const [isStale, setIsStale] = useState(false);
    const [meta, setMeta] = useState({ timestamp: null, source: 'api' });

    const isDark = theme === 'dark';
    const inWatchlist = selectedSymbol ? isInWatchlist(selectedSymbol) : false;
    const abortControllerRef = useRef(null);

    const loadQuote = useCallback(async (isBackground = false) => {
        if (!selectedSymbol) return;

        // Abort previous in-flight request to avoid race conditions
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
            const res = await fetchWithTimeout(`/api/quote?symbol=${encodeURIComponent(selectedSymbol)}`, {
                signal: controller.signal,
                timeout: 10000,
            });

            const validated = validateQuote(res.data);
            if (!validated) {
                throw new Error('Received incomplete market data payload for this ticker.');
            }

            setQuote(validated);
            setMeta({
                timestamp: res.timestamp || new Date().toISOString(),
                source: res.source || 'api',
            });
            setError(null);
            setErrorType(null);
            setIsStale(false);
        } catch (err) {
            if (err.name === 'AbortError') return;

            const errType = err.type || 'GENERIC';
            setErrorType(errType);
            setError(err.message || 'Failed to retrieve stock quote.');

            // If we already have quote data, retain it but mark it as stale
            if (quote) {
                setIsStale(true);
            }
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [selectedSymbol, quote]);

    useEffect(() => {
        // Reset quote when symbol changes
        setQuote(null);
        setError(null);
        loadQuote(false);

        const interval = setInterval(() => {
            loadQuote(true);
        }, 30_000);

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            clearInterval(interval);
        };
    }, [selectedSymbol]); // eslint-disable-line react-hooks/exhaustive-deps

    // Format ₹ price
    const fmtPrice = (v) => {
        if (v === undefined || v === null || typeof v !== 'number' || !isFinite(v)) return '--';
        return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const isPositive = (quote?.percentChange ?? 0) >= 0;
    const changeColor = isPositive ? 'text-emerald-400' : 'text-red-400';
    const changeBg = isPositive ? 'bg-emerald-400/10' : 'bg-red-400/10';
    const exchangeBadge = getExchangeBadge(quote?.symbol ?? selectedSymbol ?? '');

    const getMarketStateBadge = () => {
        if (!quote) return null;
        const ms = quote.marketState;
        if (ms === 'REGULAR')
            return <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">● Market Open</span>;
        if (ms === 'PRE')
            return <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">● Pre-Market</span>;
        if (ms === 'POST')
            return <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-medium">● After Hours</span>;
        return <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full font-medium">● Market Closed</span>;
    };

    // If initial loading without any previous quote
    if (loading && !quote) {
        return (
            <div className={`rounded-2xl border p-5 ${isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200'}`}>
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <LoadingSkeleton width="180px" height="32px" variant="rect" isDark={isDark} />
                        <LoadingSkeleton width="240px" height="18px" variant="text" isDark={isDark} />
                    </div>
                    <LoadingSkeleton width="130px" height="36px" variant="rect" isDark={isDark} />
                </div>
                <div className="mt-5 flex items-baseline gap-4">
                    <LoadingSkeleton width="160px" height="40px" variant="rect" isDark={isDark} />
                    <LoadingSkeleton width="100px" height="26px" variant="rect" isDark={isDark} />
                </div>
                <div className={`mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className={`rounded-xl p-3 ${isDark ? 'bg-white/3' : 'bg-gray-50'}`}>
                            <LoadingSkeleton width="60px" height="12px" variant="text" isDark={isDark} className="mb-2" />
                            <LoadingSkeleton width="90px" height="18px" variant="text" isDark={isDark} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // If initial load failed completely without cached quote
    if (error && !quote) {
        return (
            <div className={`rounded-2xl border p-5 ${isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200'}`}>
                <ErrorState
                    errorType={errorType || 'GENERIC'}
                    message={error}
                    onRetry={() => loadQuote(false)}
                    isDark={isDark}
                />
            </div>
        );
    }

    return (
        <div className={`rounded-2xl border p-5 transition-all ${isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200'}`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-1">
                    {/* Symbol + name + badges */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {(quote?.symbol ?? selectedSymbol ?? '').replace(/\.(NS|BO)$/, '')}
                        </h2>
                        {exchangeBadge && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${exchangeBadge.className}`}>
                                {exchangeBadge.label}
                            </span>
                        )}
                        {getMarketStateBadge()}
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {quote?.shortName ?? selectedName}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Honest data freshness indicator */}
                    <DataUpdatedLabel
                        timestamp={meta.timestamp}
                        source={meta.source}
                        isStale={isStale}
                        onRefresh={() => loadQuote(true)}
                        isRefreshing={isRefreshing}
                        isDark={isDark}
                    />

                    {/* Watchlist button */}
                    <button
                        onClick={() => {
                            if (!selectedSymbol) return;
                            if (inWatchlist) {
                                removeFromWatchlist(selectedSymbol);
                            } else {
                                addToWatchlist({
                                    symbol: selectedSymbol,
                                    shortName: quote?.shortName ?? selectedName ?? '',
                                });
                            }
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                            inWatchlist
                                ? isDark
                                    ? 'border-violet-500/50 text-violet-400 bg-violet-500/10 hover:bg-violet-500/20'
                                    : 'border-violet-400 text-violet-600 bg-violet-50'
                                : isDark
                                ? 'border-white/10 text-gray-400 hover:border-violet-500/50 hover:text-violet-400'
                                : 'border-gray-200 text-gray-500 hover:border-violet-400 hover:text-violet-600'
                        }`}
                    >
                        {inWatchlist ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                        {inWatchlist ? 'Watchlisted' : 'Add to Watchlist'}
                    </button>
                </div>
            </div>

            {/* Price Row */}
            <div className="mt-4 flex items-end gap-4 flex-wrap">
                {quote ? (
                    <>
                        <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {fmtPrice(quote.currentPrice)}
                        </span>
                        {quote.percentChange !== undefined && quote.percentChange !== null && (
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold ${changeBg} ${changeColor}`}>
                                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {isPositive ? '+' : ''}₹{Math.abs(quote.change || 0).toFixed(2)} ({isPositive ? '+' : ''}
                                {quote.percentChange.toFixed(2)}%)
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-sm text-gray-500">Select a stock to see pricing</p>
                )}
            </div>

            {/* Stats Grid */}
            {quote && (
                <div className={`mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                    {[
                        { label: 'Open', value: fmtPrice(quote.open) },
                        { label: 'High', value: fmtPrice(quote.high) },
                        { label: 'Low', value: fmtPrice(quote.low) },
                        { label: 'Volume', value: formatVolume(quote.volume) },
                        { label: 'Market Cap', value: formatMarketCap(quote.marketCap) },
                        { label: '52W High', value: fmtPrice(quote.fiftyTwoWeekHigh) },
                        { label: '52W Low', value: fmtPrice(quote.fiftyTwoWeekLow) },
                        {
                            label: 'Exchange',
                            value: quote.symbol.endsWith('.NS') ? 'NSE' : quote.symbol.endsWith('.BO') ? 'BSE' : 'IDX',
                        },
                    ].map((s) => (
                        <div key={s.label} className={`rounded-xl p-3 ${isDark ? 'bg-white/3' : 'bg-gray-50'}`}>
                            <p className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{s.label}</p>
                            <p className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{s.value}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
export default StockHeader;
