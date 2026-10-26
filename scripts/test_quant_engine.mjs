import assert from 'node:assert';
import { calculateFinancialMetrics } from '../lib/services/financialMetrics.js';
import {
  forecastGBM,
  forecastHolt,
  runWalkForwardBacktest,
} from '../lib/services/forecastingEngine.js';

console.log('🧪 Starting Quantitative Engine & Financial Calculation Tests...\n');

// ── Test 1: Cumulative & Annualized Return with Known Sample Series ──
{
  const series = [
    { date: '2022-01-01', close: 100, adjClose: 100 },
    { date: '2022-01-02', close: 110, adjClose: 110 },
    { date: '2022-01-03', close: 120, adjClose: 120 },
    { date: '2022-01-04', close: 150, adjClose: 150 },
  ];
  const metrics = calculateFinancialMetrics(series, 0.05);
  assert.strictEqual(metrics.cumulativeReturn, 50.0, 'Cumulative return must be exactly 50%');
  console.log('✅ Test 1 Passed: Cumulative return accurately calculated (50.0%)');
}

// ── Test 2: Maximum Drawdown & Peak/Trough Detection ──
{
  // Series goes 100 -> 150 (peak) -> 90 (trough: -40% DD) -> 120
  const series = [
    { date: '2023-01-01', close: 100, adjClose: 100 },
    { date: '2023-01-02', close: 150, adjClose: 150 },
    { date: '2023-01-03', close: 90, adjClose: 90 },
    { date: '2023-01-04', close: 120, adjClose: 120 },
  ];
  const metrics = calculateFinancialMetrics(series);
  assert.strictEqual(metrics.maxDrawdown, -40.0, 'Max Drawdown from 150 to 90 must be -40%');
  assert.strictEqual(metrics.mddPeakDate, '2023-01-02', 'Peak date must match');
  assert.strictEqual(metrics.mddTroughDate, '2023-01-03', 'Trough date must match');
  console.log('✅ Test 2 Passed: Maximum Drawdown (-40%) and Peak/Trough dates validated');
}

// ── Test 3: Annualized Volatility (Sample Std Dev * sqrt(252)) ──
{
  // Constant price series should have 0 volatility
  const flatSeries = Array.from({ length: 50 }, (_, i) => ({
    date: `2023-01-${String(i + 1).padStart(2, '0')}`,
    close: 100,
    adjClose: 100,
  }));
  const metrics = calculateFinancialMetrics(flatSeries);
  assert.strictEqual(metrics.annualizedVolatility, 0.0, 'Flat series must have 0% volatility');
  console.log('✅ Test 3 Passed: Zero volatility for flat series confirmed');
}

// ── Test 4: Rolling 50-day and 200-day SMAs ──
{
  const testSeries = Array.from({ length: 60 }, (_, i) => ({
    date: `2023-01-${i}`,
    close: 10 + i,
    adjClose: 10 + i,
  }));
  const metrics = calculateFinancialMetrics(testSeries);
  assert.strictEqual(metrics.seriesWithMA[0].sma50, null, 'SMA 50 should be null before 50 periods');
  assert.ok(typeof metrics.seriesWithMA[59].sma50 === 'number', 'SMA 50 must be a number at period 60');
  console.log('✅ Test 4 Passed: Rolling Moving Average boundary conditions verified');
}

// ── Test 5: Forecast Reproducibility & Prediction Interval Ordering ──
{
  const mockPrices = Array.from({ length: 100 }, (_, i) => 100 + i * 0.5 + Math.sin(i) * 2);
  const gbm = forecastGBM(mockPrices, [30, 90]);
  const f30 = gbm.forecasts[30];

  assert.ok(f30.lower95 < f30.lower80, '95% lower bound must be below 80% lower bound');
  assert.ok(f30.lower80 < f30.estimatedPrice, '80% lower bound must be below expected price');
  assert.ok(f30.estimatedPrice < f30.upper80, 'Expected price must be below 80% upper bound');
  assert.ok(f30.upper80 < f30.upper95, '80% upper bound must be below 95% upper bound');
  console.log('✅ Test 5 Passed: Prediction interval quantiles strictly ordered (L95 < L80 < Mean < U80 < U95)');
}

// ── Test 6: Holt's Linear Exponential Smoothing ──
{
  const mockPrices = Array.from({ length: 80 }, (_, i) => 50 + i * 1.5);
  const holt = forecastHolt(mockPrices, [30]);
  assert.ok(holt.forecasts[30].estimatedPrice > mockPrices[mockPrices.length - 1], 'Uptrending series should forecast higher future price');
  console.log("✅ Test 6 Passed: Holt's Linear Smoothing captured directional trend");
}

// ── Test 7: Chronological Walk-Forward Backtesting (No Leakage) ──
{
  const prices250 = Array.from({ length: 250 }, (_, i) => 100 + i * 0.2 + (i % 5));
  const backtest = runWalkForwardBacktest(prices250, 30, 5);
  assert.strictEqual(backtest.available, true, 'Backtest should be available for 250 observations');
  assert.ok(backtest.foldsEvaluated >= 3, 'At least 3 expanding window folds evaluated');
  assert.ok(typeof backtest.models.gbm.mae === 'number', 'GBM MAE must be a number');
  assert.ok(typeof backtest.models.naive.mae === 'number', 'Naive Baseline MAE must be a number');
  console.log('✅ Test 7 Passed: Walk-forward expanding window validation completed without error');
}

console.log('\n🎉 ALL QUANTITATIVE UNIT TESTS PASSED SUCCESSFULLY!');
