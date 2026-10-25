'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, BarChart2, RefreshCw } from 'lucide-react';
import { useStockStore } from '@/store/stockStore';
import { fetchWithTimeout, validateQuote } from '@/lib/fetcher';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

const BENCHMARKS = [
    { symbol: '^NSEI', label: 'Nifty 50' },
    { symbol: '^BSESN', label: 'Sensex' },
];

function useBenchmark(symbol, label) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const abortRef = useRef(null);

    const fetchQuote = useCallback(async (isBackground = false) => {
        if (abortRef.current) {
            abortRef.current.abort();
        }
        const controller = new AbortController();
        abortRef.current = controller;

        if (!isBackground) {
            setLoading(true);
            setHasError(false);
        }

        try {
            const res = await fetchWithTimeout(`/api/quote?symbol=${encodeURIComponent(symbol)}`, {
                signal: controller.signal,
                timeout: 8000,
            });
            const validated = validateQuote(res.data);
            if (validated && typeof validated.currentPrice === 'number') {
                setData({
                    symbol,
                    label,
                    price: validated.currentPrice,
                    change: validated.change,
                    percentChange: validated.percentChange,
                });
                setHasError(false);
            } else {
                if (!isBackground) setHasError(true);
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
            if (!isBackground) setHasError(true);
        } finally {
            setLoading(false);
        }
    }, [symbol, label]);

    useEffect(() => {
        fetchQuote(false);
        const id = setInterval(() => {
            fetchQuote(true);
        }, 60_000); // refresh every minute

        return () => {
            if (abortRef.current) abortRef.current.abort();
            clearInterval(id);
        };
    }, [fetchQuote]);

    return { data, loading, hasError, refetch: () => fetchQuote(false) };
}

function BenchmarkPill({ symbol, label, isDark, onClick }) {
    const { data, loading, hasError, refetch } = useBenchmark(symbol, label);

    if (loading && !data) {
        return (
            <div className="flex items-center gap-2">
                <LoadingSkeleton width="130px" height="38px" variant="rect" isDark={isDark} />
            </div>
        );
    }

    if (hasError && !data) {
        return (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
                isDark ? 'bg-white/3 border-white/5 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}>
                <span className="font-semibold">{label}: Offline</span>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        refetch();
                    }}
                    className="p-1 hover:text-violet-400"
                    title="Retry loading benchmark"
                >
                    <RefreshCw className="w-3 h-3" />
                </button>
            </div>
        );
    }

    if (!data) return null;

    const isUp = (data.percentChange ?? 0) >= 0;
    const color = isUp ? 'text-emerald-400' : 'text-red-400';
    const bg = isUp
        ? isDark ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
        : isDark ? 'bg-red-500/8 border-red-500/20' : 'bg-red-50 border-red-200';

    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${bg}`}
        >
            <div className="flex flex-col items-start">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {label}
                </span>
                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ₹{data.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </div>
            {data.percentChange !== undefined && data.percentChange !== null && (
                <div className={`flex items-center gap-1 text-xs font-bold ${color}`}>
                    {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{isUp ? '+' : ''}{data.percentChange.toFixed(2)}%</span>
                </div>
            )}
        </button>
    );
}

export function IndianMarketBenchmarks({ isDark }) {
    const { setSelectedStock } = useStockStore();

    return (
        <div className={`rounded-2xl border px-5 py-3.5 flex items-center gap-4 flex-wrap ${
            isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-100 shadow-sm'
        }`}>
            {/* Label */}
            <div className="flex items-center gap-2 mr-1">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow shadow-blue-500/30">
                    <BarChart2 className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                    <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Indian Market</p>
                    <p className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Live Benchmarks</p>
                </div>
            </div>

            <div className="w-px h-8 bg-white/8 hidden sm:block" />

            {/* Benchmark pills */}
            {BENCHMARKS.map((b) => (
                <BenchmarkPill
                    key={b.symbol}
                    symbol={b.symbol}
                    label={b.label}
                    isDark={isDark}
                    onClick={() => setSelectedStock(b.symbol, b.label)}
                />
            ))}

            {/* Live indicator */}
            <div className="ml-auto flex items-center gap-1.5 hidden sm:flex">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className={`text-[10px] font-medium ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                    Live · refreshes every 60s
                </span>
            </div>
        </div>
    );
}

export default IndianMarketBenchmarks;
