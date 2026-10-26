'use client';
import React, { useState, useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  Info,
  DollarSign,
  Calculator,
  RefreshCw,
} from 'lucide-react';

export function InvestmentScenarioSimulator({
  currentPrice = 100,
  currency = 'INR',
  symbol = '',
  forecasts = {},
  selectedModel = 'gbm',
  selectedHorizon = 90,
  maxDrawdown = -25,
}) {
  const curSymbol = currency === 'INR' ? '₹' : '$';

  // State: Initial capital
  const defaultCapital = currency === 'INR' ? 100000 : 5000;
  const [capital, setCapital] = useState(defaultCapital);
  const [activeScenario, setActiveScenario] = useState('expected'); // 'expected' | 'bull' | 'crash'

  const activeModelData = forecasts?.[selectedModel] || forecasts?.gbm;
  const currentForecast = activeModelData?.forecasts?.[selectedHorizon];

  // Calculated shares
  const sharesCount = currentPrice > 0 ? capital / currentPrice : 0;

  // Scenario calculations
  const outcomes = useMemo(() => {
    if (!currentForecast || !currentPrice) {
      return {
        expected: { value: capital, profit: 0, pct: 0, price: currentPrice },
        bull: { value: capital, profit: 0, pct: 0, price: currentPrice },
        crash: { value: capital, profit: 0, pct: 0, price: currentPrice },
      };
    }

    // 1. Expected scenario (model projection)
    const expPrice = currentForecast.estimatedPrice;
    const expPct = currentForecast.pctChange;
    const expVal = capital * (1 + expPct / 100);

    // 2. Bull scenario (upper 95% prediction bound)
    const bullPrice = currentForecast.upper95;
    const bullPct = currentForecast.upper95Pct;
    const bullVal = capital * (1 + bullPct / 100);

    // 3. Vital Drop / Crash scenario (lower 95% prediction bound)
    const crashPrice = currentForecast.lower95;
    const crashPct = currentForecast.lower95Pct;
    const crashVal = capital * (1 + crashPct / 100);

    return {
      expected: {
        value: expVal,
        profit: expVal - capital,
        pct: expPct,
        price: expPrice,
        title: 'Expected Base Scenario',
        subtitle: `Central estimate based on ${activeModelData?.modelName || 'Statistical Drift'}`,
        color: 'emerald',
      },
      bull: {
        value: bullVal,
        profit: bullVal - capital,
        pct: bullPct,
        price: bullPrice,
        title: 'Bullish Outlier (+95% Band)',
        subtitle: 'Upper theoretical prediction boundary over selected horizon',
        color: 'violet',
      },
      crash: {
        value: crashVal,
        profit: crashVal - capital,
        pct: crashPct,
        price: crashPrice,
        title: 'Vital Drop / Crash Scenario (-95% Band)',
        subtitle: 'Downside stress scenario reflecting cumulative market volatility',
        color: 'rose',
      },
    };
  }, [capital, currentForecast, currentPrice, activeModelData]);

  const activeResult = outcomes[activeScenario] || outcomes.expected;

  return (
    <div className="bg-[#0c0c1c] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">
            Interactive Investment Scenario Simulator
          </h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 font-mono">
          Horizon: {selectedHorizon} Days
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Controls Column: Capital & Scenario Toggle */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Hypothetical Initial Capital ({currency})
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 font-mono font-bold">
                {curSymbol}
              </span>
              <input
                type="number"
                min="100"
                step={currency === 'INR' ? '1000' : '100'}
                value={capital}
                onChange={(e) => setCapital(Math.max(10, Number(e.target.value) || 0))}
                className="w-full pl-8 pr-4 py-3 bg-[#121226] border border-white/10 rounded-xl text-white font-mono font-bold text-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Quick Increment Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {(currency === 'INR'
                ? [25000, 50000, 100000, 500000]
                : [1000, 5000, 10000, 25000]
              ).map((val) => (
                <button
                  key={val}
                  onClick={() => setCapital(val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                    capital === val
                      ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300'
                      : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {curSymbol}
                  {val.toLocaleString()}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-2 font-mono">
              Equivalent position size: ~{sharesCount.toFixed(2)} shares at {curSymbol}
              {currentPrice.toFixed(2)} / share
            </p>
          </div>

          {/* Scenario Selector Cards */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Select Market Scenario
            </label>
            <div className="space-y-2">
              {/* Expected Scenario */}
              <div
                onClick={() => setActiveScenario('expected')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  activeScenario === 'expected'
                    ? 'bg-emerald-500/15 border-emerald-500/50 shadow-lg'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Expected Base Scenario
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {outcomes.expected.pct >= 0 ? '+' : ''}
                    {outcomes.expected.pct}%
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Expected drift price: {curSymbol}
                  {outcomes.expected.price}
                </p>
              </div>

              {/* Bull Scenario */}
              <div
                onClick={() => setActiveScenario('bull')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  activeScenario === 'bull'
                    ? 'bg-violet-500/15 border-violet-500/50 shadow-lg'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-400" />
                    Bullish Scenario (+95% Band)
                  </span>
                  <span className="font-mono font-bold text-violet-300">
                    +{outcomes.bull.pct}%
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Upper probability ceiling: {curSymbol}
                  {outcomes.bull.price}
                </p>
              </div>

              {/* Vital Drop Scenario */}
              <div
                onClick={() => setActiveScenario('crash')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  activeScenario === 'crash'
                    ? 'bg-rose-500/15 border-rose-500/50 shadow-lg'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Vital Drop / Crash Scenario
                  </span>
                  <span className="font-mono font-bold text-rose-400">
                    {outcomes.crash.pct}%
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Lower probability floor: {curSymbol}
                  {outcomes.crash.price}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Projected Outcome Display */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-gradient-to-br from-[#121226] to-[#0c0c1c] border border-white/10 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-400 block mb-1">
              {activeResult.title}
            </span>
            <p className="text-xs text-gray-400">{activeResult.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-gray-400 block mb-1">Initial Capital</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-white">
                {curSymbol}
                {capital.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div>
              <span className="text-xs text-gray-400 block mb-1">Projected End Value</span>
              <span
                className={`text-xl sm:text-2xl font-extrabold font-mono ${
                  activeResult.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {curSymbol}
                {activeResult.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 block">Hypothetical Net P&amp;L</span>
              <span
                className={`text-lg font-bold font-mono ${
                  activeResult.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {activeResult.profit >= 0 ? '+' : ''}
                {curSymbol}
                {Math.round(activeResult.profit).toLocaleString()}
              </span>
            </div>
            <div
              className={`text-right px-3 py-1.5 rounded-lg text-sm font-extrabold font-mono ${
                activeResult.pct >= 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {activeResult.pct >= 0 ? '+' : ''}
              {activeResult.pct}%
            </div>
          </div>

          <div className="space-y-2 text-[11px] text-gray-500 border-t border-white/5 pt-3">
            <p className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>
                Calculations reflect pure statistical drift/volatility formulas. Excludes taxes, brokerage commissions, and execution slippage.
              </span>
            </p>
            <p>
              Simulated outcomes do not represent real financial transactions or guaranteed returns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
