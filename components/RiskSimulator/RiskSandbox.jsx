'use client';
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Sparkles,
  Layers,
  Star,
  RefreshCw,
  Building,
  Globe,
  Clock,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { useWatchlistStore } from '@/store/watchlistStore';

// Sub-components
import { StockSearchSelect } from './StockSearchSelect';
import { HistoricalPriceChart } from './HistoricalPriceChart';
import { QuantitativeMetricsCard } from './QuantitativeMetricsCard';
import { ForecastWorkspace } from './ForecastWorkspace';
import { BacktestEvaluationCard } from './BacktestEvaluationCard';
import { InvestmentScenarioSimulator } from './InvestmentScenarioSimulator';
import { StockComparisonWorkspace } from './StockComparisonWorkspace';
import { AIQuantitativeExplainer } from './AIQuantitativeExplainer';

export function RiskSandbox() {
  const [symbol, setSymbol] = useState('RELIANCE.NS');
  const [compareSymbols, setCompareSymbols] = useState(['TCS.NS', 'HDFCBANK.NS']);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Forecast state
  const [selectedModel, setSelectedModel] = useState('gbm'); // 'gbm' | 'holt'
  const [selectedHorizon, setSelectedHorizon] = useState(90); // 30 | 90 | 252

  const { addItem, isInWatchlist } = useWatchlistStore();

  // Fetch full analysis data whenever symbol changes
  const fetchAnalysis = async (stockSymbol) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sandbox/analyze?symbol=${encodeURIComponent(stockSymbol)}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `Failed to analyze stock: ${stockSymbol}`);
      }
      setData(json);
    } catch (err) {
      console.error('[RiskSandbox] Fetch error:', err);
      setError(err.message || 'Unable to retrieve historical market data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis(symbol);
  }, [symbol]);

  const handleSelectPrimary = (newSym) => {
    setSymbol(newSym);
  };

  const handleAddCompare = (compSym) => {
    if (!compareSymbols.includes(compSym) && compSym !== symbol && compareSymbols.length < 4) {
      setCompareSymbols([...compareSymbols, compSym]);
    }
  };

  const handleRemoveCompare = (compSym) => {
    setCompareSymbols(compareSymbols.filter((s) => s !== compSym));
  };

  const quote = data?.quote;
  const metrics = data?.metrics;
  const inWatchlist = quote ? isInWatchlist(quote.symbol) : false;
  const curSymbol = quote?.currency === 'INR' ? '₹' : '$';

  return (
    <div className="space-y-8 pb-12">
      {/* ── 1. Search Bar & Market Selector ── */}
      <section className="bg-[#0c0c1c] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
        <StockSearchSelect
          selectedSymbol={symbol}
          onSelectPrimary={handleSelectPrimary}
          compareSymbols={compareSymbols}
          onAddCompare={handleAddCompare}
          onRemoveCompare={handleRemoveCompare}
        />
      </section>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-[#0c0c1c] border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">
              Retrieving 5-Year Historical Market Data for {symbol}
            </h4>
            <p className="text-xs text-gray-400">
              Validating adjusted prices, computing volatility, drawdowns, and fitting forecasting models...
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && !loading && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h4 className="text-base font-bold text-white">Stock Data Unavailable</h4>
          <p className="text-xs text-gray-300 max-w-xl mx-auto">{error}</p>
          <button
            onClick={() => fetchAnalysis(symbol)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Analysis</span>
          </button>
        </div>
      )}

      {/* Main Content when data is successfully loaded */}
      {!loading && !error && data && (
        <>
          {/* ── 2. Primary Stock Overview Header Banner ── */}
          <section className="bg-gradient-to-r from-[#121226] via-[#0e0e1e] to-[#121226] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Left: Ticker details & price */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {quote?.symbol}
                  </h2>
                  <span className="text-sm font-medium text-gray-300">
                    {quote?.shortName || quote?.longName}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold font-mono">
                    {quote?.exchange} • {quote?.currency}
                  </span>
                </div>

                {/* Price & Day Change */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                    {curSymbol}
                    {quote?.currentPrice?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                      quote?.percentChange >= 0
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {quote?.percentChange >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {quote?.percentChange >= 0 ? '+' : ''}
                      {quote?.change?.toFixed(2)} ({quote?.percentChange?.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Metadata Chips & Watchlist Button */}
              <div className="flex flex-wrap md:flex-col items-start md:items-end gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      addItem({
                        symbol: quote?.symbol,
                        shortName: quote?.shortName || quote?.symbol,
                        exchange: quote?.exchange,
                      })
                    }
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      inWatchlist
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${inWatchlist ? 'fill-current' : ''}`} />
                    <span>{inWatchlist ? 'Watchlisted' : 'Add to Watchlist'}</span>
                  </button>

                  <button
                    onClick={() => fetchAnalysis(symbol)}
                    className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Refresh data"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-[11px] text-gray-400 flex flex-col md:items-end gap-0.5 font-mono">
                  <span>
                    52W Range: {curSymbol}
                    {quote?.fiftyTwoWeekLow ?? '—'} - {curSymbol}
                    {quote?.fiftyTwoWeekHigh ?? '—'}
                  </span>
                  <span className="text-gray-500">
                    Source: {data.dataSummary?.source} • Synced: {new Date(data.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── 3. Five-Year Interactive Historical Chart ── */}
          <section>
            <HistoricalPriceChart
              series={metrics?.seriesWithMA || []}
              currency={quote?.currency}
              symbol={quote?.symbol}
            />
          </section>

          {/* ── 4. Historical Performance & Risk Metrics Grid ── */}
          <section>
            <QuantitativeMetricsCard metrics={metrics} currency={quote?.currency} />
          </section>

          {/* ── 5. Actual Statistical Forecasting Engine Workspace ── */}
          <section>
            <ForecastWorkspace
              historicalSeries={metrics?.seriesWithMA || []}
              forecasts={data.forecasts}
              currency={quote?.currency}
              symbol={quote?.symbol}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              selectedHorizon={selectedHorizon}
              onSelectHorizon={setSelectedHorizon}
            />
          </section>

          {/* ── 6. Walk-Forward Backtesting Evaluation Card ── */}
          <section>
            <BacktestEvaluationCard backtest={data.backtest} currency={quote?.currency} />
          </section>

          {/* ── 7. Investment Scenario Simulator ── */}
          <section>
            <InvestmentScenarioSimulator
              currentPrice={quote?.currentPrice || 100}
              currency={quote?.currency}
              symbol={quote?.symbol}
              forecasts={data.forecasts}
              selectedModel={selectedModel}
              selectedHorizon={selectedHorizon}
              maxDrawdown={metrics?.maxDrawdown || -25}
            />
          </section>

          {/* ── 8. Peer Stock Comparison & Screening ── */}
          <section>
            <StockComparisonWorkspace
              primarySymbol={quote?.symbol}
              compareSymbols={compareSymbols}
            />
          </section>

          {/* ── 9. AI Quantitative Explainer & Synthesis ── */}
          <section>
            <AIQuantitativeExplainer
              analysisData={data}
              selectedModel={selectedModel}
              selectedHorizon={selectedHorizon}
            />
          </section>

          {/* ── 10. Methodology, Data Source & Disclaimers Footer ── */}
          <section className="p-6 rounded-3xl bg-[#080812] border border-white/5 space-y-3 text-xs text-gray-500">
            <div className="flex items-center gap-2 text-gray-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-violet-400" />
              <span>Quantitative Methodology &amp; Regulatory Disclaimers</span>
            </div>
            <p className="leading-relaxed">
              <strong>Data Source:</strong> Real-time and 5-year daily adjusted historical records are provided via Yahoo Finance daily data feeds. Adjusted prices account for historical stock splits, bonus issues, and cash dividend adjustments.
            </p>
            <p className="leading-relaxed">
              <strong>Statistical Models:</strong> Forecasting utilizes Geometric Brownian Motion (GBM) with historical drift &amp; volatility and Holt&rsquo;s Linear Exponential Smoothing. Prediction intervals represent theoretical 95% log-normal confidence bounds that expand over time. Backtesting employs expanding-window walk-forward testing without data leakage.
            </p>
            <p className="leading-relaxed text-amber-500/80">
              <strong>Risk Warning:</strong> Vital Drop is an educational and analytical simulation engine. Historical returns, volatility measurements, and statistical forecasts do not guarantee or predict future market results. Nothing on this platform constitutes financial, tax, or investment advice.
            </p>
          </section>
        </>
      )}
    </div>
  );
}

export default RiskSandbox;
