'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Search, X, TrendingUp, Cpu, Building2, Landmark } from 'lucide-react';
import { useStockStore } from '@/store/stockStore';
import { getTopSuggestions } from '@/lib/stockSearch';
/* ─────────────────────────────────────────────────────────
   Debounce hook
───────────────────────────────────────────────────────── */
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}
/* ─────────────────────────────────────────────────────────
   Sector badge color map
───────────────────────────────────────────────────────── */
const SECTOR_COLORS = {
    Banking: 'text-blue-400 bg-blue-400/10',
    IT: 'text-violet-400 bg-violet-400/10',
    Pharma: 'text-emerald-400 bg-emerald-400/10',
    FMCG: 'text-orange-400 bg-orange-400/10',
    Energy: 'text-yellow-400 bg-yellow-400/10',
    Metal: 'text-gray-400 bg-gray-400/10',
    Automobile: 'text-red-400 bg-red-400/10',
    Telecom: 'text-cyan-400 bg-cyan-400/10',
    Infrastructure: 'text-amber-400 bg-amber-400/10',
    PSU: 'text-indigo-400 bg-indigo-400/10',
    Realty: 'text-pink-400 bg-pink-400/10',
    NBFC: 'text-teal-400 bg-teal-400/10',
    ETF: 'text-gold-400 bg-yellow-400/10',
    Index: 'text-purple-400 bg-purple-400/10',
};
function SectorBadge({ sector, isDark }) {
    const cls = SECTOR_COLORS[sector] ?? 'text-gray-400 bg-gray-400/10';
    return (<span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${cls}`}>{sector}</span>);
}
function ExchangeBadge({ symbol, isDark }) {
    if (symbol.endsWith('.NS'))
        return <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isDark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>NSE</span>;
    if (symbol.endsWith('.BO'))
        return <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isDark ? 'bg-orange-500/15 text-orange-400' : 'bg-orange-50 text-orange-500'}`}>BSE</span>;
    return <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isDark ? 'bg-violet-500/15 text-violet-400' : 'bg-violet-50 text-violet-500'}`}>IDX</span>;
}
/* ─────────────────────────────────────────────────────────
   SearchBar Component
───────────────────────────────────────────────────────── */
export function SearchBar() {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const debouncedQuery = useDebounce(query, 150);
    const ref = useRef(null);
    const { setSelectedStock, theme } = useStockStore();

    const q = debouncedQuery.trim();
    const results = useMemo(() => {
        if (!q) return [];
        return getTopSuggestions(q, 8);
    }, [q]);
    // Click outside to close
    useEffect(() => {
        const handle = (e) => {
            if (ref.current && !ref.current.contains(e.target))
                setOpen(false);
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);
    const handleSelect = (stock) => {
        setSelectedStock(stock.symbol, stock.name);
        setQuery('');
        setOpen(false);
    };
    const isDark = theme === 'dark';
    return (<div ref={ref} className="relative w-full max-w-xl">
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-200 ${isDark
            ? 'bg-[#1a1a2e]/80 border-white/10 focus-within:border-blue-500/60 focus-within:bg-[#1a1a2e]'
            : 'bg-white/80 border-gray-200 focus-within:border-blue-400 focus-within:bg-white'} backdrop-blur-sm shadow-lg`}>
        <Search className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}/>
        <input type="text" placeholder="Search Indian stocks — RELIANCE, TCS, HDFC, INFY..." value={query} onChange={e => { setQuery(e.target.value); setOpen(true); }} onFocus={() => results.length > 0 && setOpen(true)} className={`flex-1 bg-transparent outline-none text-sm placeholder:text-gray-500 ${isDark ? 'text-white' : 'text-gray-900'}`}/>
        {query && (<button onClick={() => { setQuery(''); setOpen(false); }}>
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600"/>
          </button>)}
      </div>

      {open && results.length > 0 && (<div className={`absolute top-full mt-2 w-full rounded-2xl border shadow-2xl overflow-hidden z-50 ${isDark
                ? 'bg-[#0f0f1a] border-white/10'
                : 'bg-white border-gray-200'}`}>
          {/* Header */}
          <div className={`px-4 py-2 border-b text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'border-white/5 text-gray-600' : 'border-gray-100 text-gray-400'}`}>
            <TrendingUp className="w-3 h-3"/>
            Indian Market — NSE &amp; BSE
          </div>

          {results.map((stock) => (<button key={stock.symbol} onClick={() => handleSelect(stock)} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${isDark
                    ? 'hover:bg-white/5 border-b border-white/5 last:border-0'
                    : 'hover:bg-gray-50 border-b border-gray-100 last:border-0'}`}>
              {/* Icon */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${stock.sector === 'IT' ? 'bg-violet-500/20' :
                    stock.sector === 'Banking' ? 'bg-blue-500/20' :
                        stock.sector === 'Pharma' ? 'bg-emerald-500/20' :
                            stock.sector === 'Energy' ? 'bg-yellow-500/20' :
                                'bg-gray-500/15'}`}>
                {stock.sector === 'IT' ? <Cpu className="w-4 h-4 text-violet-400"/> :
                    stock.sector === 'Banking' ? <Landmark className="w-4 h-4 text-blue-400"/> :
                        <Building2 className="w-4 h-4 text-gray-400"/>}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stock.symbol.replace(/\.(NS|BO)$/, '')}
                  </span>
                  <ExchangeBadge symbol={stock.symbol} isDark={isDark}/>
                  <SectorBadge sector={stock.sector} isDark={isDark}/>
                </div>
                <div className={`text-xs truncate mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {stock.name}
                </div>
              </div>

              {/* Cap badge */}
              <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-semibold ${stock.capCategory === 'Large Cap'
                    ? isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                    : stock.capCategory === 'Mid Cap'
                        ? isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-600'
                        : isDark ? 'bg-gray-500/15 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                {stock.capCategory}
              </span>
            </button>))}

          <div className={`px-4 py-2 text-[10px] text-center ${isDark ? 'text-gray-700' : 'text-gray-400'}`}>
            Showing NSE &amp; BSE listed stocks only
          </div>
        </div>)}
    </div>);
}
