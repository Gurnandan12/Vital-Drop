'use client';
import React from 'react';
import {
  Wallet,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Flame,
} from 'lucide-react';
import { formatINR, RISK_PROFILES } from '@/lib/riskCalculations';

export function ContributionsVsGrowthCard({
  totalInvested = 0,
  finalValue = 0,
  growthAmount = 0,
  growthPercent = 0,
  comparisons = null,
  selectedProfile = 'moderate',
  onSelectProfile,
  isDark = true,
}) {
  const investedRatio = finalValue > 0 ? (totalInvested / finalValue) * 100 : 100;
  const growthRatio = Math.max(0, 100 - investedRatio);
  const multiple = totalInvested > 0 ? (finalValue / totalInvested).toFixed(2) : '1.00';

  return (
    <div className="space-y-6">
      {/* ── Big Result Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Capital Invested */}
        <div
          className={`p-5 rounded-3xl border ${
            isDark ? 'bg-white/3 border-white/8' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Contributed</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatINR(totalInvested)}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            Initial lump sum + cumulative monthly deposits
          </p>
        </div>

        {/* Illustrative Wealth Growth */}
        <div
          className={`p-5 rounded-3xl border ${
            isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Compound Growth</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">
            +{formatINR(growthAmount)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{growthPercent.toFixed(1)}% on invested capital</span>
          </div>
        </div>

        {/* Total Estimated Future Value */}
        <div
          className={`p-5 rounded-3xl border bg-gradient-to-br ${
            isDark
              ? 'from-violet-900/30 via-indigo-900/20 to-purple-900/30 border-violet-500/30'
              : 'from-violet-50 via-indigo-50 to-purple-50 border-violet-200'
          }`}
        >
          <div className="flex items-center justify-between text-violet-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Projected Portfolio</span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatINR(finalValue)}
          </p>
          <p className="text-[11px] text-violet-400 font-semibold mt-1">
            {multiple}x capital multiplier
          </p>
        </div>
      </div>

      {/* ── Proportion Bar ── */}
      <div
        className={`p-4 rounded-2xl border space-y-2 ${
          isDark ? 'bg-white/3 border-white/8' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex justify-between text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-blue-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Principal Contributed ({investedRatio.toFixed(1)}%)</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Compound Earnings ({growthRatio.toFixed(1)}%)</span>
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden flex">
          <div
            style={{ width: `${investedRatio}%` }}
            className="h-full bg-blue-500 transition-all duration-500"
            title={`Invested: ${formatINR(totalInvested)}`}
          />
          <div
            style={{ width: `${growthRatio}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            title={`Compound Earnings: ${formatINR(growthAmount)}`}
          />
        </div>
      </div>

      {/* ── Side-by-Side Scenario Pathways ── */}
      {comparisons && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Hypothetical Risk Pathways Comparison
            </h4>
            <span className="text-[11px] text-gray-500">Click a scenario to apply</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Conservative */}
            <button
              type="button"
              onClick={() => onSelectProfile && onSelectProfile('conservative')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedProfile === 'conservative'
                  ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                  : isDark
                  ? 'border-white/8 bg-white/3 hover:border-emerald-500/40'
                  : 'border-gray-200 bg-white hover:border-emerald-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Conservative</span>
                </span>
                <span className="text-[11px] font-semibold text-gray-400">
                  {RISK_PROFILES.conservative.defaultReturn}% p.a.
                </span>
              </div>
              <p className="text-xl font-black text-white">
                {formatINR(comparisons.conservative.finalValue)}
              </p>
              <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
                +{formatINR(comparisons.conservative.growthAmount)} growth
              </p>
            </button>

            {/* Moderate */}
            <button
              type="button"
              onClick={() => onSelectProfile && onSelectProfile('moderate')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedProfile === 'moderate'
                  ? 'border-violet-500 bg-violet-500/10 ring-1 ring-violet-500/30'
                  : isDark
                  ? 'border-white/8 bg-white/3 hover:border-violet-500/40'
                  : 'border-gray-200 bg-white hover:border-violet-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-violet-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Moderate</span>
                </span>
                <span className="text-[11px] font-semibold text-gray-400">
                  {RISK_PROFILES.moderate.defaultReturn}% p.a.
                </span>
              </div>
              <p className="text-xl font-black text-white">
                {formatINR(comparisons.moderate.finalValue)}
              </p>
              <p className="text-[11px] text-violet-400 mt-1 font-semibold">
                +{formatINR(comparisons.moderate.growthAmount)} growth
              </p>
            </button>

            {/* Aggressive */}
            <button
              type="button"
              onClick={() => onSelectProfile && onSelectProfile('aggressive')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedProfile === 'aggressive'
                  ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30'
                  : isDark
                  ? 'border-white/8 bg-white/3 hover:border-amber-500/40'
                  : 'border-gray-200 bg-white hover:border-amber-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Aggressive</span>
                </span>
                <span className="text-[11px] font-semibold text-gray-400">
                  {RISK_PROFILES.aggressive.defaultReturn}% p.a.
                </span>
              </div>
              <p className="text-xl font-black text-white">
                {formatINR(comparisons.aggressive.finalValue)}
              </p>
              <p className="text-[11px] text-amber-400 mt-1 font-semibold">
                +{formatINR(comparisons.aggressive.growthAmount)} growth
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContributionsVsGrowthCard;
