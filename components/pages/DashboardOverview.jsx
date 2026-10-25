'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Activity,
  TrendingUp,
  ShieldCheck,
  Calculator,
  SlidersHorizontal,
  Wand2,
  ShoppingCart,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StockHeader } from '@/components/StockHeader';
import { Watchlist } from '@/components/Watchlist';
import { TopMovers } from '@/components/TopMovers';
import { IndianMarketBenchmarks } from '@/components/IndianMarketBenchmarks';
import { useStockStore } from '@/store/stockStore';
import { RiskSandbox } from '@/components/RiskSimulator/RiskSandbox';
import { InsuranceRecommender } from '@/components/InsuranceRecommender/InsuranceRecommender';
import { SIPCalculator } from '@/components/SIPCalculator/SIPCalculator';
import { RiskAnalyzer } from '@/components/RiskAnalyzer/RiskAnalyzer';
import { WhatIfSimulator } from '@/components/WhatIfSimulator/WhatIfSimulator';
import { IndianMarketDashboard } from '@/components/IndianMarketDashboard/IndianMarketDashboard';
import { InvestmentBasket } from '@/components/basket/InvestmentBasket';
import { Button } from '../ui/Button';

// Dynamic import of heavy chart component
const StockChart = dynamic(() => import('@/components/StockChart').then((m) => ({ default: m.StockChart })), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-white/8 bg-[#0d0d1a] p-5 h-[380px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading chart…</p>
      </div>
    </div>
  ),
});

const QUICK_PICKS = {
  NSE: [
    { symbol: 'RELIANCE.NS', label: 'RELIANCE' },
    { symbol: 'TCS.NS', label: 'TCS' },
    { symbol: 'HDFCBANK.NS', label: 'HDFC Bank' },
    { symbol: 'INFY.NS', label: 'INFOSYS' },
    { symbol: 'ICICIBANK.NS', label: 'ICICI Bank' },
    { symbol: 'WIPRO.NS', label: 'WIPRO' },
  ],
  BSE: [
    { symbol: 'RELIANCE.BO', label: 'RELIANCE' },
    { symbol: 'TCS.BO', label: 'TCS' },
    { symbol: 'HDFCBANK.BO', label: 'HDFC Bank' },
    { symbol: 'INFY.BO', label: 'INFOSYS' },
    { symbol: 'ICICIBANK.BO', label: 'ICICI Bank' },
    { symbol: 'BAJFINANCE.BO', label: 'BAJ FIN' },
  ],
};

export function DashboardOverview() {
  const { theme, selectedSymbol, selectedName, setSelectedStock } = useStockStore();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('market');
  const [exchange, setExchange] = useState('NSE');

  const triggerTradeModal = (action = 'BUY') => {
    window.dispatchEvent(
      new CustomEvent('vitaldrop_open_trade', {
        detail: {
          stock: {
            symbol: selectedSymbol || 'RELIANCE.NS',
            name: selectedName || 'Reliance Industries Ltd.',
            exchange,
          },
          initialAction: action,
        },
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* ── SUB-TABS (PRESERVING EXISTING SUITE: Market View, Markets 🇮🇳, Risk Sandbox, etc.) ── */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-white/10 pb-px overflow-x-auto">
        {[
          { id: 'market', label: 'Market View', icon: <Activity className="w-4 h-4" /> },
          {
            id: 'markets',
            label: 'Markets 🇮🇳',
            icon: <TrendingUp className="w-4 h-4" />,
            badge: 'NEW',
            badgeStyle: isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700',
          },
          {
            id: 'risk',
            label: 'Risk Sandbox',
            icon: <Activity className="w-4 h-4" />,
            badge: 'AI',
            badgeStyle: isDark ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700',
          },
          {
            id: 'recommend',
            label: 'Recommender',
            icon: <ShieldCheck className="w-4 h-4" />,
            badge: 'NEW',
            badgeStyle: isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700',
          },
          { id: 'sip', label: 'SIP Calculator', icon: <Calculator className="w-4 h-4" /> },
          { id: 'riskanalyzer', label: 'Risk Analyzer', icon: <SlidersHorizontal className="w-4 h-4" /> },
          {
            id: 'basket',
            label: 'Thematic Basket',
            icon: <ShoppingBag className="w-4 h-4" />,
            badge: 'SMART',
            badgeStyle: isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700',
          },
          {
            id: 'whatif',
            label: 'What If',
            icon: <Wand2 className="w-4 h-4" />,
            badge: 'NEW',
            badgeStyle: isDark ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-fuchsia-100 text-fuchsia-700',
          },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const accentActive =
            tab.id === 'whatif'
              ? isDark
                ? 'border-fuchsia-500 text-white'
                : 'border-fuchsia-600 text-fuchsia-900'
              : isDark
              ? 'border-violet-500 text-white'
              : 'border-violet-600 text-violet-900';

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 flex-shrink-0 ${
                isActive
                  ? accentActive
                  : isDark
                  ? 'border-transparent text-gray-500 hover:text-gray-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${tab.badgeStyle}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── ACTIVE TAB CONTENT ── */}
      {activeTab === 'market' ? (
        <div className="flex flex-col gap-5">
          {/* Benchmark Bar */}
          <IndianMarketBenchmarks isDark={isDark} />

          {/* NSE / BSE Toggle + Quick Picks + Action Buttons */}
          <div
            className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between ${
              isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-100 shadow-sm'
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              {/* Toggle */}
              <div className={`flex rounded-xl p-1 gap-1 flex-shrink-0 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                {['NSE', 'BSE'].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setExchange(ex)}
                    className={`px-5 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      exchange === ex
                        ? ex === 'NSE'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                        : isDark
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {ex}
                  </button>
                ))}
              </div>

              {/* Quick pick chips */}
              <div className="flex flex-wrap gap-2">
                {QUICK_PICKS[exchange].map(({ symbol, label }) => (
                  <button
                    key={symbol}
                    onClick={() => setSelectedStock(symbol, label)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:scale-[1.03] ${
                      isDark
                        ? 'bg-white/4 border-white/8 text-gray-300 hover:border-blue-500/50 hover:text-blue-300'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Trade & Stock Details CTA */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                variant="success"
                size="sm"
                onClick={() => triggerTradeModal('BUY')}
                className="gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Trade {selectedSymbol ? selectedSymbol.split('.')[0] : 'Stock'}</span>
              </Button>

              <Link
                to={`/stock/${selectedSymbol || 'RELIANCE.NS'}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-gray-300 hover:text-white transition-all"
              >
                <span>Full Details</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Stock content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-6">
            {/* Left Column: Stock Info + Chart */}
            <div className="flex flex-col gap-5">
              <StockHeader />
              <StockChart />

              {/* Indian Market Info Banner */}
              <div
                className={`rounded-2xl border p-5 bg-gradient-to-r ${
                  isDark
                    ? 'from-blue-900/20 via-indigo-900/20 to-blue-900/20 border-blue-500/20'
                    : 'from-blue-50 via-indigo-50 to-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Indian Market Coverage — NSE &amp; BSE
                    </h4>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Search any NSE ticker with <code className="text-blue-400">.NS</code> suffix or BSE with{' '}
                      <code className="text-orange-400">.BO</code> — e.g.{' '}
                      <code className="text-blue-400">RELIANCE.NS</code>, <code className="text-blue-400">TCS.NS</code>,{' '}
                      <code className="text-orange-400">TCS.BO</code>. Indices:{' '}
                      <code className="text-violet-400">^NSEI</code>, <code className="text-violet-400">^BSESN</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="flex flex-col gap-5">
              <Watchlist />
              <TopMovers />
            </div>
          </div>
        </div>
      ) : activeTab === 'risk' ? (
        <RiskSandbox />
      ) : activeTab === 'recommend' ? (
        <InsuranceRecommender isDark={isDark} />
      ) : activeTab === 'sip' ? (
        <SIPCalculator isDark={isDark} />
      ) : activeTab === 'riskanalyzer' ? (
        <RiskAnalyzer isDark={isDark} />
      ) : activeTab === 'basket' ? (
        <InvestmentBasket />
      ) : activeTab === 'markets' ? (
        <IndianMarketDashboard isDark={isDark} />
      ) : (
        <WhatIfSimulator isDark={isDark} />
      )}
    </div>
  );
}

export default DashboardOverview;
