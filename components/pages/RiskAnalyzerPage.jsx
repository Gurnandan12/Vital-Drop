'use client';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  ShieldAlert,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  PieChart,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useStockStore } from '@/store/stockStore';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PageHeader } from '../layout/PageHeader';
import { StatCard } from '../ui/StatCard';
import { Button } from '../ui/Button';
import { RiskAnalyzer } from '../RiskAnalyzer/RiskAnalyzer';
import { RiskAnalyzerForm } from '../RiskAnalyzer/RiskAnalyzerForm';

/**
 * RiskAnalyzerPage — Dedicated Full Page Route (/risk-analyzer)
 * Features:
 * - Comprehensive validated Risk Analyzer Form with INR amounts, duration, goals,
 *   tolerance tiers, asset categories, optional SIP contributions, and expected returns.
 * - Interactive stress testing and asset allocation matrix.
 * - Quick questionnaire mode.
 * - Direct links to simulator execution.
 */
export function RiskAnalyzerPage() {
  const { theme } = useStockStore();
  const { balance, totalInvested, holdingsCount } = usePortfolio();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('strategy'); // 'strategy' | 'quick'

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* ── Page Header ── */}
      <PageHeader
        title="AI Risk Analyzer & Stress Tester"
        description="Calibrate your personal risk tolerance, model capital growth with SIP contributions, stress-test your equity allocations against market drawdowns, and tailor your simulator strategy."
        badge="AI Risk Engine"
        badgeVariant="violet"
        badgeIcon={SlidersHorizontal}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="primary" size="sm" className="gap-2">
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* ── Key Metrics Overview ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Simulator Capital"
          value={`₹${(balance + totalInvested).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subtitle="Total virtual assets to protect"
          icon={PieChart}
          isDark={isDark}
        />
        <StatCard
          title="Active Positions"
          value={holdingsCount.toString()}
          subtitle="Equities currently exposed"
          icon={Layers}
          isDark={isDark}
        />
        <StatCard
          title="India VIX Baseline"
          value="13.84"
          subtitle="Low market volatility zone"
          icon={Activity}
          isDark={isDark}
        />
        <StatCard
          title="Capital Protection Mode"
          value="Active"
          subtitle="Crash buffer enabled"
          icon={ShieldAlert}
          isDark={isDark}
        />
      </div>

      {/* ── Tool Switcher Sub-Tabs ── */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('strategy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'strategy'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
              : isDark
              ? 'text-gray-400 hover:text-white hover:bg-white/5'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Full Strategy &amp; Risk Profiler</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quick')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'quick'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
              : isDark
              ? 'text-gray-400 hover:text-white hover:bg-white/5'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Age &amp; Income Profiler</span>
        </button>
      </div>

      {/* ── Active Tool Component ── */}
      <div className="pt-2">
        {activeTab === 'strategy' ? (
          <RiskAnalyzerForm isDark={isDark} />
        ) : (
          <RiskAnalyzer isDark={isDark} />
        )}
      </div>

      {/* ── Bottom Strategy CTA ── */}
      <div
        className={`rounded-2xl border p-6 flex flex-col md:flex-row items-center justify-between gap-4 ${
          isDark
            ? 'bg-gradient-to-r from-violet-900/20 via-indigo-900/20 to-purple-900/20 border-violet-500/20'
            : 'bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 border-violet-200'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0 text-violet-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Ready to execute your calibrated strategy?
            </h3>
            <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Apply recommended equity-to-debt ratios in your virtual portfolio with ₹10 Lakhs risk-free capital.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/market">
            <Button variant="outline" size="sm">
              Explore Stocks
            </Button>
          </Link>
          <Link to="/portfolio">
            <Button variant="primary" size="sm">
              Review Portfolio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RiskAnalyzerPage;
