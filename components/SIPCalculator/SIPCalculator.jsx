'use client';
import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, } from 'recharts';
import { TrendingUp, Wallet, PiggyBank, BarChart2, Calculator } from 'lucide-react';
/* ─────────────────────────────────────────────
   SIP Formula
   FV = P × [((1 + r)^n - 1) / r] × (1 + r)
   r  = annual% / 12 / 100
   n  = years × 12
───────────────────────────────────────────── */
function calculateSIP(monthlyInvestment, years, annualReturn) {
    const r = annualReturn / 12 / 100;
    const n = years * 12;
    // Build chart data year-by-year
    const chartData = [];
    for (let y = 1; y <= years; y++) {
        const months = y * 12;
        const fv = r === 0
            ? monthlyInvestment * months
            : monthlyInvestment * (((Math.pow(1 + r, months) - 1) / r) * (1 + r));
        chartData.push({
            year: `Year ${y}`,
            invested: Math.round(monthlyInvestment * months),
            value: Math.round(fv),
        });
    }
    const finalValue = r === 0
        ? monthlyInvestment * n
        : monthlyInvestment * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const totalInvested = monthlyInvestment * n;
    return {
        totalInvested: Math.round(totalInvested),
        finalValue: Math.round(finalValue),
        profit: Math.round(finalValue - totalInvested),
        chartData,
    };
}
/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function formatINR(value) {
    if (value >= 10_000_000)
        return `₹${(value / 10_000_000).toFixed(2)} Cr`;
    if (value >= 100_000)
        return `₹${(value / 100_000).toFixed(2)} L`;
    return `₹${value.toLocaleString('en-IN')}`;
}
const CustomTooltip = ({ active, payload, label, isDark, }) => {
    if (active && payload && payload.length) {
        return (<div className={`rounded-xl border px-4 py-3 shadow-xl text-xs ${isDark
                ? 'bg-[#10101f]/95 border-white/10 text-white backdrop-blur-xl'
                : 'bg-white border-gray-200 text-gray-800 shadow-gray-200'}`}>
        <p className="font-bold mb-2">{label}</p>
        {payload.map((p) => (<p key={p.name} style={{ color: p.color }} className="flex justify-between gap-6">
            <span>{p.name}</span>
            <span className="font-semibold">{formatINR(p.value)}</span>
          </p>))}
      </div>);
    }
    return null;
};
/* ─────────────────────────────────────────────
   Input Field
───────────────────────────────────────────── */
function InputField({ id, label, value, onChange, min, max, step, prefix, suffix, isDark, }) {
    return (<div className="flex flex-col gap-2">
      <label htmlFor={id} className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {label}
      </label>
      <div className="relative">
        {prefix && (<span className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {prefix}
          </span>)}
        <input id={id} type="number" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className={`w-full rounded-xl border py-3 text-sm font-semibold transition-all outline-none focus:ring-2 ${prefix ? 'pl-8 pr-4' : suffix ? 'pl-4 pr-10' : 'px-4'} ${isDark
            ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:ring-violet-500/40 focus:border-violet-500/50'
            : 'bg-white border-gray-200 text-gray-800 focus:ring-violet-400/30 focus:border-violet-400'}`}/>
        {suffix && (<span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {suffix}
          </span>)}
      </div>
      {/* Range slider */}
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-violet-500"/>
      <div className={`flex justify-between text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
        <span>{prefix}{min.toLocaleString('en-IN')}{suffix}</span>
        <span>{prefix}{max.toLocaleString('en-IN')}{suffix}</span>
      </div>
    </div>);
}
/* ─────────────────────────────────────────────
   Result Card
───────────────────────────────────────────── */
function ResultCard({ label, value, icon, accent, isDark, }) {
    return (<div className={`rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDark
            ? 'bg-[#0d0d1a] border-white/8 hover:border-white/20'
            : 'bg-white border-gray-100 hover:border-violet-200 hover:shadow-violet-100'}`}>
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
export function SIPCalculator({ isDark }) {
    const [monthly, setMonthly] = useState(5000);
    const [years, setYears] = useState(10);
    const [returnRate, setReturnRate] = useState(12);
    const [calculated, setCalculated] = useState(false);
    const [result, setResult] = useState(null);
    const handleCalculate = () => {
        const res = calculateSIP(monthly, years, returnRate);
        setResult(res);
        setCalculated(true);
    };
    // Live preview (optional — updates as sliders move after first calculation)
    const livePreview = useMemo(() => (calculated ? calculateSIP(monthly, years, returnRate) : null), [calculated, monthly, years, returnRate]);
    const displayed = livePreview ?? result;
    return (<div className="flex flex-col gap-8">
      {/* ── Header ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Calculator className="w-5 h-5 text-white"/>
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              SIP Calculator
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Project your Systematic Investment Plan returns with compound growth
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* ── Left: Inputs ── */}
        <div className={`rounded-2xl border p-6 flex flex-col gap-6 ${isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-100 shadow-sm'}`}>
          <InputField id="sip-monthly" label="Monthly Investment" value={monthly} onChange={setMonthly} min={500} max={200000} step={500} prefix="₹" isDark={isDark}/>

          <InputField id="sip-years" label="Investment Duration" value={years} onChange={setYears} min={1} max={40} step={1} suffix=" yrs" isDark={isDark}/>

          <InputField id="sip-return" label="Expected Annual Return" value={returnRate} onChange={setReturnRate} min={1} max={40} step={0.5} suffix="%" isDark={isDark}/>

          <button id="sip-calculate-btn" onClick={handleCalculate} className="mt-2 flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]">
            <TrendingUp className="w-4 h-4"/>
            Calculate Returns
          </button>

          {/* Quick summary below form */}
          {displayed && (<div className={`rounded-xl border p-4 flex flex-col gap-2 mt-auto ${isDark ? 'bg-white/3 border-white/6' : 'bg-gray-50 border-gray-100'}`}>
              <p className={`text-[10px] uppercase tracking-widest font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Wealth Gain Ratio
              </p>
              <p className={`text-2xl font-extrabold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {((displayed.finalValue / displayed.totalInvested) * 100 - 100).toFixed(1)}%
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Your money grows{' '}
                <span className="font-bold text-emerald-400">
                  {(displayed.finalValue / displayed.totalInvested).toFixed(2)}×
                </span>{' '}
                over {years} years
              </p>
            </div>)}
        </div>

        {/* ── Right: Results + Chart ── */}
        <div className="flex flex-col gap-5">
          {/* Result cards */}
          {displayed ? (<>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ResultCard label="Total Invested" value={displayed.totalInvested} icon={<Wallet className="w-5 h-5"/>} accent="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30" isDark={isDark}/>
                <ResultCard label="Final Value" value={displayed.finalValue} icon={<TrendingUp className="w-5 h-5"/>} accent="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30" isDark={isDark}/>
                <ResultCard label="Total Profit" value={displayed.profit} icon={<PiggyBank className="w-5 h-5"/>} accent="bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/30" isDark={isDark}/>
              </div>

              {/* Chart */}
              <div className={`rounded-2xl border p-5 ${isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-100 shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-5">
                  <BarChart2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}/>
                  <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Investment Growth Over Time
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={displayed.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradInvested" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.03}/>
                      </linearGradient>
                      <linearGradient id="gradValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.45}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.03}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}/>
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: isDark ? '#6b7280' : '#9ca3af' }} tickLine={false} axisLine={false} interval={Math.floor(displayed.chartData.length / 6)}/>
                    <YAxis tickFormatter={(v) => formatINR(v)} tick={{ fontSize: 10, fill: isDark ? '#6b7280' : '#9ca3af' }} tickLine={false} axisLine={false} width={72}/>
                    <Tooltip content={<CustomTooltip isDark={isDark}/>}/>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 16, color: isDark ? '#9ca3af' : '#6b7280' }}/>
                    <Area type="monotone" dataKey="invested" name="Invested" stroke="#6366f1" strokeWidth={2} fill="url(#gradInvested)" dot={false} activeDot={{ r: 4, fill: '#6366f1' }}/>
                    <Area type="monotone" dataKey="value" name="Portfolio Value" stroke="#10b981" strokeWidth={2.5} fill="url(#gradValue)" dot={false} activeDot={{ r: 5, fill: '#10b981' }}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>) : (
        /* Empty state */
        <div className={`flex-1 rounded-2xl border border-dashed p-16 flex flex-col items-center justify-center gap-4 text-center ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <Calculator className={`w-7 h-7 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}/>
              </div>
              <div>
                <p className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Results will appear here
                </p>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  Adjust the sliders and click &quot;Calculate Returns&quot;
                </p>
              </div>
            </div>)}
        </div>
      </div>

      {/* Disclaimer */}
      {displayed && (<p className={`text-xs text-center pb-2 ${isDark ? 'text-gray-700' : 'text-gray-300'}`}>
          ⚠️ Returns shown are estimated and not guaranteed. Mutual fund investments are subject to market risks. Past performance is not indicative of future results.
        </p>)}
    </div>);
}
