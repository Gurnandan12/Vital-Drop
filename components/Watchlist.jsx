'use client';
import { useEffect, useState, useCallback } from 'react';
import { Star, X, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import { useStockStore } from '@/store/stockStore';
import { fetchWithTimeout, validateQuote } from '@/lib/fetcher';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

/* ── Exchange badge helper ── */
function ExchangeBadge({ symbol, isDark }) {
    if (symbol.endsWith('.NS'))
        return (
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isDark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>
                NSE
            </span>
        );
    if (symbol.endsWith('.BO'))
        return (
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isDark ? 'bg-orange-500/15 text-orange-400' : 'bg-orange-50 text-orange-500'}`}>
                BSE
            </span>
        );
    return null;
}

function MiniQuote({ symbol }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const { theme } = useStockStore();
    const isDark = theme === 'dark';

    const fetchQuote = useCallback(async () => {
        setLoading(true);
        setHasError(false);
        try {
            const res = await fetchWithTimeout(`/api/quote?symbol=${encodeURIComponent(symbol)}`, { timeout: 8000 });
            const validated = validateQuote(res.data);
            if (validated && typeof validated.currentPrice === 'number') {
                setData({
                    symbol: validated.symbol,
                    currentPrice: validated.currentPrice,
                    percentChange: validated.percentChange,
                });
            } else {
                setHasError(true);
            }
        } catch {
            setHasError(true);
        } finally {
            setLoading(false);
        }
    }, [symbol]);

    useEffect(() => {
        fetchQuote();
    }, [fetchQuote]);

    const isPositive = (data?.percentChange ?? 0) >= 0;
    const displaySymbol = symbol.replace(/\.(NS|BO)$/, '');

    return (
        <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                {loading ? (
                    <LoadingSkeleton width="20px" height="20px" variant="circle" isDark={isDark} />
                ) : hasError ? (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                ) : isPositive ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{displaySymbol}</p>
                    <ExchangeBadge symbol={symbol} isDark={isDark} />
                </div>
                {loading ? (
                    <LoadingSkeleton width="48px" height="12px" variant="text" isDark={isDark} className="mt-1" />
                ) : hasError ? (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            fetchQuote();
                        }}
                        className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 mt-0.5"
                    >
                        <RefreshCw className="w-2.5 h-2.5" /> Retry
                    </button>
                ) : data && typeof data.percentChange === 'number' ? (
                    <p className={`text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{data.percentChange.toFixed(2)}%
                    </p>
                ) : (
                    <p className="text-[11px] text-gray-500">--</p>
                )}
            </div>

            {loading ? (
                <LoadingSkeleton width="60px" height="16px" variant="rect" isDark={isDark} />
            ) : hasError ? (
                <span className="text-xs text-gray-500">Unavailable</span>
            ) : data && typeof data.currentPrice === 'number' ? (
                <span className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    ₹{data.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            ) : (
                <span className="text-sm font-bold text-gray-500">--</span>
            )}
        </div>
    );
}

export function Watchlist() {
    const { watchlist, removeFromWatchlist, setSelectedStock, selectedSymbol, theme } = useStockStore();
    const isDark = theme === 'dark';

    return (
        <div className={`rounded-2xl border p-5 ${isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-violet-400 fill-violet-400" />
                <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Watchlist</h3>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                    {watchlist.length}
                </span>
            </div>
            <p className={`text-[11px] mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Indian Market · Prices in ₹</p>

            {watchlist.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No stocks in watchlist</p>
                    <p className="text-xs opacity-60">Search and add Indian stocks above</p>
                </div>
            ) : (
                <div className="flex flex-col gap-1">
                    {watchlist.map((item) => (
                        <div
                            key={item.symbol}
                            onClick={() => setSelectedStock(item.symbol, item.shortName)}
                            className={`group relative flex flex-col gap-2 px-3 py-3 rounded-xl cursor-pointer transition-all ${
                                selectedSymbol === item.symbol
                                    ? isDark
                                        ? 'bg-violet-500/10 ring-1 ring-violet-500/30'
                                        : 'bg-violet-50 ring-1 ring-violet-300'
                                    : isDark
                                    ? 'hover:bg-white/4'
                                    : 'hover:bg-gray-50'
                            }`}
                        >
                            <MiniQuote symbol={item.symbol} />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFromWatchlist(item.symbol);
                                }}
                                aria-label={`Remove ${item.symbol} from watchlist`}
                                className={`absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg ${
                                    isDark ? 'hover:bg-white/10 text-gray-500' : 'hover:bg-gray-200 text-gray-400'
                                }`}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Watchlist;
