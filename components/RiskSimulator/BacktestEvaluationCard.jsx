'use client';
import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, HelpCircle, Layers, BarChart } from 'lucide-react';

export function BacktestEvaluationCard({ backtest, currency = 'INR' }) {
  if (!backtest || !backtest.available) return null;

  const curSymbol = currency === 'INR' ? '₹' : '$';
  const gbm = backtest.models?.gbm;
  const holt = backtest.models?.holt;
  const naive = backtest.models?.naive;

  return (
    <div className="bg-[#0c0c1c] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h4 className="font-bold text-base text-white">
            Chronological Walk-Forward Backtesting & Model Validation
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
            {backtest.foldsEvaluated} Historical Folds
          </span>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
            {backtest.testHorizonDays}-Day Forward Horizon
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        To eliminate data leakage, models were fitted on strictly historical expanding windows and tested on subsequent held-out {backtest.testHorizonDays}-day trading periods. Results are compared against a persistent Naive Drift baseline.
      </p>

      {/* Model Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 font-semibold">
              <th className="py-2.5 px-3">Model Candidate</th>
              <th className="py-2.5 px-3">MAE (Mean Abs Error)</th>
              <th className="py-2.5 px-3">RMSE (Root Mean Sq)</th>
              <th className="py-2.5 px-3">Directional Accuracy</th>
              <th className="py-2.5 px-3">vs. Naive Baseline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {/* GBM Row */}
            <tr className="hover:bg-white/[0.02] transition-colors">
              <td className="py-3 px-3 font-sans font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                <span>Geometric Brownian Motion</span>
              </td>
              <td className="py-3 px-3 text-gray-300">
                {curSymbol}
                {gbm?.mae}
              </td>
              <td className="py-3 px-3 text-gray-300">
                {curSymbol}
                {gbm?.rmse}
              </td>
              <td className="py-3 px-3 font-bold text-emerald-400">
                {gbm?.directionalAccuracy}%
              </td>
              <td className="py-3 px-3">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-sans font-semibold ${
                    gbm?.outperformsNaive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {gbm?.relativeRmseVsNaive}x RMSE
                </span>
              </td>
            </tr>

            {/* Holt Row */}
            <tr className="hover:bg-white/[0.02] transition-colors">
              <td className="py-3 px-3 font-sans font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Holt&rsquo;s Linear Smoothing</span>
              </td>
              <td className="py-3 px-3 text-gray-300">
                {curSymbol}
                {holt?.mae}
              </td>
              <td className="py-3 px-3 text-gray-300">
                {curSymbol}
                {holt?.rmse}
              </td>
              <td className="py-3 px-3 font-bold text-indigo-400">
                {holt?.directionalAccuracy}%
              </td>
              <td className="py-3 px-3">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-sans font-semibold ${
                    holt?.outperformsNaive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {holt?.relativeRmseVsNaive}x RMSE
                </span>
              </td>
            </tr>

            {/* Naive Baseline Row */}
            <tr className="bg-white/[0.01]">
              <td className="py-3 px-3 font-sans text-gray-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-500" />
                <span>Naive Baseline (No Change)</span>
              </td>
              <td className="py-3 px-3 text-gray-400">
                {curSymbol}
                {naive?.mae}
              </td>
              <td className="py-3 px-3 text-gray-400">
                {curSymbol}
                {naive?.rmse}
              </td>
              <td className="py-3 px-3 text-gray-400">50.0% (Random)</td>
              <td className="py-3 px-3 text-gray-500 font-sans">1.00x (Benchmark)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-gray-500 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-gray-400 shrink-0" />
        <span>
          Rigorous quantitative protocol: No model is advertised as infallible. High volatility assets inherently exhibit wider error margins.
        </span>
      </div>
    </div>
  );
}
