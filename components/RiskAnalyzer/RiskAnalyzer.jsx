'use client';
import { useState } from 'react';
import { ShieldAlert, TrendingUp, Gauge, CircleCheck, Flame, Leaf, SlidersHorizontal, } from 'lucide-react';
const profileConfig = {
    Conservative: {
        label: 'Conservative',
        emoji: '🟢',
        icon: <Leaf className="w-6 h-6"/>,
        tagline: 'Capital safety is your priority',
        explanation: 'Your profile suggests a preference for preserving capital over chasing high returns. Stability, predictability, and low volatility define your ideal portfolio. You sleep better knowing your money is safe.',
        recommendations: [
            'Fixed Deposits & Government Bonds',
            'Post Office Schemes (PPF, NSC)',
            'Debt Mutual Funds',
            'Senior Citizens Savings Scheme',
        ],
        gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500/15 border-emerald-500/25',
        badgeText: 'text-emerald-400',
        glow: 'shadow-emerald-500/20',
        bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
        barWidth: 'w-[30%]',
    },
    Moderate: {
        label: 'Moderate',
        emoji: '🟡',
        icon: <Gauge className="w-6 h-6"/>,
        tagline: 'Balanced growth with managed risk',
        explanation: 'You seek solid returns while keeping risk in check. A diversified mix of equity and debt fits your goals. You can stomach short-term fluctuations as long as the long-term trajectory is upward.',
        recommendations: [
            'Balanced / Hybrid Mutual Funds',
            'National Pension System (NPS)',
            'Blue-chip Stocks & Index Funds',
            'Corporate Bonds & Liquid Funds',
        ],
        gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/15 border-amber-500/25',
        badgeText: 'text-amber-400',
        glow: 'shadow-amber-500/20',
        bar: 'bg-gradient-to-r from-amber-400 to-yellow-400',
        barWidth: 'w-[60%]',
    },
    Aggressive: {
        label: 'Aggressive',
        emoji: '🔴',
        icon: <Flame className="w-6 h-6"/>,
        tagline: 'Maximum growth, maximum conviction',
        explanation: 'You have a high risk appetite and a long time horizon to ride out market swings. You chase alpha and aren\'t fazed by 30–40% drawdowns. Your portfolio is built for compounding wealth aggressively over the long run.',
        recommendations: [
            'Small & Mid Cap Mutual Funds',
            'Direct Equity (NSE / BSE)',
            'Cryptocurrency (small allocation)',
            'ULIP & High-Yield ETFs',
        ],
        gradient: 'from-rose-500/20 via-red-500/10 to-transparent',
        border: 'border-rose-500/30',
        badge: 'bg-rose-500/15 border-rose-500/25',
        badgeText: 'text-rose-400',
        glow: 'shadow-rose-500/20',
        bar: 'bg-gradient-to-r from-rose-500 to-orange-400',
        barWidth: 'w-[95%]',
    },
};
/* ─────────────────────────────────────────────
   Risk Analysis Logic
───────────────────────────────────────────── */
function analyzeRisk(age, income, tolerance) {
    // Conservative: age > 45 OR low tolerance
    if (age > 45 || tolerance === 'Low')
        return 'Conservative';
    // Aggressive: age < 30 AND high tolerance
    if (age < 30 && tolerance === 'High')
        return 'Aggressive';
    // Unstable income bumps down aggressiveness
    if (income === 'Unstable' && tolerance === 'High')
        return 'Moderate';
    // Moderate: everything in between
    return 'Moderate';
}
/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function ToggleGroup({ id, label, options, value, onChange, isDark, }) {
    return (<div className="flex flex-col gap-2">
      <label className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {label}
      </label>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => {
            const active = value === opt.value;
            return (<button key={opt.value} id={`${id}-${opt.value.toLowerCase()}`} onClick={() => onChange(opt.value)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${active
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500/50 text-white shadow-lg shadow-violet-500/25 scale-[1.03]'
                    : isDark
                        ? 'bg-white/4 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-violet-300 hover:text-gray-700'}`}>
              {opt.icon && <span className="opacity-80">{opt.icon}</span>}
              {opt.label}
            </button>);
        })}
      </div>
    </div>);
}
/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export function RiskAnalyzer({ isDark }) {
    const [age, setAge] = useState(28);
    const [income, setIncome] = useState('Stable');
    const [tolerance, setTolerance] = useState('Medium');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleAnalyze = () => {
        setLoading(true);
        setResult(null);
        setTimeout(() => {
            setResult(analyzeRisk(age, income, tolerance));
            setLoading(false);
        }, 700);
    };
    const profile = result ? profileConfig[result] : null;
    return (<div className="flex flex-col gap-8">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <ShieldAlert className="w-5 h-5 text-white"/>
        </div>
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Risk Analyzer
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Discover your investor risk profile in seconds
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
        {/* ── Left: Input Form ── */}
        <div className={`rounded-2xl border p-6 flex flex-col gap-6 ${isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-100 shadow-sm'}`}>
          {/* Age */}
          <div className="flex flex-col gap-2">
            <label htmlFor="ra-age" className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Your Age
            </label>
            <div className="relative">
              <input id="ra-age" type="number" min={18} max={80} value={age} onChange={(e) => setAge(Number(e.target.value))} className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold transition-all outline-none focus:ring-2 ${isDark
            ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:ring-violet-500/40 focus:border-violet-500/50'
            : 'bg-white border-gray-200 text-gray-800 focus:ring-violet-400/30 focus:border-violet-400'}`}/>
              <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                years
              </span>
            </div>
            <input type="range" min={18} max={80} step={1} value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-violet-500"/>
            <div className={`flex justify-between text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              <span>18</span>
              <span className={`font-bold text-xs ${age > 45
            ? 'text-emerald-400'
            : age < 30
                ? 'text-rose-400'
                : 'text-amber-400'}`}>
                {age > 45 ? 'Senior investor' : age < 30 ? 'Young investor' : 'Mid-career'}
              </span>
              <span>80</span>
            </div>
          </div>

          {/* Income Stability */}
          <ToggleGroup id="ra-income" label="Income Stability" value={income} onChange={(v) => setIncome(v)} isDark={isDark} options={[
            { value: 'Stable', label: 'Stable', icon: <CircleCheck className="w-3.5 h-3.5"/> },
            { value: 'Unstable', label: 'Unstable', icon: <ShieldAlert className="w-3.5 h-3.5"/> },
        ]}/>

          {/* Risk Tolerance */}
          <ToggleGroup id="ra-tolerance" label="Risk Tolerance" value={tolerance} onChange={(v) => setTolerance(v)} isDark={isDark} options={[
            { value: 'Low', label: 'Low 🟢' },
            { value: 'Medium', label: 'Medium 🟡' },
            { value: 'High', label: 'High 🔴' },
        ]}/>

          {/* CTA */}
          <button id="ra-analyze-btn" onClick={handleAnalyze} disabled={loading || age < 18 || age > 80} className="mt-2 flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? (<>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                Analysing…
              </>) : (<>
                <SlidersHorizontal className="w-4 h-4"/>
                Analyze Risk
              </>)}
          </button>
        </div>

        {/* ── Right: Result ── */}
        <div className="flex flex-col gap-4">
          {profile ? (<>
              {/* Profile Card */}
              <div className={`relative rounded-2xl border overflow-hidden p-6 shadow-2xl ${profile.border} ${profile.glow}`} style={{ animation: 'fadeSlideUp 0.4s ease both' }}>
                {/* Ambient gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${profile.gradient} pointer-events-none`}/>

                <div className="relative z-10 flex flex-col gap-5">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${profile.badge} ${profile.badgeText}`}>
                        {profile.icon}
                      </div>
                      <div>
                        <p className={`text-[10px] uppercase tracking-widest font-semibold mb-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Your Risk Profile
                        </p>
                        <h3 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {profile.emoji} {profile.label}
                        </h3>
                      </div>
                    </div>

                    {/* Risk meter bar */}
                    <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
                      <p className={`text-[10px] uppercase tracking-widest font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Risk Level
                      </p>
                      <div className={`w-full h-2 rounded-full ${isDark ? 'bg-white/8' : 'bg-gray-100'}`}>
                        <div className={`h-full rounded-full transition-all duration-700 ${profile.bar} ${profile.barWidth}`}/>
                      </div>
                    </div>
                  </div>

                  {/* Tagline */}
                  <p className={`text-sm font-semibold italic ${profile.badgeText}`}>
                    "{profile.tagline}"
                  </p>

                  {/* Explanation */}
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {profile.explanation}
                  </p>

                  {/* Divider */}
                  <div className={`border-t ${isDark ? 'border-white/6' : 'border-gray-100'}`}/>

                  {/* Recommendations */}
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Recommended Instruments
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {profile.recommendations.map((rec) => (<div key={rec} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium ${isDark
                    ? 'bg-white/4 border-white/8 text-gray-300'
                    : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                          <TrendingUp className={`w-3.5 h-3.5 flex-shrink-0 ${profile.badgeText}`}/>
                          {rec}
                        </div>))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary chips */}
              <div className={`rounded-2xl border p-4 flex flex-wrap gap-3 ${isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-100'}`}>
                <p className={`text-xs mr-1 self-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Based on:
                </p>
                {[
                { label: 'Age', value: `${age} yrs` },
                { label: 'Income', value: income },
                { label: 'Tolerance', value: tolerance },
            ].map((c) => (<span key={c.label} className={`text-xs px-3 py-1.5 rounded-lg font-semibold border ${isDark
                    ? 'bg-white/5 border-white/8 text-gray-300'
                    : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                    {c.label}:{' '}
                    <span className={`font-bold ${profile.badgeText}`}>{c.value}</span>
                  </span>))}
              </div>
            </>) : (
        /* Empty state */
        <div className={`flex-1 h-full min-h-[320px] rounded-2xl border border-dashed flex flex-col items-center justify-center gap-4 text-center ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <ShieldAlert className={`w-7 h-7 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}/>
              </div>
              <div>
                <p className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Your risk profile will appear here
                </p>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  Fill in your details and click &quot;Analyze Risk&quot;
                </p>
              </div>
            </div>)}
        </div>
      </div>

      {/* Disclaimer */}
      {profile && (<p className={`text-xs text-center pb-2 ${isDark ? 'text-gray-700' : 'text-gray-300'}`}>
          ⚠️ This risk analysis is for educational purposes only and does not constitute financial
          advice. Consult a SEBI-registered advisor before making investment decisions.
        </p>)}

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>);
}
