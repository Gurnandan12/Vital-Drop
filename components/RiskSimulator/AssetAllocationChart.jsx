'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatINR } from '@/lib/riskCalculations';

const ASSET_CLASSES = [
  {
    key: 'equity',
    name: 'Equity (Large & Mid Cap)',
    color: '#8b5cf6', // Violet
    bgLight: 'bg-violet-500/15',
    textLight: 'text-violet-400',
    description: 'High-growth Indian equities aiming for wealth compounding above inflation.',
  },
  {
    key: 'debt',
    name: 'Debt & Fixed Income',
    color: '#3b82f6', // Blue
    bgLight: 'bg-blue-500/15',
    textLight: 'text-blue-400',
    description: 'Government securities and AAA corporate bonds for stability and steady coupons.',
  },
  {
    key: 'gold',
    name: 'Gold & Commodities',
    color: '#f59e0b', // Amber/Gold
    bgLight: 'bg-amber-500/15',
    textLight: 'text-amber-400',
    description: 'Sovereign Gold Bonds / physical ETFs acting as a geopolitical hedge.',
  },
  {
    key: 'cash',
    name: 'Cash & Liquid Equiv.',
    color: '#10b981', // Emerald
    bgLight: 'bg-emerald-500/15',
    textLight: 'text-emerald-400',
    description: 'Overnight & liquid funds for tactical flexibility and immediate liquidity.',
  },
];

function CustomPieTooltip({ active, payload, totalAmount, isDark }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    const assetAmt = totalAmount > 0 ? (totalAmount * data.value) / 100 : 0;

    return (
      <div
        className={`rounded-2xl border p-3 shadow-2xl text-xs backdrop-blur-xl ${
          isDark
            ? 'bg-[#0f0f1f]/95 border-white/10 text-white'
            : 'bg-white/95 border-gray-200 text-gray-900 shadow-gray-300'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.fill }} />
          <span className="font-bold">{data.name}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-gray-300">
          <span>Allocation:</span>
          <span className="font-extrabold">{data.value}%</span>
        </div>
        {totalAmount > 0 && (
          <div className="flex items-center justify-between gap-4 text-violet-400 pt-1 border-t border-white/5 font-bold">
            <span>Projected Value:</span>
            <span>{formatINR(assetAmt)}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
}

export function AssetAllocationChart({
  allocation = { equity: 60, debt: 25, gold: 10, cash: 5 },
  onChange,
  totalAmount = 0,
  isDark = true,
}) {
  const chartData = [
    { name: 'Equity', value: Math.max(0, allocation.equity || 0), fill: '#8b5cf6' },
    { name: 'Debt', value: Math.max(0, allocation.debt || 0), fill: '#3b82f6' },
    { name: 'Gold', value: Math.max(0, allocation.gold || 0), fill: '#f59e0b' },
    { name: 'Cash', value: Math.max(0, allocation.cash || 0), fill: '#10b981' },
  ].filter((d) => d.value > 0);

  const totalPercent =
    (allocation.equity || 0) +
    (allocation.debt || 0) +
    (allocation.gold || 0) +
    (allocation.cash || 0);

  const isBalanced = totalPercent === 100;

  // Handler to adjust an asset and balance
  const handleSliderChange = (key, newVal) => {
    if (!onChange) return;
    const clamped = Math.max(0, Math.min(100, Math.round(newVal)));
    onChange({ [key]: clamped });
  };

  // Quick Normalizer to 100%
  const handleNormalize = () => {
    if (!onChange || totalPercent === 0) return;
    const factor = 100 / totalPercent;
    const normEquity = Math.round((allocation.equity || 0) * factor);
    const normDebt = Math.round((allocation.debt || 0) * factor);
    const normGold = Math.round((allocation.gold || 0) * factor);
    const normCash = Math.max(0, 100 - (normEquity + normDebt + normGold));

    onChange({
      equity: normEquity,
      debt: normDebt,
      gold: normGold,
      cash: normCash,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top row: Donut visual + breakdown badges */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-center">
        {/* Donut Chart with center label */}
        <div className="relative w-full h-[220px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomPieTooltip totalAmount={totalAmount} isDark={isDark} />} />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={88}
                paddingAngle={3}
                dataKey="value"
                stroke={isDark ? '#0d0d1a' : '#ffffff'}
                strokeWidth={3}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total</span>
            <span
              className={`text-2xl font-black ${
                isBalanced ? (isDark ? 'text-white' : 'text-gray-900') : 'text-amber-400'
              }`}
            >
              {totalPercent}%
            </span>
            <span className="text-[10px] text-gray-500">
              {isBalanced ? 'Balanced' : 'Needs Rebalance'}
            </span>
          </div>
        </div>

        {/* Legend Cards & Allocations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Asset Class Allocation
            </h4>
            {!isBalanced && (
              <button
                type="button"
                onClick={handleNormalize}
                className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold hover:bg-amber-500/30 transition-colors"
              >
                Auto-Balance to 100%
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ASSET_CLASSES.map((item) => {
              const val = allocation[item.key] || 0;
              const approxAmount = totalAmount > 0 ? (totalAmount * val) / 100 : 0;

              return (
                <div
                  key={item.key}
                  className={`p-3 rounded-2xl border transition-all ${
                    isDark ? 'bg-white/3 border-white/8' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name.split(' ')[0]}</span>
                    </span>
                    <span className="font-black text-sm">{val}%</span>
                  </div>

                  {totalAmount > 0 && (
                    <div className="flex justify-between text-[11px] text-gray-400 mb-2">
                      <span>Capital Value:</span>
                      <span className="font-semibold text-gray-300">{formatINR(approxAmount)}</span>
                    </div>
                  )}

                  {/* Range Slider for tuning */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={val}
                    onChange={(e) => handleSliderChange(item.key, e.target.value)}
                    style={{
                      background: isDark
                        ? `linear-gradient(to right, ${item.color} 0%, ${item.color} ${val}%, rgba(255,255,255,0.1) ${val}%, rgba(255,255,255,0.1) 100%)`
                        : `linear-gradient(to right, ${item.color} 0%, ${item.color} ${val}%, #e5e7eb ${val}%, #e5e7eb 100%)`,
                    }}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssetAllocationChart;
