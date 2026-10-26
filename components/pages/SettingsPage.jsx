'use client';
import React, { useState } from 'react';
import {
  Settings,
  Wallet,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  Sliders,
  AlertTriangle,
  X,
} from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useStockStore } from '@/store/stockStore';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '../ui/Button';
import { PageHeader } from '../layout/PageHeader';

/**
 * SettingsPage — Controlled Preferences & Reset Form
 */
export function SettingsPage() {
  const { balance, setBalance, resetPortfolio } = usePortfolio();
  const { theme } = useStockStore();
  const isDark = theme === 'dark';

  // Preferences stored in localStorage
  const [defaultExchange, setDefaultExchange] = useLocalStorage('vitaldrop_pref_exchange', 'NSE');
  const [chartInterval, setChartInterval] = useLocalStorage('vitaldrop_pref_chart_interval', '1M');

  // Local form state
  const [customBalanceInput, setCustomBalanceInput] = useState(balance.toString());
  const [successMsg, setSuccessMsg] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    const parsed = parseFloat(customBalanceInput);
    if (!isNaN(parsed) && parsed > 0) {
      setBalance(parsed);
    }
    setSuccessMsg('Simulator settings saved successfully!');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Reset form settings back to platform defaults
  const handleResetFormDefaults = () => {
    setCustomBalanceInput('1000000');
    setDefaultExchange('NSE');
    setChartInterval('1M');
    setBalance(1000000);
    setSuccessMsg('Settings preferences restored to default (₹10,00,000, NSE, 1M)!');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Hard reset simulator data (cash, holdings, transactions, and cache)
  const handleExecuteResetAll = () => {
    try {
      resetPortfolio(1000000);
      setCustomBalanceInput('1000000');
      setDefaultExchange('NSE');
      setChartInterval('1M');

      // Clear legacy localStorage cache keys if present
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vitaldrop_cash_balance');
        localStorage.removeItem('vitaldrop_portfolio_holdings');
        localStorage.removeItem('vitaldrop_transactions');
      }

      setShowConfirmModal(false);
      setSuccessMsg('All simulator data, holdings, and transactions have been reset to default ₹10,00,000!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Error resetting portfolio:', err);
      setShowConfirmModal(false);
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
        <div
          id="settings-success-banner"
          className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-3 animate-in fade-in"
        >
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

        {/* Action Buttons: Reset Settings & Save */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            id="reset-settings-defaults-btn"
            onClick={handleResetFormDefaults}
            className="gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Settings to Default</span>
          </Button>

          <Button type="submit" variant="primary" size="md">
            Save Platform Settings
          </Button>
        </div>
      </form>

      {/* Danger Zone: Hard Simulator Reset */}
      <div
        className={`p-6 rounded-3xl border border-rose-500/20 bg-rose-500/5 space-y-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-rose-400 text-sm">
          <ShieldAlert className="w-4 h-4" />
          <span>Danger Zone: Hard Reset Simulator Data</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          This will wipe all active equity holdings, erase your transaction history, and restore your virtual cash balance to the default ₹10,00,000.
        </p>
        <Button
          type="button"
          variant="danger"
          size="sm"
          id="reset-all-simulator-data-btn"
          onClick={() => setShowConfirmModal(true)}
          className="gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Simulator Data</span>
        </Button>
      </div>

      {/* ── In-App Confirmation Modal ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0e0e1e] border border-white/15 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5 text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-base text-white">Confirm Hard Simulator Reset</h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-300">
              <p>
                Are you sure you want to perform a hard reset? This action will immediately:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-400 font-mono">
                <li>Reset virtual cash balance to ₹10,00,000</li>
                <li>Wipe all open stock positions &amp; holdings</li>
                <li>Erase transaction history log</li>
                <li>Restore execution preferences to default</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                id="confirm-hard-reset-btn"
                onClick={handleExecuteResetAll}
                className="bg-rose-600 hover:bg-rose-500 text-white gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Yes, Reset Everything</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
