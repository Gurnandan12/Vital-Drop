'use client';
import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, TrendingDown, Flame, RefreshCw, AlertCircle } from 'lucide-react';
import { useStockStore } from '@/store/stockStore';
import { fetchWithTimeout, validateQuote } from '@/lib/fetcher';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

/* ── Helper: derive exchange label from symbol suffix ── */
function getExchangeLabel(symbol) {
    if (symbol.endsWith('.NS'))
        return { label: 'NSE', color: 'text-blue-400 bg-blue-400/10' };
    if (symbol.endsWith('.BO'))
        return { label: 'BSE', color: 'text-orange-400 bg-orange-400/10' };
    return { label: 'IDX', color: 'text-violet-400 bg-violet-400/10' };
}

/* ── Indian NSE blue-chip gainers ── */
const TOP_GAINERS_SYMBOLS = [
    'RELIANCE.NS',
    'TCS.NS',
    'HDFCBANK.NS',
    'INFY.NS',
    'WIPRO.NS',
];

/* ── Indian NSE stocks for losers section ── */
const TOP_LOSERS_SYMBOLS = [
    'ADANIENT.NS',
    'COALINDIA.NS',
    'HINDUNILVR.NS',
    'TATAMOTORS.NS',
    'BAJFINANCE.NS',
];

/* ── Format price in Indian number system honestly ── */
function formatINR(v) {
    if (v === undefined || v === null || typeof v !== 'number' || !isFinite(v))
        return '--';
    if (v >= 1_00_00_000)
        return `₹${(v / 1_00_00_000).toFixed(2)} Cr`;
    if (v >= 1_00_00_000)
        return `₹${(v / 1_00_000).toFixed(2)} L`;
    return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function MoverCard({ symbol }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const { setSelectedStock, theme } = useStockStore();
    const isDark = theme === 'dark';
    const exch = getExchangeLabel(symbol);
    const displaySymbol = symbol.replace(/\.(NS|BO)$/, '');

    const loadMoverQuote = useCallback(async () => {
        setLoading(true);
        setHasError(false);
        try {
            const res = await fetchWithTimeout(`/api/quote?symbol=${encodeURIComponent(symbol)}`, { timeout: 8000 });
            const validated = validateQuote(res.data);
            if (validated && typeof validated.currentPrice === 'number') {
                setData({
                    symbol: validated.symbol,
                    shortName: validated.shortName,
                    price: validated.currentPrice,
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
        loadMoverQuote();
    }, [loadMoverQuote]);

    if (loading) {
        return (
            <div className={`p-3 rounded-xl flex items-center gap-3 ${isDark ? 'bg-white/3' : 'bg-gray-50'}`}>
                <LoadingSkeleton width="32px" height="32px" variant="rect" isDark={isDark} />
                <div className="flex-1 space-y-1">
                    <LoadingSkeleton width="70px" height="14px" variant="text" isDark={isDark} />
                    <LoadingSkeleton width="50px" height="12px" variant="text" isDark={isDark} />
                </div>
                <LoadingSkeleton width="45px" height="16px" variant="rect" isDark={isDark} />
            </div>
        );
    }

    if (hasError || !data) {
        return (
            <div className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-white/3' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <div>
                        <p className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{displaySymbol}</p>
                        <p className="text-[10px] text-gray-500">Data unavailable</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => loadMoverQuote()}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium"
                >
                    <RefreshCw className="w-3 h-3" /> Retry
                </button>
            </div>
        );
    }

    const change = data.percentChange ?? 0;
    const isUp = change >= 0;
    const color = isUp ? 'text-emerald-400' : 'text-red-400';
    const bg = isUp ? 'bg-emerald-400/10' : 'bg-red-400/10';

    return (
        <div
            onClick={() => setSelectedStock(data.symbol, data.shortName)}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
            }`}
        >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                {isUp ? <TrendingUp className={`w-4 h-4 ${color}`} /> : <TrendingDown className={`w-4 h-4 ${color}`} />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{displaySymbol}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${exch.color}`}>{exch.label}</span>
                </div>
                <p className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{formatINR(data.price)}</p>
            </div>
            <span className={`text-sm font-bold ${color}`}>
                {isUp ? '+' : ''}{change.toFixed(2)}%
            </span>
        </div>
    );
}

export function TopMovers() {
    const { theme } = useStockStore();
    const isDark = theme === 'dark';

    return (
        <div className={`rounded-2xl border p-5 ${isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Top Movers</h3>
                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold ${isDark ? 'bg-blue-500/15 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                    Indian Market
                </span>
            </div>
            <p className={`text-[11px] mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>NSE &amp; BSE Listed</p>

            <div className="mb-3">
                <p className="text-xs font-medium text-emerald-400 mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Gainers
                </p>
                <div className="flex flex-col gap-1">
                    {TOP_GAINERS_SYMBOLS.map((s) => (
                        <MoverCard key={s} symbol={s} />
                    ))}
                </div>
            </div>

            <div className={`h-px my-3 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />

            <div>
                <p className="text-xs font-medium text-red-400 mb-2 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> Losers
                </p>
                <div className="flex flex-col gap-1">
                    {TOP_LOSERS_SYMBOLS.map((s) => (
                        <MoverCard key={s} symbol={s} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TopMovers;
