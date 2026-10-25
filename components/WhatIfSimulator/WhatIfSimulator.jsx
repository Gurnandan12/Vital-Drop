'use client';
import { useState, useRef } from 'react';
import { Sparkles, TrendingUp, Wallet, PiggyBank, Lightbulb, Wand2 } from 'lucide-react';
/* ─────────────────────────────────────────────
   Natural Language Parser
───────────────────────────────────────────── */
function parseQuery(query) {
    const q = query.toLowerCase().replace(/,/g, '');
    /* ── Amount extraction ──
       Handles: ₹2000, rs2000, 2000/month, 2000 per month,
                2 lakh, 2.5 lakhs, 50k */
    let monthly = 0;
    // lakh/lac pattern  e.g. "2 lakh" "0.5 lakhs"
    const lakhMatch = q.match(/(?:₹|rs\.?\s*)?(\d+(?:\.\d+)?)\s*(?:lakh|lac)/i);
    if (lakhMatch) {
        monthly = parseFloat(lakhMatch[1]) * 100_000;
    }
    // k pattern  e.g. "5k" "10k"
    if (!monthly) {
        const kMatch = q.match(/(?:₹|rs\.?\s*)?(\d+(?:\.\d+)?)k/i);
        if (kMatch)
            monthly = parseFloat(kMatch[1]) * 1_000;
    }
    // plain number with currency or context words
    if (!monthly) {
        const plainMatch = q.match(/(?:₹|rs\.?\s*|rupees?\s*)(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:\/|-)?(?:month|monthly|mo\b|pm\b|per\s*month)/i);
        if (plainMatch)
            monthly = parseFloat(plainMatch[1] ?? plainMatch[2]);
    }
    // fallback: first standalone number > 100
    if (!monthly) {
        const nums = [...q.matchAll(/\b(\d{3,})\b/g)].map((m) => parseFloat(m[1]));
        if (nums.length)
            monthly = nums[0];
    }
    if (!monthly || monthly <= 0)
        return null;
    /* ── Duration extraction ──
       Handles: 5 years, 10 yrs, 6 months, 24 months */
    let years = 0;
    const yearsMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i);
    if (yearsMatch)
        years = parseFloat(yearsMatch[1]);
    if (!years) {
        const monthsMatch = q.match(/(\d+)\s*months?/i);
        if (monthsMatch)
            years = parseFloat(monthsMatch[1]) / 12;
    }
    if (!years || years <= 0)
        return null;
    /* ── Return rate extraction ──
       Handles: at 12%, @15%, 8 percent — defaults to 10 */
    let returnRate = 10;
    const rateMatch = q.match(/(?:at|@)\s*(\d+(?:\.\d+)?)\s*%|(\d+(?:\.\d+)?)\s*(?:percent|%\s*(?:return|p\.?a|per\s*annum))/i);
    if (rateMatch)
        returnRate = parseFloat(rateMatch[1] ?? rateMatch[2]);
    return { monthly, years, returnRate };
}
/* ─────────────────────────────────────────────
   SIP Calculation
───────────────────────────────────────────── */
function simulate(p) {
    const r = p.returnRate / 12 / 100;
    const n = Math.round(p.years * 12);
    const fv = r === 0
        ? p.monthly * n
        : p.monthly * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const totalInvested = p.monthly * n;
    const finalValue = Math.round(fv);
    const profit = Math.round(finalValue - totalInvested);
    const multiple = (finalValue / totalInvested).toFixed(2);
    const explanation = `By investing ${formatINR(p.monthly)} every month for ${p.years % 1 === 0 ? `${p.years} year${p.years > 1 ? 's' : ''}` : `${Math.round(p.years * 12)} months`} at ${p.returnRate}% annual return, your money grows ${multiple}× — turning ${formatINR(Math.round(totalInvested))} of your savings into ${formatINR(finalValue)}. The power of compounding earns you an extra ${formatINR(profit)} on top of what you put in.`;
    return { ...p, totalInvested: Math.round(totalInvested), finalValue, profit, explanation };
}
/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function formatINR(v) {
    if (v >= 10_000_000)
        return `₹${(v / 10_000_000).toFixed(2)} Cr`;
    if (v >= 100_000)
        return `₹${(v / 100_000).toFixed(2)} L`;
    return `₹${v.toLocaleString('en-IN')}`;
}
const EXAMPLES = [
    'What if I invest ₹2,000/month for 5 years?',
    'Invest 10k per month for 10 years at 12%',
    'Rs 5000 monthly for 3 years',
    '₹1 lakh per month for 20 years',
    'What happens if I save ₹500/month for 2 years?',
];
/* ─────────────────────────────────────────────
   Result Card
───────────────────────────────────────────── */
function ResultCard({ label, value, icon, accent, isDark, delay = 0, }) {
    return (<div className={`rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDark
            ? 'bg-[#0d0d1a] border-white/8 hover:border-white/20'
            : 'bg-white border-gray-100 hover:border-violet-200 hover:shadow-violet-100'}`} style={{ animation: `fadeSlideUp 0.4s ease ${delay}ms both` }}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${accent}`}>
        {icon}
      </div>
      <div>
        <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {label}
        </p>
        <p className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {formatINR(value)}
        </p>
      </div>
    </div>);
}
/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export function WhatIfSimulator({ isDark }) {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const runSimulation = (input = query) => {
        if (!input.trim())
            return;
        setLoading(true);
        setError('');
        setResult(null);
        setTimeout(() => {
            const parsed = parseQuery(input);
            if (!parsed) {
                setError("Couldn't extract the investment details. Try something like: \"₹5000/month for 10 years\" or \"What if I invest ₹2000 monthly for 5 years at 12%?\".");
            }
            else {
                setResult(simulate(parsed));
            }
            setLoading(false);
        }, 600);
    };
    const handleExample = (ex) => {
        setQuery(ex);
        setResult(null);
        setError('');
        setTimeout(() => runSimulation(ex), 50);
    };
    return (<div className="flex flex-col gap-8">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
          <Wand2 className="w-5 h-5 text-white"/>
        </div>
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            What If Simulator
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Ask any investment question in plain English
          </p>
        </div>
      </div>

      {/* ── Input Box ── */}
      <div className={`rounded-2xl border p-6 flex flex-col gap-4 ${isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className="relative">
          <textarea ref={inputRef} id="whatif-input" rows={3} value={query} onChange={(e) => {
            setQuery(e.target.value);
            setError('');
        }} onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                runSimulation();
            }
        }} placeholder='Try: "What if I invest ₹5,000/month for 10 years at 12%?"' className={`w-full resize-none rounded-xl border px-4 py-3.5 text-sm font-medium transition-all outline-none focus:ring-2 leading-relaxed ${isDark
            ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:ring-fuchsia-500/40 focus:border-fuchsia-500/50'
            : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-fuchsia-400/30 focus:border-fuchsia-400'}`}/>
          {/* Sparkle hint */}
          <div className={`absolute top-3 right-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
            <Sparkles className="w-4 h-4"/>
          </div>
        </div>

        {/* Example chips */}
        <div className="flex flex-wrap gap-2">
          <span className={`text-xs self-center mr-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            Try:
          </span>
          {EXAMPLES.slice(0, 3).map((ex) => (<button key={ex} onClick={() => handleExample(ex)} className={`text-xs px-3 py-1.5 rounded-lg border transition-all hover:scale-[1.02] ${isDark
                ? 'bg-white/4 border-white/8 text-gray-400 hover:border-fuchsia-500/40 hover:text-fuchsia-300'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-fuchsia-300 hover:text-fuchsia-600'}`}>
              {ex.length > 38 ? ex.slice(0, 38) + '…' : ex}
            </button>))}
        </div>

        {/* Simulate Button */}
        <button id="whatif-simulate-btn" onClick={() => runSimulation()} disabled={loading || !query.trim()} className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white hover:from-fuchsia-500 hover:to-violet-500 transition-all shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
          {loading ? (<>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
              Simulating…
            </>) : (<>
              <Wand2 className="w-4 h-4"/>
              Simulate
            </>)}
        </button>

        {/* Error */}
        {error && (<div className={`rounded-xl border px-4 py-3 text-sm ${isDark
                ? 'bg-rose-500/10 border-rose-500/25 text-rose-300'
                : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
            ⚠️ {error}
          </div>)}
      </div>

      {/* ── Results ── */}
      {result && (<div className="flex flex-col gap-5" style={{ animation: 'fadeSlideUp 0.35s ease both' }}>
          {/* Parsed details strip */}
          <div className={`rounded-xl border px-5 py-3 flex flex-wrap gap-4 text-xs ${isDark ? 'bg-white/3 border-white/8 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
            <span>Understood as:</span>
            {[
                { label: 'Monthly', value: formatINR(result.monthly) },
                { label: 'Duration', value: `${result.years % 1 === 0 ? result.years : Math.round(result.years * 12) + ' mo'} ${result.years % 1 === 0 ? (result.years === 1 ? 'year' : 'years') : ''}` },
                { label: 'Return', value: `${result.returnRate}% p.a.` },
            ].map((c) => (<span key={c.label} className={`font-semibold ${isDark ? 'text-fuchsia-300' : 'text-fuchsia-600'}`}>
                {c.label}: <span className={isDark ? 'text-white' : 'text-gray-800'}>{c.value}</span>
              </span>))}
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ResultCard label="Total Invested" value={result.totalInvested} icon={<Wallet className="w-5 h-5"/>} accent="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30" isDark={isDark} delay={0}/>
            <ResultCard label="Future Value" value={result.finalValue} icon={<TrendingUp className="w-5 h-5"/>} accent="bg-gradient-to-br from-fuchsia-500 to-violet-600 shadow-fuchsia-500/30" isDark={isDark} delay={80}/>
            <ResultCard label="Profit (Gains)" value={result.profit} icon={<PiggyBank className="w-5 h-5"/>} accent="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30" isDark={isDark} delay={160}/>
          </div>

          {/* Plain English Explanation */}
          <div className={`rounded-2xl border p-5 flex gap-4 ${isDark
                ? 'bg-[#0d0d1a] border-white/8'
                : 'bg-white border-gray-100 shadow-sm'}`} style={{ animation: 'fadeSlideUp 0.4s ease 240ms both' }}>
            <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5 bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 border ${isDark ? 'border-fuchsia-500/20' : 'border-fuchsia-200'}`}>
              <Lightbulb className={`w-4 h-4 ${isDark ? 'text-fuchsia-300' : 'text-fuchsia-500'}`}/>
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Plain English
              </p>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {result.explanation}
              </p>
            </div>
          </div>

          {/* Multiplier badge */}
          <div className="flex items-center justify-center">
            <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-bold ${isDark
                ? 'bg-fuchsia-500/10 border-fuchsia-500/25 text-fuchsia-300'
                : 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-600'}`}>
              <Sparkles className="w-4 h-4"/>
              Your money grows{' '}
              <span className="text-base font-extrabold">
                {(result.finalValue / result.totalInvested).toFixed(2)}×
              </span>{' '}
              in {result.years % 1 === 0 ? `${result.years} year${result.years > 1 ? 's' : ''}` : `${Math.round(result.years * 12)} months`}
            </div>
          </div>
        </div>)}

      {/* Empty state */}
      {!result && !loading && !error && (<div className={`rounded-2xl border border-dashed p-14 flex flex-col items-center justify-center gap-4 text-center ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <Wand2 className={`w-7 h-7 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}/>
          </div>
          <div>
            <p className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Ask anything about your investment
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              e.g. "What if I invest ₹2,000/month for 5 years?"
            </p>
          </div>
        </div>)}

      {/* Disclaimer */}
      {result && (<p className={`text-xs text-center pb-2 ${isDark ? 'text-gray-700' : 'text-gray-300'}`}>
          ⚠️ Returns shown are estimated based on a constant {result.returnRate}% annual return. Actual returns vary with market conditions.
        </p>)}

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>);
}
