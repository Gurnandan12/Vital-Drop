'use client';
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatINR, RISK_PROFILES } from '@/lib/riskCalculations';

function CustomTooltip({ active, payload, label, isDark }) {
  if (active && payload && payload.length) {
    const invested = payload.find((p) => p.dataKey === 'invested')?.value || 0;
    const cons = payload.find((p) => p.dataKey === 'conservative')?.value || 0;
    const mod = payload.find((p) => p.dataKey === 'moderate')?.value || 0;
    const agg = payload.find((p) => p.dataKey === 'aggressive')?.value || 0;

    return (
      <div
        className={`rounded-2xl border p-4 shadow-2xl text-xs space-y-2.5 backdrop-blur-xl ${
          isDark
            ? 'bg-[#0f0f1f]/95 border-white/10 text-white'
            : 'bg-white/95 border-gray-200 text-gray-900 shadow-gray-300'
        }`}
      >
        <p className="font-bold text-sm border-b pb-1.5 border-white/10">
          {label === 0 ? 'Start (Year 0)' : `Year ${label} Comparison`}
        </p>

        <div className="space-y-1.5">
          {/* Aggressive */}
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Aggressive ({RISK_PROFILES.aggressive.defaultReturn}%):</span>
            </span>
            <span className="font-extrabold text-amber-400">{formatINR(agg)}</span>
          </div>

          {/* Moderate */}
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
              <span>Moderate ({RISK_PROFILES.moderate.defaultReturn}%):</span>
            </span>
            <span className="font-extrabold text-violet-400">{formatINR(mod)}</span>
          </div>

          {/* Conservative */}
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Conservative ({RISK_PROFILES.conservative.defaultReturn}%):</span>
            </span>
            <span className="font-extrabold text-emerald-400">{formatINR(cons)}</span>
          </div>

          {/* Invested */}
          <div className="flex items-center justify-between gap-6 pt-1.5 border-t border-white/5">
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>Total Contributed:</span>
            </span>
            <span className="font-bold text-gray-300">{formatINR(invested)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function ScenarioComparisonChart({ data = [], isDark = true }) {
  const finalYear = data.length > 0 ? data[data.length - 1] : null;

  const comparisonSummary = useMemo(() => {
    if (!finalYear) return '';
    return `At Year ${finalYear.year}: Capital invested is ${formatINR(
      finalYear.invested
    )}. Conservative outcome is ${formatINR(
      finalYear.conservative
    )}, Moderate is ${formatINR(finalYear.moderate)}, and Aggressive is ${formatINR(
      finalYear.aggressive
    )}.`;
  }, [finalYear]);

  return (
    <div className="space-y-3">
      <div className="sr-only" aria-live="polite">
        {comparisonSummary}
      </div>

      <div className="w-full h-[340px] sm:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
              vertical={false}
            />

            <XAxis
              dataKey="label"
              stroke={isDark ? '#6b7280' : '#9ca3af'}
              tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
            />

            <YAxis
              stroke={isDark ? '#6b7280' : '#9ca3af'}
              tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatINR(v, { compact: true })}
            />

            <Tooltip content={<CustomTooltip isDark={isDark} />} />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              formatter={(value) => {
                const map = {
                  aggressive: `Aggressive (${RISK_PROFILES.aggressive.defaultReturn}%)`,
                  moderate: `Moderate (${RISK_PROFILES.moderate.defaultReturn}%)`,
                  conservative: `Conservative (${RISK_PROFILES.conservative.defaultReturn}%)`,
                  invested: 'Capital Contributed',
                };
                return (
                  <span className={isDark ? 'text-gray-300 font-medium' : 'text-gray-700 font-medium'}>
                    {map[value] || value}
                  </span>
                );
              }}
            />

            {/* Baseline Capital Contributed */}
            <Line
              type="monotone"
              dataKey="invested"
              stroke="#64748b"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              name="invested"
            />

            {/* Conservative Line */}
            <Line
              type="monotone"
              dataKey="conservative"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={false}
              name="conservative"
            />

            {/* Moderate Line */}
            <Line
              type="monotone"
              dataKey="moderate"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              dot={false}
              name="moderate"
            />

            {/* Aggressive Line */}
            <Line
              type="monotone"
              dataKey="aggressive"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={false}
              name="aggressive"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-500 px-1 flex-wrap gap-2">
        <span>* Illustrative rates show theoretical path divergence over time.</span>
        <span>Hypothetical projections do not account for taxes, fees, or economic downturns</span>
      </div>
    </div>
  );
}

export default ScenarioComparisonChart;
