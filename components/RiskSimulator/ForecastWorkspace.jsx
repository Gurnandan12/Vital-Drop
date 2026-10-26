'use client';
import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Info,
  Sliders,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export function ForecastWorkspace({
  historicalSeries = [],
  forecasts = {},
  currency = 'INR',
  symbol = '',
  selectedModel = 'gbm',
  onSelectModel,
  selectedHorizon = 90,
  onSelectHorizon,
}) {
  const curSymbol = currency === 'INR' ? '₹' : '$';

  const activeModelData = forecasts?.[selectedModel] || forecasts?.gbm;
  const currentForecast = activeModelData?.forecasts?.[selectedHorizon];

  // Combine historical tail (last 90 trading days) + future trajectory series
  const chartData = useMemo(() => {
    if (!historicalSeries || historicalSeries.length === 0 || !activeModelData) return [];

    // Take last 60 days of historical data for context
    const histTail = historicalSeries.slice(-60).map((d) => ({
      date: d.date,
      historicalPrice: d.adjClose || d.close,
      forecastPrice: null,
      lower95: null,
      upper95: null,
      isForecast: false,
    }));

    const lastHist = histTail[histTail.length - 1];
    const lastPrice = lastHist.historicalPrice;
    const lastDate = new Date(lastHist.date);

    // Bridge point at t=0
    histTail[histTail.length - 1].forecastPrice = lastPrice;
    histTail[histTail.length - 1].lower95 = lastPrice;
    histTail[histTail.length - 1].upper95 = lastPrice;

    // Filter trajectory steps up to selected horizon
    const trajectory = (activeModelData.trajectorySeries || []).slice(0, selectedHorizon);

    const forecastPoints = trajectory.map((t) => {
      // Approximate future calendar date skipping weekends
      const futureDate = new Date(lastDate);
      futureDate.setDate(lastDate.getDate() + Math.round(t.step * (7 / 5)));
      const dateStr = futureDate.toISOString().slice(0, 10);

      return {
        date: dateStr,
        step: t.step,
        historicalPrice: null,
        forecastPrice: t.forecastPrice,
        lower95: t.lower95,
        upper95: t.upper95,
        isForecast: true,
      };
    });

    return [...histTail, ...forecastPoints];
  }, [historicalSeries, activeModelData, selectedHorizon]);

  // Compute dynamic Y-domain for forecast chart
  const yDomain = useMemo(() => {
    if (chartData.length === 0) return ['auto', 'auto'];
    let min = Infinity;
    let max = -Infinity;
    for (const d of chartData) {
      const vals = [d.historicalPrice, d.forecastPrice, d.lower95, d.upper95].filter(Number.isFinite);
      for (const v of vals) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    const pad = (max - min) * 0.08;
    return [Math.max(0, Math.floor(min - pad)), Math.ceil(max + pad)];
  }, [chartData]);

  return (
    <div className="bg-[#0c0c1c] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden space-y-6">
      {/* Top Header & Model / Horizon Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Statistical Forecasting & Scenario Dispersion Engine
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Reproducible mathematical models calculating expected trajectories and statistically defensible 95% prediction intervals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Model Switcher */}
          <div className="flex items-center gap-1 bg-[#14142a] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => onSelectModel('gbm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedModel === 'gbm'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Geometric Brownian Motion (GBM)
            </button>
            <button
              onClick={() => onSelectModel('holt')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedModel === 'holt'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Holt&rsquo;s Trend Smoothing
            </button>
          </div>

          {/* Horizon Selector */}
          <div className="flex items-center gap-1 bg-[#14142a] p-1 rounded-xl border border-white/10">
            {[
              { days: 30, label: '30 Days' },
              { days: 90, label: '90 Days' },
              { days: 252, label: '1 Year' },
            ].map((h) => (
              <button
                key={h.days}
                onClick={() => onSelectHorizon(h.days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedHorizon === h.days
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Key Forecast Metrics Strip ── */}
      {currentForecast && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-gray-400 block mb-1">Observation Base Price</span>
            <span className="text-base font-bold text-white font-mono">
              {curSymbol}
              {currentForecast.currentPrice}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-emerald-300 block mb-1">Expected Projection</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                {curSymbol}
                {currentForecast.estimatedPrice}
              </span>
              <span
                className={`font-semibold ${
                  currentForecast.pctChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                ({currentForecast.pctChange >= 0 ? '+' : ''}
                {currentForecast.pctChange}%)
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <span className="text-rose-300 block mb-1">95% Downside Scenario</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-rose-400 font-mono">
                {curSymbol}
                {currentForecast.lower95}
              </span>
              <span className="text-rose-400 font-semibold">({currentForecast.lower95Pct}%)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <span className="text-violet-300 block mb-1">95% Upside Scenario</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-violet-300 font-mono">
                {curSymbol}
                {currentForecast.upper95}
              </span>
              <span className="text-violet-300 font-semibold">(+{currentForecast.upper95Pct}%)</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Forecast Chart with Prediction Intervals ── */}
      <div className="w-full h-[360px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              minTickGap={40}
            />
            <YAxis
              domain={yDomain}
              stroke="#6b7280"
              fontSize={11}
              orientation="right"
              tickLine={false}
              tickFormatter={(v) => `${curSymbol}${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
            />
            <Tooltip content={<ForecastChartTooltip curSymbol={curSymbol} />} />

            {/* Shaded Upper Prediction Interval Bound */}
            <Area
              type="monotone"
              dataKey="upper95"
              stroke="#8b5cf6"
              strokeWidth={1}
              strokeDasharray="3 3"
              fill="url(#bandGradient)"
              isAnimationActive={false}
            />

            {/* Lower Bound Line */}
            <Line
              type="monotone"
              dataKey="lower95"
              stroke="#f43f5e"
              strokeWidth={1.2}
              strokeDasharray="3 3"
              dot={false}
              isAnimationActive={false}
            />

            {/* Historical Observed Price (Solid Line) */}
            <Line
              type="monotone"
              dataKey="historicalPrice"
              stroke="#ffffff"
              strokeWidth={2.4}
              dot={false}
              isAnimationActive={false}
            />

            {/* Central Forecast Trajectory (Dashed Colored Line) */}
            <Line
              type="monotone"
              dataKey="forecastPrice"
              stroke="#10b981"
              strokeWidth={2.4}
              strokeDasharray="4 2"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Model Assumptions & Uncertainty Notice */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3 text-xs text-gray-400">
        <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block mb-0.5">Model Assumptions & Uncertainty Disclaimer:</strong>
          {activeModelData?.assumptions}{' '}
          <span className="text-amber-400 font-medium">
            Note: Prediction intervals widen as the horizon extends due to cumulative variance expansion (&radic;t).
            Forecasts represent statistical probability distributions, not guaranteed future prices.
          </span>
        </div>
      </div>
    </div>
  );
}

function ForecastChartTooltip({ active, payload, curSymbol }) {
  if (!active || !payload || !payload.length) return null;
  const pt = payload[0]?.payload;
  if (!pt) return null;

  return (
    <div className="bg-[#0e0e1e]/95 border border-white/15 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[210px]">
      <div className="text-gray-400 font-semibold border-b border-white/10 pb-1 flex justify-between">
        <span>{pt.date}</span>
        <span className="font-mono text-violet-400">
          {pt.isForecast ? `+${pt.step}d Forecast` : 'Actual Observation'}
        </span>
      </div>

      {pt.historicalPrice !== null && (
        <div className="flex justify-between items-center text-white font-mono">
          <span className="text-gray-400">Actual Price:</span>
          <span className="font-bold text-sm">
            {curSymbol}
            {Number(pt.historicalPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}

      {pt.isForecast && (
        <>
          <div className="flex justify-between items-center text-emerald-400 font-mono">
            <span className="text-gray-400">Projected Value:</span>
            <span className="font-bold text-sm">
              {curSymbol}
              {Number(pt.forecastPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center text-rose-300 font-mono">
            <span>Lower 95% Bound:</span>
            <span>
              {curSymbol}
              {pt.lower95}
            </span>
          </div>
          <div className="flex justify-between items-center text-violet-300 font-mono">
            <span>Upper 95% Bound:</span>
            <span>
              {curSymbol}
              {pt.upper95}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
