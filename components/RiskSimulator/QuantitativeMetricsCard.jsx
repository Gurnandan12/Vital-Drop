'use client';
import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Activity,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  BarChart,
  Zap,
} from 'lucide-react';

export function QuantitativeMetricsCard({ metrics, currency = 'INR' }) {
  if (!metrics) return null;

  const curSymbol = currency === 'INR' ? '₹' : '$';

  return (
    <div className="space-y-6">
      {/* ── Top Level 4-Metric Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. 5-Year Cumulative Return */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0e0e1e] border border-white/10 hover:border-violet-500/30 transition-all shadow-md">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>5Y Cumulative Return</span>
            {metrics.cumulativeReturn >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              metrics.cumulativeReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {metrics.cumulativeReturn >= 0 ? '+' : ''}
            {metrics.cumulativeReturn}%
          </div>
          <p className="text-[11px] text-gray-500 mt-1.5">
            Annualized: <strong className="text-gray-300">{metrics.annualizedReturn}% p.a.</strong>
          </p>
        </div>

        {/* 2. Annualized Volatility */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0e0e1e] border border-white/10 hover:border-violet-500/30 transition-all shadow-md">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Annualized Volatility</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {metrics.annualizedVolatility}%
          </div>
          <p className="text-[11px] text-gray-500 mt-1.5">
            Daily Std Dev &times; &radic;252 trading sessions
          </p>
        </div>

        {/* 3. Maximum Historical Drawdown */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0e0e1e] border border-white/10 hover:border-violet-500/30 transition-all shadow-md">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Maximum Drawdown</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-400">
            {metrics.maxDrawdown}%
          </div>
          <p className="text-[11px] text-gray-500 mt-1.5 truncate" title={`Peak: ${metrics.mddPeakDate} -> Trough: ${metrics.mddTroughDate}`}>
            Peak: {metrics.mddPeakDate || 'N/A'} &rarr; Trough: {metrics.mddTroughDate || 'N/A'}
          </p>
        </div>

        {/* 4. Sharpe Ratio */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0e0e1e] border border-white/10 hover:border-violet-500/30 transition-all shadow-md">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Sharpe Ratio (Risk-Adj)</span>
            <Zap className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {metrics.sharpeRatio}
          </div>
          <p className="text-[11px] text-gray-500 mt-1.5">
            Sortino (Downside): <strong className="text-gray-300">{metrics.sortinoRatio}</strong>
          </p>
        </div>
      </div>

      {/* ── Calendar Year Returns & Historical Extremes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Year Returns Breakdown */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-[#0c0c1c] border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              <h4 className="font-bold text-sm text-white">Calendar-Year Total Returns</h4>
            </div>
            <span className="text-[11px] text-gray-500 font-mono">Adjusted Price Basis</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {metrics.calendarReturns?.map((yr) => (
              <div
                key={yr.year}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col justify-between"
              >
                <span className="text-xs font-semibold text-gray-400">{yr.year}</span>
                <span
                  className={`text-base font-bold my-1 ${
                    yr.returnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {yr.returnPct >= 0 ? '+' : ''}
                  {yr.returnPct}%
                </span>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full ${
                      yr.returnPct >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.abs(yr.returnPct) * 1.5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Best & Worst Extremes */}
        <div className="p-5 rounded-3xl bg-[#0c0c1c] border border-white/10 shadow-lg flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h4 className="font-bold text-sm text-white">Historical Volatility Extremes</h4>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div>
                <span className="text-emerald-300 font-semibold block">Best 1-Day Session</span>
                <span className="text-[10px] text-gray-400">{metrics.bestDay?.date}</span>
              </div>
              <span className="text-base font-extrabold text-emerald-400">
                +{metrics.bestDay?.returnPct}%
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <div>
                <span className="text-rose-300 font-semibold block">Worst 1-Day Drop</span>
                <span className="text-[10px] text-gray-400">{metrics.worstDay?.date}</span>
              </div>
              <span className="text-base font-extrabold text-rose-400">
                {metrics.worstDay?.returnPct}%
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <span className="text-gray-300 font-semibold block">Volume Momentum</span>
                <span className="text-[10px] text-gray-400">20-day vs 90-day avg volume</span>
              </div>
              <span className="text-sm font-bold text-violet-300">
                {metrics.volumeTrend?.momentum} ({metrics.volumeTrend?.ratio}x)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
