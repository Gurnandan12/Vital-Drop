'use client';
import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Calendar, Eye, EyeOff, BarChart2 } from 'lucide-react';

export function HistoricalPriceChart({ series = [], currency = 'INR', symbol = '' }) {
  const [range, setRange] = useState('5Y'); // '1M' | '6M' | '1Y' | '3Y' | '5Y'
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA200, setShowSMA200] = useState(true);
  const [showVolume, setShowVolume] = useState(true);

  // Filter series based on selected range
  const filteredData = useMemo(() => {
    if (!series || series.length === 0) return [];
    const n = series.length;
    let daysCount = n;

    switch (range) {
      case '1M':
        daysCount = 22; // ~1 month of trading days
        break;
      case '6M':
        daysCount = 126;
        break;
      case '1Y':
        daysCount = 252;
        break;
      case '3Y':
        daysCount = 756;
        break;
      case '5Y':
      default:
        daysCount = n;
        break;
    }

    return series.slice(Math.max(0, n - daysCount));
  }, [series, range]);

  // Dynamic min and max for chart Y-axis with 5% padding
  const yDomain = useMemo(() => {
    if (filteredData.length === 0) return ['auto', 'auto'];
    let min = Infinity;
    let max = -Infinity;
    for (const d of filteredData) {
      const p = d.adjClose || d.close;
      if (p < min) min = p;
      if (p > max) max = p;
      if (showSMA50 && d.sma50) {
        if (d.sma50 < min) min = d.sma50;
        if (d.sma50 > max) max = d.sma50;
      }
      if (showSMA200 && d.sma200) {
        if (d.sma200 < min) min = d.sma200;
        if (d.sma200 > max) max = d.sma200;
      }
    }
    const pad = (max - min) * 0.06;
    return [Math.max(0, Math.floor(min - pad)), Math.ceil(max + pad)];
  }, [filteredData, showSMA50, showSMA200]);

  const currencySymbol = currency === 'INR' ? '₹' : '$';

  return (
    <div className="bg-[#0c0c1c] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Historical Performance & Trend Regimes
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium">
              Daily Adjusted
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Split-adjusted daily closing prices over 5 years. Overlay 50 & 200-day rolling moving averages to inspect structural market trend.
          </p>
        </div>

        {/* Range Selector Pills */}
        <div className="flex items-center gap-1 bg-[#14142a] p-1 rounded-xl border border-white/10 self-stretch sm:self-auto justify-between sm:justify-start">
          {['1M', '6M', '1Y', '3Y', '5Y'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                range === r
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Overlays Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-2 border-b border-white/5 text-xs">
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-1.5 cursor-pointer text-gray-300 hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={showSMA50}
              onChange={(e) => setShowSMA50(e.target.checked)}
              className="accent-amber-400 rounded cursor-pointer"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>50-Day SMA</span>
          </label>

          <label className="inline-flex items-center gap-1.5 cursor-pointer text-gray-300 hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={showSMA200}
              onChange={(e) => setShowSMA200(e.target.checked)}
              className="accent-cyan-400 rounded cursor-pointer"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>200-Day SMA</span>
          </label>

          <label className="inline-flex items-center gap-1.5 cursor-pointer text-gray-300 hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={showVolume}
              onChange={(e) => setShowVolume(e.target.checked)}
              className="accent-violet-500 rounded cursor-pointer"
            />
            <BarChart2 className="w-3.5 h-3.5 text-gray-400" />
            <span>Volume Bars</span>
          </label>
        </div>

        <div className="text-[11px] text-gray-500 font-mono">
          Showing {filteredData.length} daily trading sessions ({range})
        </div>
      </div>

      {/* Main Historical Chart */}
      <div className="w-full h-[360px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              tickFormatter={(d) => (range === '1M' ? d.slice(5) : d.slice(0, 7))}
              minTickGap={35}
            />
            <YAxis
              domain={yDomain}
              stroke="#6b7280"
              fontSize={11}
              orientation="right"
              tickLine={false}
              tickFormatter={(v) => `${currencySymbol}${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
            />
            {/* Secondary Y-Axis for Volume Bars */}
            {showVolume && (
              <YAxis
                yAxisId="vol"
                domain={[0, 'dataMax * 4']}
                orientation="left"
                hide={true}
              />
            )}
            <Tooltip
              content={
                <HistoricalChartTooltip
                  symbol={symbol}
                  currencySymbol={currencySymbol}
                  showSMA50={showSMA50}
                  showSMA200={showSMA200}
                  showVolume={showVolume}
                />
              }
            />

            {/* Volume Bars */}
            {showVolume && (
              <Bar
                yAxisId="vol"
                dataKey="volume"
                fill="#4c1d95"
                opacity={0.35}
                barSize={4}
                isAnimationActive={false}
              />
            )}

            {/* Adjusted Close Area Curve */}
            <Area
              type="monotone"
              dataKey="adjClose"
              stroke="#8b5cf6"
              strokeWidth={2.2}
              fill="url(#historicalGradient)"
              isAnimationActive={false}
            />

            {/* 50-Day Moving Average */}
            {showSMA50 && (
              <Line
                type="monotone"
                dataKey="sma50"
                stroke="#f59e0b"
                strokeWidth={1.8}
                dot={false}
                strokeDasharray="4 2"
                isAnimationActive={false}
              />
            )}

            {/* 200-Day Moving Average */}
            {showSMA200 && (
              <Line
                type="monotone"
                dataKey="sma200"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function HistoricalChartTooltip({
  active,
  payload,
  symbol,
  currencySymbol,
  showSMA50,
  showSMA200,
  showVolume,
}) {
  if (!active || !payload || !payload.length) return null;
  const dataPoint = payload[0]?.payload;
  if (!dataPoint) return null;

  return (
    <div className="bg-[#0e0e1e]/95 border border-white/15 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[200px]">
      <div className="text-gray-400 font-semibold border-b border-white/10 pb-1 flex items-center justify-between">
        <span>{dataPoint.date}</span>
        <span className="text-violet-400 font-mono">{symbol}</span>
      </div>
      <div className="flex justify-between items-center text-white font-mono">
        <span className="text-gray-400">Adjusted Close:</span>
        <span className="font-bold text-sm">
          {currencySymbol}
          {Number(dataPoint.adjClose || dataPoint.close).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
      {dataPoint.sma50 && showSMA50 && (
        <div className="flex justify-between items-center text-amber-300 font-mono">
          <span>50-Day SMA:</span>
          <span>
            {currencySymbol}
            {dataPoint.sma50.toFixed(2)}
          </span>
        </div>
      )}
      {dataPoint.sma200 && showSMA200 && (
        <div className="flex justify-between items-center text-cyan-300 font-mono">
          <span>200-Day SMA:</span>
          <span>
            {currencySymbol}
            {dataPoint.sma200.toFixed(2)}
          </span>
        </div>
      )}
      {dataPoint.volume && showVolume && (
        <div className="flex justify-between items-center text-gray-400 font-mono border-t border-white/5 pt-1">
          <span>Volume:</span>
          <span>{Number(dataPoint.volume).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
