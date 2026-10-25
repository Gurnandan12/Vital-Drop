'use client';
import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  RotateCcw,
  Bookmark,
  Sliders,
  PieChart as PieIcon,
  LineChart as LineIcon,
  ShieldCheck,
  Zap,
  Flame,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useStockStore } from '@/store/stockStore';
import { useSandboxStore } from '@/store/sandboxStore';
import {
  calculateFutureValue,
  generateTrajectorySeries,
  calculateScenarioComparisons,
  formatINR,
  RISK_PROFILES,
  PRESET_SCENARIOS,
  clamp,
} from '@/lib/riskCalculations';

// Components
import { ProjectedGrowthChart } from './ProjectedGrowthChart';
import { ScenarioComparisonChart } from './ScenarioComparisonChart';
import { AssetAllocationChart } from './AssetAllocationChart';
import { ContributionsVsGrowthCard } from './ContributionsVsGrowthCard';
import { RiskExplanationCard } from './RiskExplanationCard';
import { SavedScenariosModal } from './SavedScenariosModal';
import { RangeSlider } from '../forms/RangeSlider';
import { NumberInput } from '../forms/NumberInput';

/**
 * RiskSandbox — Fully Interactive What-If Risk Sandbox
 *
 * Implements:
 * - Synchronized Range Sliders and Numeric Inputs for Initial Lump Sum, Monthly SIP, Duration, and Return
 * - Asset Allocation rebalancing across Equities, Debt, Gold, and Cash
 * - Dynamic Risk Profile switching (Conservative, Moderate, Aggressive)
 * - Immediate live recalculation with pure financial formulas (annuity due & compound interest)
 * - Interactive Recharts visualizations (Trajectory, Multi-Scenario comparison, Asset distribution)
 * - Scenario Saving, Loading, and Resetting via persistent Zustand store
 * - Transparent educational risk explanations and disclaimers
 */
export function RiskSandbox() {
  const { theme } = useStockStore();
  const isDark = theme === 'dark';

  // Global Zustand persistent state
  const {
    initialAmount,
    monthlyContribution,
    years,
    annualReturn,
    riskProfile,
    assetAllocation,
    savedScenarios,
    setInitialAmount,
    setMonthlyContribution,
    setYears,
    setAnnualReturn,
    setRiskProfile,
    setAssetAllocation,
    resetToDefaults,
    loadPreset,
    saveScenario,
    deleteScenario,
    applyScenario,
  } = useSandboxStore();

  // Local active tab for visualizations: 'trajectory' | 'comparison' | 'allocation'
  const [activeChartTab, setActiveChartTab] = useState('trajectory');
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);

  // Synchronized input handlers with safety clamps
  const handleInitialChange = (val) => {
    setInitialAmount(clamp(val, 0, 100000000, 0));
  };

  const handleMonthlyChange = (val) => {
    setMonthlyContribution(clamp(val, 0, 5000000, 0));
  };

  const handleYearsChange = (val) => {
    setYears(clamp(val, 1, 40, 10));
  };

  const handleReturnChange = (val) => {
    setAnnualReturn(clamp(val, 0, 35, 10));
  };

  // Live Calculations (Instant Memoized updates)
  const results = useMemo(() => {
    return calculateFutureValue({
      initialAmount,
      monthlyContribution,
      years,
      annualReturn,
    });
  }, [initialAmount, monthlyContribution, years, annualReturn]);

  const trajectoryData = useMemo(() => {
    return generateTrajectorySeries({
      initialAmount,
      monthlyContribution,
      years,
      annualReturn,
      customProfileId: riskProfile,
    });
  }, [initialAmount, monthlyContribution, years, annualReturn, riskProfile]);

  const comparisons = useMemo(() => {
    return calculateScenarioComparisons({
      initialAmount,
      monthlyContribution,
      years,
    });
  }, [initialAmount, monthlyContribution, years]);

  const activeProfile = RISK_PROFILES[riskProfile] || RISK_PROFILES.moderate;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── Page Header & Action Bar ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              What-If Risk Sandbox
            </h2>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${activeProfile.accentBg} ${activeProfile.accentBorder} ${activeProfile.accentText}`}
            >
              {activeProfile.name} Strategy
            </span>
          </div>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Explore compound growth, stress-test asset allocations, and simulate investment futures under varying risk conditions.
          </p>
        </div>

        {/* Global Control Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={resetToDefaults}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isDark
                ? 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                : 'border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={() => setIsVaultModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition-all"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Scenarios ({savedScenarios.length})</span>
          </button>
        </div>
      </div>

      {/* ── Preset Strategies Row ── */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Fast-Start Scenarios
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESET_SCENARIOS.map((preset) => {
            const prof = RISK_PROFILES[preset.riskProfile];
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => loadPreset(preset)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isDark
                    ? 'bg-[#0d0d1a] border-white/8 hover:border-violet-500/40 hover:bg-white/3'
                    : 'bg-white border-gray-200 hover:border-violet-400 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">{preset.title}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${prof.accentBg} ${prof.accentText}`}
                  >
                    {prof.name}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 line-clamp-1">{preset.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Two-Column Layout (Controls on Left, Visualizations on Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-start">
        {/* ── LEFT COLUMN: User Controls ── */}
        <div
          className={`p-6 rounded-3xl border space-y-6 ${
            isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-4 border-white/10">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Sliders className="w-4 h-4 text-violet-400" />
              <span>Investment Parameters</span>
            </h3>
            <span className="text-xs text-gray-400">INR (₹) Inputs</span>
          </div>

          {/* 1. Initial Investment Lump Sum */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="input-initial" className="font-bold text-gray-300">
                Initial Investment
              </label>
              <span className="text-violet-400 font-extrabold">{formatINR(initialAmount)}</span>
            </div>

            <NumberInput
              id="input-initial"
              value={initialAmount}
              onChange={handleInitialChange}
              min={0}
              max={100000000}
              step={10000}
              prefix="₹"
              placeholder="0"
            />

            <RangeSlider
              id="slider-initial"
              value={initialAmount}
              onChange={handleInitialChange}
              min={0}
              max={10000000}
              step={25000}
              minLabel="₹0"
              maxLabel="₹1 Cr"
              formatValue={(v) => formatINR(v, { compact: true })}
            />
          </div>

          {/* 2. Monthly Contribution (SIP) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="input-monthly" className="font-bold text-gray-300">
                Monthly Contribution (SIP)
              </label>
              <span className="text-violet-400 font-extrabold">
                {formatINR(monthlyContribution)}/mo
              </span>
            </div>

            <NumberInput
              id="input-monthly"
              value={monthlyContribution}
              onChange={handleMonthlyChange}
              min={0}
              max={5000000}
              step={1000}
              prefix="₹"
              placeholder="0"
            />

            <RangeSlider
              id="slider-monthly"
              value={monthlyContribution}
              onChange={handleMonthlyChange}
              min={0}
              max={200000}
              step={1000}
              minLabel="₹0"
              maxLabel="₹2 L/mo"
              formatValue={(v) => formatINR(v, { compact: true })}
            />
          </div>

          {/* 3. Duration in Years */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="input-years" className="font-bold text-gray-300">
                Time Horizon
              </label>
              <span className="text-violet-400 font-extrabold">{years} Years</span>
            </div>

            <NumberInput
              id="input-years"
              value={years}
              onChange={handleYearsChange}
              min={1}
              max={40}
              step={1}
              prefix=""
              suffix="Yrs"
              placeholder="10"
            />

            <RangeSlider
              id="slider-years"
              value={years}
              onChange={handleYearsChange}
              min={1}
              max={35}
              step={1}
              minLabel="1 Yr"
              maxLabel="35 Yrs"
              formatValue={(v) => `${v} Years`}
            />
          </div>

          {/* 4. Expected Annual Return */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="input-return" className="font-bold text-gray-300">
                Annual Return Assumption
              </label>
              <span className="text-violet-400 font-extrabold">{annualReturn}% p.a.</span>
            </div>

            <NumberInput
              id="input-return"
              value={annualReturn}
              onChange={handleReturnChange}
              min={0}
              max={35}
              step={0.5}
              prefix=""
              suffix="%"
              placeholder="12"
            />

            <RangeSlider
              id="slider-return"
              value={annualReturn}
              onChange={handleReturnChange}
              min={1}
              max={25}
              step={0.5}
              minLabel="1%"
              maxLabel="25%"
              formatValue={(v) => `${v}%`}
            />
          </div>

          {/* 5. Risk Scenario Selector Tabs */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
              Risk Scenario Model
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-white/5 border border-white/8">
              {/* Conservative */}
              <button
                type="button"
                onClick={() => setRiskProfile('conservative')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  riskProfile === 'conservative'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Conservative</span>
              </button>

              {/* Moderate */}
              <button
                type="button"
                onClick={() => setRiskProfile('moderate')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  riskProfile === 'moderate'
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Moderate</span>
              </button>

              {/* Aggressive */}
              <button
                type="button"
                onClick={() => setRiskProfile('aggressive')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  riskProfile === 'aggressive'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Aggressive</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-400 px-1 pt-1">{activeProfile.description}</p>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Live Calculations & Visualizations ── */}
        <div className="space-y-6">
          {/* Top Results Card */}
          <ContributionsVsGrowthCard
            totalInvested={results.totalInvested}
            finalValue={results.finalValue}
            growthAmount={results.growthAmount}
            growthPercent={results.growthPercent}
            comparisons={comparisons}
            selectedProfile={riskProfile}
            onSelectProfile={setRiskProfile}
            isDark={isDark}
          />

          {/* Interactive Chart Container with Navigation Tabs */}
          <div
            className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            {/* Visualizer Tab Switcher */}
            <div className="flex items-center justify-between border-b pb-4 border-white/10 flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveChartTab('trajectory')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeChartTab === 'trajectory'
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                      : isDark
                      ? 'text-gray-400 hover:text-white hover:bg-white/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Growth Trajectory</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChartTab('comparison')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeChartTab === 'comparison'
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                      : isDark
                      ? 'text-gray-400 hover:text-white hover:bg-white/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <LineIcon className="w-3.5 h-3.5" />
                  <span>3-Scenario Dispersion</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChartTab('allocation')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeChartTab === 'allocation'
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                      : isDark
                      ? 'text-gray-400 hover:text-white hover:bg-white/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <PieIcon className="w-3.5 h-3.5" />
                  <span>Asset Distribution</span>
                </button>
              </div>

              <div className="text-xs text-gray-400">
                Projection Horizon: <strong className="text-white">{years} Years</strong>
              </div>
            </div>

            {/* Render Active Visualizer */}
            {activeChartTab === 'trajectory' ? (
              <ProjectedGrowthChart data={trajectoryData} isDark={isDark} />
            ) : activeChartTab === 'comparison' ? (
              <ScenarioComparisonChart data={trajectoryData} isDark={isDark} />
            ) : (
              <AssetAllocationChart
                allocation={assetAllocation}
                onChange={setAssetAllocation}
                totalAmount={results.finalValue}
                isDark={isDark}
              />
            )}
          </div>

          {/* Risk Explanation, Assumptions & Uncertainties */}
          <RiskExplanationCard
            profileId={riskProfile}
            annualReturn={annualReturn}
            isDark={isDark}
          />
        </div>
      </div>

      {/* ── Saved Scenarios Modal ── */}
      <SavedScenariosModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        savedScenarios={savedScenarios}
        onSaveCurrent={saveScenario}
        onApplyScenario={applyScenario}
        onDeleteScenario={deleteScenario}
        currentParams={{ initialAmount, monthlyContribution, years, annualReturn, riskProfile }}
        isDark={isDark}
      />
    </div>
  );
}

export default RiskSandbox;
