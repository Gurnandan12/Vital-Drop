'use client';
import React, { useState } from 'react';
import { Settings, Wallet, RotateCcw, ShieldAlert, CheckCircle2, Sliders, Bell } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useStockStore } from '@/store/stockStore';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '../ui/Button';
import { PageHeader } from '../layout/PageHeader';

/**
 * SettingsPage — Controlled Preferences & Reset Form
 * Demonstrates:
 * - Controlled components & Form handling
 * - Custom hooks (usePortfolio, useLocalStorage)
 * - Browser Storage management
 * - State management & validation feedback
 */
export function SettingsPage() {
  const { balance, setBalance, resetPortfolio } = usePortfolio();
  const { theme, toggleTheme } = useStockStore();
  const isDark = theme === 'dark';

  // Preferences stored in localStorage
  const [defaultExchange, setDefaultExchange] = useLocalStorage('vitaldrop_pref_exchange', 'NSE');
  const [orderConfirmation, setOrderConfirmation] = useLocalStorage('vitaldrop_pref_confirm', true);
  const [chartInterval, setChartInterval] = useLocalStorage('vitaldrop_pref_chart_interval', '1M');

  // Local form state
  const [customBalanceInput, setCustomBalanceInput] = useState(balance.toString());
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    const parsed = parseFloat(customBalanceInput);
    if (!isNaN(parsed) && parsed > 0) {
      setBalance(parsed);
    }
    setSuccessMsg('Simulator settings saved successfully!');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleResetAllData = () => {
    if (window.confirm('Are you sure you want to reset all simulator cash, holdings, and transaction history to default?')) {
      resetPortfolio(1000000);
      setCustomBalanceInput('1000000');
      setSuccessMsg('Simulator portfolio reset to default ₹10,00,000!');
      setTimeout(() => setSuccessMsg(null), 3500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* ── Page Header ── */}
      <PageHeader
        title="Simulator Settings"
        description="Customize your trading preferences, calibrate starting sandbox capital, and configure platform defaults."
        badge="Platform Preferences"
        badgeVariant="violet"
        badgeIcon={Settings}
      />

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* ── CONTROLLED FORM ── */}
      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* Virtual Capital Setup */}
        <div
          className={`p-6 rounded-3xl border space-y-4 ${
            isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-base">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Virtual Cash Balance Calibration</span>
          </div>
          <p className="text-xs text-gray-400">
            Set your desired paper trading balance to practice position sizing for different portfolio sizes.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { label: '₹5 Lakhs', val: 500000 },
              { label: '₹10 Lakhs (Default)', val: 1000000 },
              { label: '₹25 Lakhs', val: 2500000 },
            ].map(({ label, val }) => (
              <button
                key={val}
                type="button"
                onClick={() => setCustomBalanceInput(val.toString())}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  customBalanceInput === val.toString()
                    ? 'bg-violet-600/20 border-violet-500 text-violet-300 shadow-md shadow-violet-600/10'
                    : isDark
                    ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="custom-balance" className="block text-xs font-semibold text-gray-400 mb-1">
              Custom Cash Amount (₹)
            </label>
            <input
              id="custom-balance"
              type="number"
              min="1000"
              step="1000"
              value={customBalanceInput}
              onChange={(e) => setCustomBalanceInput(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl text-sm font-semibold border outline-none ${
                isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Trading Defaults */}
        <div
          className={`p-6 rounded-3xl border space-y-4 ${
            isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-base">
            <Sliders className="w-4 h-4 text-violet-400" />
            <span>Market Execution Defaults</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="default-exchange" className="block text-xs font-semibold text-gray-400 mb-1">
                Primary Exchange Preference
              </label>
              <select
                id="default-exchange"
                value={defaultExchange}
                onChange={(e) => setDefaultExchange(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium border outline-none ${
                  isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="NSE">National Stock Exchange (NSE .NS)</option>
                <option value="BSE">Bombay Stock Exchange (BSE .BO)</option>
              </select>
            </div>

            <div>
              <label htmlFor="default-chart" className="block text-xs font-semibold text-gray-400 mb-1">
                Default Chart Interval
              </label>
              <select
                id="default-chart"
                value={chartInterval}
                onChange={(e) => setChartInterval(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium border outline-none ${
                  isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="1D">1 Day (Intraday)</option>
                <option value="1W">1 Week</option>
                <option value="1M">1 Month (Default)</option>
                <option value="1Y">1 Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg">
            Save Platform Settings
          </Button>
        </div>
      </form>

      {/* Danger Zone: Simulator Reset */}
      <div
        className={`p-6 rounded-3xl border border-rose-500/20 bg-rose-500/5 space-y-3 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-rose-400 text-sm">
          <ShieldAlert className="w-4 h-4" />
          <span>Danger Zone: Hard Reset Simulator Data</span>
        </div>
        <p className="text-xs text-gray-400">
          This will wipe all active equity holdings, erase your transaction history, and restore your virtual cash balance to default. This action cannot be undone.
        </p>
        <Button
          variant="danger"
          size="sm"
          onClick={handleResetAllData}
          className="gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Simulator Data</span>
        </Button>
      </div>
    </div>
  );
}

export default SettingsPage;
