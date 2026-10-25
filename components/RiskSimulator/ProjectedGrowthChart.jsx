'use client';
import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatINR } from '@/lib/riskCalculations';

function CustomTooltip({ active, payload, label, isDark }) {
  if (active && payload && payload.length) {
    const invested = payload.find((p) => p.dataKey === 'invested')?.value || 0;
    const projected = payload.find((p) => p.dataKey === 'projected')?.value || 0;
    const growth = Math.max(0, projected - invested);
    const growthPercent = invested > 0 ? ((growth / invested) * 100).toFixed(1) : 0;

    return (
      <div
        className={`rounded-2xl border p-4 shadow-2xl text-xs space-y-2 backdrop-blur-xl ${
          isDark
            ? 'bg-[#0f0f1f]/95 border-white/10 text-white'
            : 'bg-white/95 border-gray-200 text-gray-900 shadow-gray-300'
        }`}
      >
        <p className="font-bold text-sm border-b pb-1.5 border-white/10">
          {label === 0 ? 'Initial Investment' : `Year ${label} Milestone`}
        </p>

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
              <span>Projected Wealth:</span>
            </span>
            <span className="font-extrabold text-sm text-violet-400">
              {formatINR(projected)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span>Total Invested:</span>
            </span>
            <span className="font-bold text-gray-300">{formatINR(invested)}</span>
          </div>

          <div className="flex items-center justify-between gap-6 pt-1 border-t border-white/5">
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Compound Growth:</span>
            </span>
            <span className="font-bold text-emerald-400">
              +{formatINR(growth)} ({growthPercent}%)
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function ProjectedGrowthChart({ data = [], isDark = true }) {
  const finalYear = data.length > 0 ? data[data.length - 1] : null;

  // Accessible text summary
  const summaryText = useMemo(() => {
    if (!finalYear) return 'No projection data available.';
    return `In ${finalYear.year} years, an illustrative contribution of ${formatINR(
      finalYear.invested
    )} could grow to approximately ${formatINR(
      finalYear.projected
    )}, representing an illustrative compound return of ${formatINR(
      finalYear.growth
    )}.`;
  }, [finalYear]);

  return (
    <div className="space-y-3">
      {/* Screen reader text summary */}
      <div className="sr-only" aria-live="polite">
        {summaryText}
      </div>

      <div className="w-full h-[340px] sm:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              {/* Projected Wealth Gradient */}
              <linearGradient id="projectedGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
              </linearGradient>

              {/* Total Invested Gradient */}
              <linearGradient id="investedGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>

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
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              formatter={(value) => (
                <span className={isDark ? 'text-gray-300 font-medium' : 'text-gray-700 font-medium'}>
                  {value === 'projected' ? 'Projected Wealth' : 'Total Capital Invested'}
                </span>
              )}
            />

            {/* Total Capital Invested (Baseline) */}
            <Area
              type="monotone"
              dataKey="invested"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#investedGlow)"
              name="invested"
            />

            {/* Projected Wealth (Total with Compound Growth) */}
            <Area
              type="monotone"
              dataKey="projected"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#projectedGlow)"
              name="projected"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-500 px-1 flex-wrap gap-2">
        <span>* Growth trajectory assumes consistent monthly compounding at the selected rate.</span>
        <span>Hypothetical simulation · Past performance does not guarantee future results</span>
      </div>
    </div>
  );
}

export default ProjectedGrowthChart;
