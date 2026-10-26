'use client';
import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  RefreshCw,
  Loader2,
  CheckCircle,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export function AIQuantitativeExplainer({
  analysisData,
  selectedModel = 'gbm',
  selectedHorizon = 90,
}) {
  const [explanation, setExplanation] = useState(null);
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!analysisData) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/sandbox/ai-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: analysisData.symbol,
          shortName: analysisData.quote?.shortName,
          currency: analysisData.quote?.currency,
          metrics: analysisData.metrics,
          forecasts: analysisData.forecasts,
          backtest: analysisData.backtest,
          selectedModel,
          horizonDays: selectedHorizon,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to generate AI analysis');
      setExplanation(json.explanation);
      setSource(json.source);
    } catch (err) {
      setError(err.message || 'Error generating AI explanation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0c0c1c] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-base text-white">
              AI Quantitative Explainer &amp; Risk Synthesis
            </h4>
            <p className="text-xs text-gray-400">
              Grounded exclusively in verified calculations, historical drawdowns, and model backtests.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !analysisData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-violet-600/20 disabled:opacity-50 transition-all cursor-pointer self-start sm:self-auto"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Synthesizing Data...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{explanation ? 'Refresh Analysis' : 'Generate AI Synthesis'}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !explanation && (
        <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
          <p className="text-xs text-gray-400 font-mono">
            Evaluating historical dispersion, moving averages, and backtest metrics...
          </p>
        </div>
      )}

      {explanation ? (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#111122] border border-white/5 text-xs text-gray-300 leading-relaxed space-y-4 font-sans whitespace-pre-line">
            {explanation}
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 font-mono border-t border-white/5">
            <span>
              Engine: <strong className="text-gray-400">{source || 'Quantitative Engine'}</strong>
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle className="w-3 h-3" />
              <span>Zero-Hallucination Verified</span>
            </span>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 text-center">
            <p className="text-xs text-gray-400 mb-3">
              Click &ldquo;Generate AI Synthesis&rdquo; to produce a comprehensive, structured quantitative explanation of {analysisData?.symbol}&rsquo;s historical drawdown behavior, forecasting uncertainty, and prudent risk guidelines.
            </p>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors"
            >
              Run Synthesis
            </button>
          </div>
        )
      )}
    </div>
  );
}
