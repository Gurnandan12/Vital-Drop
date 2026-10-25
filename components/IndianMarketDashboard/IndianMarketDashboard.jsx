'use client';
import { useState, useMemo, useCallback, useEffect, useRef, } from 'react';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler, } from 'chart.js';
import { Search, SlidersHorizontal, BarChart2, Building2, Cpu, Landmark, Zap, ShieldCheck, Car, Radio, Hammer, Leaf, ChevronLeft, ChevronRight, X, IndianRupee, Activity, ArrowUpRight, ArrowDownRight, } from 'lucide-react';
import { useStockStore } from '@/store/stockStore';
import { filterStocks } from '@/lib/stockSearch';
import { INDIAN_STOCKS, ALL_SECTORS, ALL_CAP_CATEGORIES, getSectorCounts, } from '@/lib/indianStocks';
// Register Chart.js modules (scoped to this dashboard)
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);
const PAGE_SIZE = 50;
/* ─────────────────────────────────────────────────────────
   Top Gainers/Losers/Most Active — blue chip universe
───────────────────────────────────────────────────────── */
const HIGHLIGHT_SYMBOLS = [
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
    'BAJFINANCE.NS', 'SBIN.NS', 'HINDUNILVR.NS', 'ITC.NS', 'TATAMOTORS.NS',
    'JSWSTEEL.NS', 'SUNPHARMA.NS', 'WIPRO.NS', 'AXISBANK.NS', 'LT.NS',
    'KOTAKBANK.NS', 'NTPC.NS', 'MARUTI.NS', 'BHARTIARTL.NS', 'ONGC.NS',
];
/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
function fmtINR(v) {
    if (v === null || v === undefined)
        return '—';
    if (v >= 1_00_00_000)
        return `₹${(v / 1_00_00_000).toFixed(2)} Cr`;
    if (v >= 1_00_000)
        return `₹${(v / 1_00_000).toFixed(2)} L`;
    if (v >= 1_000)
        return `₹${(v / 1_000).toFixed(1)} K`;
    return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtVol(v) {
    if (!v)
        return '—';
    if (v >= 1_00_00_000)
        return `${(v / 1_00_00_000).toFixed(2)} Cr`;
    if (v >= 1_00_000)
        return `${(v / 1_00_000).toFixed(2)} L`;
    if (v >= 1_000)
        return `${(v / 1_000).toFixed(1)} K`;
    return v.toLocaleString('en-IN');
}
/* ─────────────────────────────────────────────────────────
   Sector styles
───────────────────────────────────────────────────────── */
const SECTOR_STYLE = {
    Banking: { bg: 'bg-blue-500/15', text: 'text-blue-400', icon: <Landmark className="w-3 h-3"/> },
    IT: { bg: 'bg-violet-500/15', text: 'text-violet-400', icon: <Cpu className="w-3 h-3"/> },
    Pharma: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', icon: <ShieldCheck className="w-3 h-3"/> },
    FMCG: { bg: 'bg-orange-500/15', text: 'text-orange-400', icon: <Leaf className="w-3 h-3"/> },
    Energy: { bg: 'bg-yellow-500/15', text: 'text-yellow-500', icon: <Zap className="w-3 h-3"/> },
    Metal: { bg: 'bg-gray-500/15', text: 'text-gray-400', icon: <Hammer className="w-3 h-3"/> },
    Automobile: { bg: 'bg-red-500/15', text: 'text-red-400', icon: <Car className="w-3 h-3"/> },
    Telecom: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', icon: <Radio className="w-3 h-3"/> },
    Infrastructure: { bg: 'bg-amber-500/15', text: 'text-amber-400', icon: <Building2 className="w-3 h-3"/> },
    PSU: { bg: 'bg-indigo-500/15', text: 'text-indigo-400', icon: <Building2 className="w-3 h-3"/> },
    Realty: { bg: 'bg-pink-500/15', text: 'text-pink-400', icon: <Building2 className="w-3 h-3"/> },
    NBFC: { bg: 'bg-teal-500/15', text: 'text-teal-400', icon: <BarChart2 className="w-3 h-3"/> },
    ETF: { bg: 'bg-yellow-500/15', text: 'text-yellow-500', icon: <Activity className="w-3 h-3"/> },
    Index: { bg: 'bg-purple-500/15', text: 'text-purple-400', icon: <Activity className="w-3 h-3"/> },
};
/* ─────────────────────────────────────────────────────────
   Custom hook: fetch batch live quotes
───────────────────────────────────────────────────────── */
function useBatchQuotes(symbols) {
    const [quotes, setQuotes] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    useEffect(() => {
        if (!symbols.length)
            return;
        let cancelled = false;
        const loadQuotes = async () => {
            setLoading(true);
            setFetchError(false);
            try {
                const r = await fetch(`/api/quotes?symbols=${symbols.join(',')}`);
                if (!r.ok)
                    throw new Error(`HTTP ${r.status}`);
                const json = await r.json();
                if (cancelled)
                    return;
                const rawData = Array.isArray(json?.data) ? json.data : [];
                const map = {};
                for (const q of rawData) {
                    if (q && typeof q === 'object' && 'symbol' in q) {
                        const item = q;
                        map[item.symbol] = {
                            symbol: item.symbol ?? 'N/A',
                            price: item.price ?? null,
                            change: item.change ?? null,
                            changePercent: item.changePercent ?? null,
                            volume: item.volume ?? null,
                            marketCap: item.marketCap ?? null,
                            dayHigh: item.dayHigh ?? null,
                            dayLow: item.dayLow ?? null,
                            open: item.open ?? null,
                            fiftyTwoWeekHigh: item.fiftyTwoWeekHigh ?? null,
                            fiftyTwoWeekLow: item.fiftyTwoWeekLow ?? null,
                            error: item.error ?? false,
                        };
                    }
                }
                setQuotes(prev => ({ ...prev, ...map }));
            } catch (err) {
                console.warn('Batch quotes fetch error:', err);
                if (!cancelled)
                    setFetchError(true);
            } finally {
                if (!cancelled)
                    setLoading(false);
            }
        };
        loadQuotes();
        return () => {
            cancelled = true;
        };
    }, [symbols.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
    return { quotes, loading, fetchError };
}
/* ─────────────────────────────────────────────────────────
   Price skeleton
───────────────────────────────────────────────────────── */
function PriceSkeleton({ isDark }) {
    return (<div className={`animate-pulse h-4 w-16 rounded ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}/>);
}
/* ─────────────────────────────────────────────────────────
   Live Stock Card
───────────────────────────────────────────────────────── */
function LiveStockCard({ stock, quote, isDark, onClick, }) {
    const ss = SECTOR_STYLE[stock.sector] ?? { bg: 'bg-gray-500/15', text: 'text-gray-400', icon: null };
    const displaySymbol = stock.symbol.replace(/\.(NS|BO)$/, '');
    const isUp = (quote?.changePercent ?? 0) >= 0;
    const hasPrice = quote?.price !== null && quote?.price !== undefined;
    return (<div onClick={onClick} className={`rounded-2xl border p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl flex flex-col gap-3 ${isDark
            ? 'bg-[#0d0d1a] border-white/8 hover:border-white/20 hover:shadow-blue-500/5'
            : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-blue-50'}`}>
      {/* Top: symbol + exchange */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-sm font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {displaySymbol}
            </span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${stock.exchange === 'NSE'
            ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-500'
            : isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-500'}`}>
              {stock.exchange}
            </span>
          </div>
          <p className={`text-[10px] mt-0.5 truncate max-w-[140px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {stock.name}
          </p>
        </div>

        {/* Price + change */}
        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
          {quote === null ? (<PriceSkeleton isDark={isDark}/>) : hasPrice ? (<>
              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ₹{(quote.price ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-[10px] font-bold flex items-center gap-0.5 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                {isUp ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
                {quote.changePercent != null ? `${Math.abs(quote.changePercent).toFixed(2)}%` : '—'}
              </span>
            </>) : (<span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
              {quote?.error ? 'Unavailable' : '—'}
            </span>)}
        </div>
      </div>

      {/* Bottom: sector + cap */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${ss.bg} ${ss.text}`}>
          {ss.icon}{stock.sector}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${stock.capCategory === 'Large Cap'
            ? isDark ? 'bg-emerald-500/12 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
            : stock.capCategory === 'Mid Cap'
                ? isDark ? 'bg-amber-500/12 text-amber-400' : 'bg-amber-50 text-amber-600'
                : isDark ? 'bg-gray-500/12 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
          {stock.capCategory}
        </span>
      </div>
    </div>);
}
/* ─────────────────────────────────────────────────────────
   Market Highlights Strip (Top Gainers / Losers / Active)
───────────────────────────────────────────────────────── */
function MarketHighlightsStrip({ isDark }) {
    const { quotes, loading } = useBatchQuotes(HIGHLIGHT_SYMBOLS);
    const [tab, setTab] = useState('gainers');
    const sorted = useMemo(() => {
        const list = HIGHLIGHT_SYMBOLS
            .map(s => ({ symbol: s, quote: quotes[s] ?? null }))
            // Use != null (loose) to catch BOTH null AND undefined
            .filter(x => x.quote != null && x.quote.price != null && x.quote.changePercent != null);
        if (tab === 'gainers')
            return [...list].sort((a, b) => ((b.quote?.changePercent ?? 0) - (a.quote?.changePercent ?? 0))).slice(0, 8);
        if (tab === 'losers')
            return [...list].sort((a, b) => ((a.quote?.changePercent ?? 0) - (b.quote?.changePercent ?? 0))).slice(0, 8);
        return [...list].sort((a, b) => ((b.quote?.volume ?? 0) - (a.quote?.volume ?? 0))).slice(0, 8);
    }, [quotes, tab]);
    const stockInfo = (symbol) => INDIAN_STOCKS.find(s => s.symbol === symbol);
    return (<div className={`rounded-2xl border p-4 ${isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-100 shadow-sm'}`}>
      {/* Tab row */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className={`flex rounded-xl p-0.5 gap-0.5 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
          {[
            { key: 'gainers', label: '📈 Top Gainers' },
            { key: 'losers', label: '📉 Top Losers' },
            { key: 'active', label: '⚡ Most Active' },
        ].map(t => (<button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === t.key
                ? t.key === 'gainers' ? 'bg-emerald-600 text-white' : t.key === 'losers' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}>
              {t.label}
            </button>))}
        </div>
        {loading && <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"/>}
      </div>

      {/* Horizontal scroll strip */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {sorted.length === 0 ? (Array.from({ length: 5 }).map((_, i) => (<div key={i} className={`rounded-xl p-3 flex-shrink-0 w-36 animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
              <div className={`h-3 rounded w-16 mb-2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}/>
              <div className={`h-4 rounded w-20 mb-1 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}/>
              <div className={`h-3 rounded w-12 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}/>
            </div>))) : sorted.map(({ symbol, quote }) => {
            // Guard: skip rendering if quote data is somehow still missing
            if (!quote)
                return null;
            const info = stockInfo(symbol);
            const changePct = quote.changePercent ?? 0;
            const price = quote.price;
            const isUp = changePct >= 0;
            return (<div key={symbol} className={`rounded-xl p-3 flex-shrink-0 w-40 border transition-all hover:scale-[1.02] cursor-default ${isDark ? 'bg-white/4 border-white/8' : 'bg-gray-50 border-gray-100'}`}>
              <p className={`text-[10px] font-semibold truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {info?.name.split(' ').slice(0, 2).join(' ') ?? symbol}
              </p>
              <p className={`text-sm font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {price != null
                    ? `₹${price.toLocaleString('en-IN', { maximumFractionDigits: 1 })}`
                    : '--'}
              </p>
              <p className={`text-[10px] font-bold flex items-center gap-0.5 mt-0.5 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                {isUp ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
                {Math.abs(changePct).toFixed(2)}%
              </p>
              {tab === 'active' && (<p className={`text-[9px] mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  Vol: {fmtVol(quote.volume ?? null)}
                </p>)}
            </div>);
        })}
      </div>
    </div>);
}
/* ─────────────────────────────────────────────────────────
   Mini Inline Price Chart (Chart.js line)
───────────────────────────────────────────────────────── */
function InlinePriceChart({ symbol, isDark, range }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    useEffect(() => {
        let cancelled = false;
        const loadHistory = async () => {
            setLoading(true);
            setError(false);
            try {
                const r = await fetch(`/api/history?symbol=${encodeURIComponent(symbol)}&range=${range}`);
                const json = await r.json();
                if (cancelled || !canvasRef.current)
                    return;
                const raw = json.data ?? [];
                if (!raw.length) {
                    setError(true);
                    return;
                }
                // Destroy old chart
                chartRef.current?.destroy();
                chartRef.current = null;
                const labels = raw.map(d => {
                    const dt = new Date(d.time * 1000);
                    return range === '1D' || range === '1W'
                        ? dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                        : dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                });
                const prices = raw.map(d => d.close);
                const isUp = prices[prices.length - 1] >= prices[0];
                const lineColor = isUp ? '#10b981' : '#ef4444';
                chartRef.current = new Chart(canvasRef.current, {
                    type: 'line',
                    data: {
                        labels,
                        datasets: [{
                                label: 'Price (₹)',
                                data: prices,
                                borderColor: lineColor,
                                borderWidth: 2,
                                pointRadius: 0,
                                tension: 0.3,
                                fill: true,
                                backgroundColor: isUp ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            }],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: { duration: 400 },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: isDark ? '#10101f' : '#fff',
                                titleColor: isDark ? '#e5e7eb' : '#111',
                                bodyColor: isDark ? '#9ca3af' : '#374151',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                borderWidth: 1,
                                padding: 10,
                                cornerRadius: 8,
                                callbacks: {
                                    label: ctx => ` ₹${(ctx.parsed.y ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                                },
                            },
                        },
                        scales: {
                            x: {
                                grid: { display: false },
                                ticks: {
                                    color: isDark ? '#4b5563' : '#9ca3af',
                                    font: { size: 9 },
                                    maxTicksLimit: 6,
                                },
                                border: { display: false },
                            },
                            y: {
                                grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
                                ticks: {
                                    color: isDark ? '#4b5563' : '#9ca3af',
                                    font: { size: 9 },
                                    callback: (v) => `₹${Number(v).toLocaleString('en-IN')}`,
                                },
                                border: { display: false },
                            },
                        },
                    },
                });
            } catch {
                if (!cancelled) setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        loadHistory();
        return () => {
            cancelled = true;
            chartRef.current?.destroy();
            chartRef.current = null;
        };
    }, [symbol, range, isDark]);
    if (error)
        return (<div className={`rounded-xl p-4 text-center text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
      Chart data not available
    </div>);
    return (<div className="relative w-full h-52">
      {loading && (<div className={`absolute inset-0 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/3' : 'bg-gray-50'}`}>
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"/>
        </div>)}
      <canvas ref={canvasRef}/>
    </div>);
}
/* ─────────────────────────────────────────────────────────
   Stock Detail Panel (slide-in)
───────────────────────────────────────────────────────── */
function StockDetailPanel({ stock, isDark, onClose, }) {
    const [quote, setQuote] = useState(null);
    const [range, setRange] = useState('1M');
    const [loadingQuote, setLoadingQuote] = useState(true);
    const ss = SECTOR_STYLE[stock.sector] ?? { bg: 'bg-gray-500/15', text: 'text-gray-400', icon: null };
    const isUp = (quote?.changePercent ?? 0) >= 0;
    useEffect(() => {
        let cancelled = false;
        const loadQuote = async () => {
            setLoadingQuote(true);
            try {
                const r = await fetch(`/api/quotes?symbols=${stock.symbol}`);
                const json = await r.json();
                if (!cancelled) {
                    setQuote(json.data?.[0] ?? null);
                }
            } catch {
                if (!cancelled)
                    setQuote(null);
            } finally {
                if (!cancelled)
                    setLoadingQuote(false);
            }
        };
        loadQuote();
        return () => { cancelled = true; };
    }, [stock.symbol]);
    const displaySymbol = stock.symbol.replace(/\.(NS|BO)$/, '');
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>

      {/* Panel */}
      <div className={`relative z-10 w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden ${isDark ? 'bg-[#0d0d1a] border-white/10' : 'bg-white border-gray-200'}`} style={{ animation: 'fadeSlideUp 0.25s ease both' }}>
        {/* Header */}
        <div className={`px-6 pt-6 pb-4 border-b ${isDark ? 'border-white/8' : 'border-gray-100'}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {displaySymbol}
                </h2>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${stock.exchange === 'NSE'
            ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
            : isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>{stock.exchange}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${ss.bg} ${ss.text}`}>
                  {stock.sector}
                </span>
              </div>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stock.name}</p>
            </div>
            <button onClick={onClose} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/8 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              <X className="w-5 h-5"/>
            </button>
          </div>

          {/* Price row */}
          <div className="mt-4 flex items-end gap-3">
            {loadingQuote ? (<div className={`h-8 w-32 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}/>) : quote?.price !== null && quote?.price !== undefined ? (<>
                <span className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ₹{quote.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-sm font-bold flex items-center gap-0.5 pb-1 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isUp ? <ArrowUpRight className="w-4 h-4"/> : <ArrowDownRight className="w-4 h-4"/>}
                  {quote.changePercent != null ? `${Math.abs(quote.changePercent).toFixed(2)}%` : '—'}
                  {quote.change != null ? ` (${isUp ? '+' : ''}₹${Math.abs(quote.change).toFixed(2)})` : ''}
                </span>
              </>) : (<span className={`text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Price not available</span>)}
          </div>
        </div>

        {/* Stats grid */}
        <div className={`grid grid-cols-3 gap-px ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
          {[
            { label: 'Day High', value: fmtINR(quote?.dayHigh ?? null) },
            { label: 'Day Low', value: fmtINR(quote?.dayLow ?? null) },
            { label: 'Open', value: fmtINR(quote?.open ?? null) },
            { label: 'Volume', value: fmtVol(quote?.volume ?? null) },
            { label: 'Market Cap', value: fmtINR(quote?.marketCap ?? null) },
            { label: '52W High', value: fmtINR(quote?.fiftyTwoWeekHigh ?? null) },
        ].map(stat => (<div key={stat.label} className={`px-4 py-3 ${isDark ? 'bg-[#0d0d1a]' : 'bg-white'}`}>
              <p className={`text-[9px] uppercase tracking-widest font-bold ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{stat.label}</p>
              <p className={`text-sm font-bold mt-0.5 ${loadingQuote ? 'opacity-0' : ''} ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {loadingQuote ? '—' : stat.value}
              </p>
            </div>))}
        </div>

        {/* Chart */}
        <div className="px-6 pt-4 pb-6">
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Price Chart</p>
            <div className={`flex rounded-lg p-0.5 gap-0.5 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
              {['1W', '1M', '1Y'].map(r => (<button key={r} onClick={() => setRange(r)} className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${range === r
                ? 'bg-emerald-600 text-white'
                : isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-800'}`}>
                  {r}
                </button>))}
            </div>
          </div>
          <InlinePriceChart symbol={stock.symbol} isDark={isDark} range={range}/>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>);
}
/* ─────────────────────────────────────────────────────────
   Sector Overview Sidebar
───────────────────────────────────────────────────────── */
function SectorOverview({ isDark }) {
    const counts = getSectorCounts();
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return (<div className={`rounded-2xl border p-5 ${isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-100 shadow-sm'}`}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}/>
        <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Sector Breakdown</h3>
        <span className={`ml-auto text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{total}</span>
      </div>
      <div className="flex flex-col gap-2">
        {sorted.map(([sector, count]) => {
            const pct = Math.round((count / total) * 100);
            const ss = SECTOR_STYLE[sector] ?? { bg: 'bg-gray-500/15', text: 'text-gray-400', icon: null };
            return (<div key={sector} className="flex items-center gap-2">
              <span className={`text-[10px] w-24 flex-shrink-0 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{sector}</span>
              <div className={`flex-1 h-1.5 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                <div className={`h-full rounded-full ${ss.bg.replace('/15', '/60')}`} style={{ width: `${Math.min(pct * 3, 100)}%` }}/>
              </div>
              <span className={`text-[10px] w-6 text-right font-bold ${ss.text}`}>{count}</span>
            </div>);
        })}
      </div>
    </div>);
}
/* ─────────────────────────────────────────────────────────
   Filter Pill
───────────────────────────────────────────────────────── */
function FilterPill({ label, active, onClick, isDark, color = 'blue' }) {
    const activeCls = color === 'orange' ? 'bg-orange-500 text-white border-orange-500' :
        color === 'violet' ? 'bg-violet-600 text-white border-violet-600' :
            color === 'emerald' ? 'bg-emerald-600 text-white border-emerald-600' :
                'bg-blue-600 text-white border-blue-600';
    return (<button onClick={onClick} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${active ? activeCls : isDark ? 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>{label}</button>);
}
/* ─────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────── */
export function IndianMarketDashboard({ isDark }) {
    const { setSelectedStock } = useStockStore();
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [exchange, setExchange] = useState('All');
    const [capCategory, setCapCategory] = useState('All');
    const [sector, setSector] = useState('All');
    const [assetType, setAssetType] = useState('All');
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [detailStock, setDetailStock] = useState(null);
    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(t);
    }, [searchQuery]);
    // Filtered + paginated list
    const filtered = useMemo(() => filterStocks({
        query: debouncedSearch,
        exchange: exchange === 'All' ? undefined : exchange,
        capCategory: capCategory === 'All' ? undefined : capCategory,
        sector: sector === 'All' ? undefined : sector,
        assetType: assetType === 'All' ? undefined : assetType,
    }), [debouncedSearch, exchange, capCategory, sector, assetType]);
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    // Fetch live prices for current page (max 20 at a time)
    const pageSymbols = useMemo(() => paged.slice(0, 20).map(s => s.symbol), [paged]);
    const { quotes } = useBatchQuotes(pageSymbols);
    const resetFilters = useCallback(() => {
        setSearchQuery('');
        setExchange('All');
        setCapCategory('All');
        setSector('All');
        setAssetType('All');
        setPage(1);
    }, []);
    const hasActiveFilters = exchange !== 'All' || capCategory !== 'All' || sector !== 'All' || assetType !== 'All' || searchQuery;
    return (<div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Indian Stock Market Dashboard 🇮🇳
          </h2>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {INDIAN_STOCKS.filter(s => s.assetType === 'Equity').length}+ stocks · NSE &amp; BSE · Live prices on demand
          </p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"/>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"/>
          </span>
          Live Yahoo Finance
        </div>
      </div>

      {/* ── Market Highlights ── */}
      <MarketHighlightsStrip isDark={isDark}/>

      {/* ── Filter Bar ── */}
      <div className={`rounded-2xl border p-4 flex flex-col gap-3 ${isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className="flex items-center gap-3">
          <div className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 focus-within:border-blue-500/50' : 'bg-gray-50 border-gray-200 focus-within:border-blue-400'}`}>
            <Search className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}/>
            <input type="text" placeholder="Search by name, symbol, or sector..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }} className={`flex-1 bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'}`}/>
            {searchQuery && (<button onClick={() => setSearchQuery('')}><X className="w-3.5 h-3.5 text-gray-400"/></button>)}
          </div>
          <button onClick={() => setShowFilters(f => !f)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${showFilters || hasActiveFilters
            ? 'bg-blue-600 text-white border-blue-600'
            : isDark ? 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
            <SlidersHorizontal className="w-4 h-4"/>
            Filters
            {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-white"/>}
          </button>
          {hasActiveFilters && (<button onClick={resetFilters} className={`text-xs px-3 py-2.5 rounded-xl border font-semibold transition-all ${isDark ? 'border-white/10 text-gray-500 hover:text-red-400' : 'border-gray-200 text-gray-400 hover:text-red-500'}`}>Reset</button>)}
        </div>

        {showFilters && (<div className="flex flex-col gap-3 pt-2 border-t border-white/5">
            <div>
              <p className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Exchange</p>
              <div className="flex gap-2 flex-wrap">
                {['All', 'NSE', 'BSE'].map(ex => (<FilterPill key={ex} label={ex} active={exchange === ex} onClick={() => { setExchange(ex); setPage(1); }} isDark={isDark} color={ex === 'BSE' ? 'orange' : 'blue'}/>))}
              </div>
            </div>
            <div>
              <p className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Market Cap</p>
              <div className="flex gap-2 flex-wrap">
                {['All', ...ALL_CAP_CATEGORIES].map(cap => (<FilterPill key={cap} label={cap} active={capCategory === cap} onClick={() => { setCapCategory(cap); setPage(1); }} isDark={isDark} color="emerald"/>))}
              </div>
            </div>
            <div>
              <p className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Sector</p>
              <div className="flex gap-2 flex-wrap">
                <FilterPill label="All" active={sector === 'All'} onClick={() => { setSector('All'); setPage(1); }} isDark={isDark} color="violet"/>
                {ALL_SECTORS.filter(s => s !== 'Index').map(s => (<FilterPill key={s} label={s} active={sector === s} onClick={() => { setSector(s); setPage(1); }} isDark={isDark} color="violet"/>))}
              </div>
            </div>
            <div>
              <p className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Asset Type</p>
              <div className="flex gap-2 flex-wrap">
                {['All', 'Equity', 'Gold ETF', 'Silver ETF', 'Index'].map(at => (<FilterPill key={at} label={at} active={assetType === at} onClick={() => { setAssetType(at); setPage(1); }} isDark={isDark} color="blue"/>))}
              </div>
            </div>
          </div>)}

        <div className="flex items-center justify-between">
          <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            Showing <span className="font-bold text-blue-400">{filtered.length}</span> stocks{hasActiveFilters && ' (filtered)'}
            {!hasActiveFilters && ` · Live prices load for first 20`}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Page {page} of {totalPages}</p>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">

        {/* Stock Grid */}
        <div className="flex flex-col gap-4">
          {paged.length === 0 ? (<div className={`rounded-2xl border border-dashed p-16 text-center ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <Search className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-gray-700' : 'text-gray-300'}`}/>
              <p className={`font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No Indian stock found</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Try a different name, symbol, or sector</p>
              <button onClick={resetFilters} className="mt-3 text-xs text-blue-400 hover:underline">Reset all filters</button>
            </div>) : (<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {paged.map(stock => (<LiveStockCard key={stock.symbol} stock={stock} quote={quotes[stock.symbol] ?? null} isDark={isDark} onClick={() => setDetailStock(stock)}/>))}
            </div>)}

          {/* Pagination */}
          {totalPages > 1 && (<div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all disabled:opacity-40 ${isDark ? 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                <ChevronLeft className="w-4 h-4"/> Prev
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (<button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === p ? 'bg-blue-600 text-white' : isDark ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'}`}>{p}</button>))}
                {totalPages > 7 && <span className={`self-center text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>…{totalPages}</span>}
              </div>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all disabled:opacity-40 ${isDark ? 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                Next <ChevronRight className="w-4 h-4"/>
              </button>
            </div>)}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className={`rounded-2xl border p-5 ${isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-100 shadow-sm'}`}>
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Market Summary</h3>
            <div className="flex flex-col gap-3">
              {[
            { label: 'Total Stocks', value: INDIAN_STOCKS.filter(s => s.assetType === 'Equity').length, color: 'text-blue-400' },
            { label: 'NSE Listed', value: INDIAN_STOCKS.filter(s => s.exchange === 'NSE' && s.assetType === 'Equity').length, color: 'text-blue-400' },
            { label: 'BSE Listed', value: INDIAN_STOCKS.filter(s => s.exchange === 'BSE' && s.assetType === 'Equity').length, color: 'text-orange-400' },
            { label: 'Large Cap', value: INDIAN_STOCKS.filter(s => s.capCategory === 'Large Cap' && s.assetType === 'Equity').length, color: 'text-emerald-400' },
            { label: 'Mid Cap', value: INDIAN_STOCKS.filter(s => s.capCategory === 'Mid Cap').length, color: 'text-amber-400' },
            { label: 'Small Cap', value: INDIAN_STOCKS.filter(s => s.capCategory === 'Small Cap').length, color: 'text-gray-400' },
            { label: 'ETFs', value: INDIAN_STOCKS.filter(s => s.assetType === 'Gold ETF' || s.assetType === 'Silver ETF').length, color: 'text-yellow-400' },
        ].map(item => (<div key={item.label} className="flex items-center justify-between">
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{item.label}</span>
                  <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                </div>))}
            </div>
          </div>
          <SectorOverview isDark={isDark}/>
          <div className={`rounded-2xl border border-dashed p-4 text-center ${isDark ? 'border-white/8' : 'border-gray-200'}`}>
            <IndianRupee className={`w-5 h-5 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}/>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              Click any card for full data, 52W range &amp; price chart
            </p>
          </div>
        </div>
      </div>

      {/* Stock Detail Panel */}
      {detailStock && (<StockDetailPanel stock={detailStock} isDark={isDark} onClose={() => setDetailStock(null)}/>)}

      <p className={`text-xs text-center ${isDark ? 'text-gray-700' : 'text-gray-300'}`}>
        ⚠️ Live data via Yahoo Finance. For informational purposes only. Not financial advice.
      </p>
    </div>);
}
