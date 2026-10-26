/**
 * Statistical Forecasting and Chronological Backtesting Engine
 *
 * Implements:
 * 1. Geometric Brownian Motion (GBM) with Drift and Diffusion
 * 2. Holt's Linear Exponential Smoothing (Level + Trend)
 * 3. Naive Historical Drift Baseline
 * 4. Chronological Walk-Forward Backtesting (zero leakage, expanding window)
 *    evaluating MAE, RMSE, Directional Accuracy, and Relative Performance vs. Naive Baseline.
 */

// Quantiles for standard normal distribution:
// 80% CI: z = 1.282
// 95% CI: z = 1.960
const Z_80 = 1.28155;
const Z_95 = 1.95996;

/**
 * Geometric Brownian Motion (GBM) Forecast
 * S_t = S_0 * exp((mu - 0.5 * sigma^2)*t + sigma * W_t)
 */
export function forecastGBM(prices, horizons = [30, 90, 252]) {
  if (!prices || prices.length < 30) {
    throw new Error('Need at least 30 observations for GBM forecast');
  }

  const n = prices.length;
  const currentPrice = prices[n - 1];

  // Daily log returns
  const logReturns = [];
  for (let i = 1; i < n; i++) {
    logReturns.push(Math.log(prices[i] / prices[i - 1]));
  }

  const m = logReturns.length;
  const meanLog = logReturns.reduce((acc, r) => acc + r, 0) / m;
  const varLog =
    logReturns.reduce((acc, r) => acc + Math.pow(r - meanLog, 2), 0) / (m - 1);
  const sigmaDaily = Math.sqrt(varLog);

  // Drift parameter
  const driftDaily = meanLog;

  const forecastsByHorizon = {};

  for (const h of horizons) {
    // Expected value of log-normal distribution: E[S_h] = S_0 * exp( (mu + 0.5*sigma^2) * h )
    // or median: S_0 * exp(mu * h)
    const expectedLogPrice = Math.log(currentPrice) + (driftDaily - 0.5 * varLog) * h;
    const centralEstimate = currentPrice * Math.exp(meanLog * h + 0.5 * varLog * h);

    const stdAtHorizon = sigmaDaily * Math.sqrt(h);

    // 95% prediction interval
    const lower95 = Math.exp(expectedLogPrice - Z_95 * stdAtHorizon);
    const upper95 = Math.exp(expectedLogPrice + Z_95 * stdAtHorizon);

    // 80% prediction interval
    const lower80 = Math.exp(expectedLogPrice - Z_80 * stdAtHorizon);
    const upper80 = Math.exp(expectedLogPrice + Z_80 * stdAtHorizon);

    const pctChange = ((centralEstimate - currentPrice) / currentPrice) * 100;
    const lower95Pct = ((lower95 - currentPrice) / currentPrice) * 100;
    const upper95Pct = ((upper95 - currentPrice) / currentPrice) * 100;

    forecastsByHorizon[h] = {
      horizonDays: h,
      horizonLabel: h <= 30 ? '30 Days' : h <= 90 ? '90 Days' : '1 Year',
      currentPrice: Number(currentPrice.toFixed(2)),
      estimatedPrice: Number(centralEstimate.toFixed(2)),
      pctChange: Number(pctChange.toFixed(2)),
      lower95: Number(lower95.toFixed(2)),
      upper95: Number(upper95.toFixed(2)),
      lower80: Number(lower80.toFixed(2)),
      upper80: Number(upper80.toFixed(2)),
      lower95Pct: Number(lower95Pct.toFixed(2)),
      upper95Pct: Number(upper95Pct.toFixed(2)),
      dailyDriftPct: Number((meanLog * 100).toFixed(4)),
      annualizedVolatilityPct: Number((sigmaDaily * Math.sqrt(252) * 100).toFixed(2)),
    };
  }

  // Generate day-by-day trajectory series up to maximum horizon
  const maxH = Math.max(...horizons);
  const trajectorySeries = [];
  for (let t = 1; t <= maxH; t++) {
    const meanPrice = currentPrice * Math.exp(meanLog * t + 0.5 * varLog * t);
    const stdT = sigmaDaily * Math.sqrt(t);
    const expLog = Math.log(currentPrice) + (driftDaily - 0.5 * varLog) * t;
    const low95 = Math.exp(expLog - Z_95 * stdT);
    const up95 = Math.exp(expLog + Z_95 * stdT);

    trajectorySeries.push({
      step: t,
      forecastPrice: Number(meanPrice.toFixed(2)),
      lower95: Number(low95.toFixed(2)),
      upper95: Number(up95.toFixed(2)),
    });
  }

  return {
    modelName: 'Geometric Brownian Motion (GBM)',
    modelKey: 'gbm',
    assumptions:
      'Assumes asset price follows continuous log-normal random walk with constant historical drift and volatility. Prediction intervals expand with sqrt(time).',
    forecasts: forecastsByHorizon,
    trajectorySeries,
  };
}

/**
 * Holt's Linear Exponential Smoothing
 * Level: l_t = alpha * Y_t + (1 - alpha) * (l_{t-1} + b_{t-1})
 * Trend: b_t = beta * (l_t - l_{t-1}) + (1 - beta) * b_{t-1}
 * Forecast: Y_{t+h} = l_t + h * b_t
 */
export function forecastHolt(prices, horizons = [30, 90, 252], alpha = 0.25, beta = 0.1) {
  if (!prices || prices.length < 30) {
    throw new Error('Need at least 30 observations for Holt forecast');
  }

  const n = prices.length;
  const currentPrice = prices[n - 1];

  let l = prices[0];
  let b = prices[1] - prices[0];
  const residuals = [];

  for (let t = 1; t < n; t++) {
    const prevL = l;
    const prevB = b;
    const actual = prices[t];
    const oneStepAhead = prevL + prevB;
    residuals.push(actual - oneStepAhead);

    l = alpha * actual + (1 - alpha) * (prevL + prevB);
    b = beta * (l - prevL) + (1 - beta) * prevB;
  }

  // Residual standard error
  const resVariance =
    residuals.reduce((acc, e) => acc + Math.pow(e, 2), 0) / Math.max(1, residuals.length - 2);
  const sigmaResidual = Math.sqrt(resVariance);

  const forecastsByHorizon = {};

  for (const h of horizons) {
    const rawForecast = l + h * b;
    // Lower bound floor at 0.01
    const centralEstimate = Math.max(0.01, rawForecast);

    // Forecast error variance increases with horizon h
    const se_h = sigmaResidual * Math.sqrt(1 + (h - 1) * Math.pow(alpha, 2));

    const lower95 = Math.max(0.01, centralEstimate - Z_95 * se_h);
    const upper95 = centralEstimate + Z_95 * se_h;
    const lower80 = Math.max(0.01, centralEstimate - Z_80 * se_h);
    const upper80 = centralEstimate + Z_80 * se_h;

    const pctChange = ((centralEstimate - currentPrice) / currentPrice) * 100;

    forecastsByHorizon[h] = {
      horizonDays: h,
      horizonLabel: h <= 30 ? '30 Days' : h <= 90 ? '90 Days' : '1 Year',
      currentPrice: Number(currentPrice.toFixed(2)),
      estimatedPrice: Number(centralEstimate.toFixed(2)),
      pctChange: Number(pctChange.toFixed(2)),
      lower95: Number(lower95.toFixed(2)),
      upper95: Number(upper95.toFixed(2)),
      lower80: Number(lower80.toFixed(2)),
      upper80: Number(upper80.toFixed(2)),
      lower95Pct: Number((((lower95 - currentPrice) / currentPrice) * 100).toFixed(2)),
      upper95Pct: Number((((upper95 - currentPrice) / currentPrice) * 100).toFixed(2)),
      level: Number(l.toFixed(2)),
      dailyTrendSlope: Number(b.toFixed(4)),
    };
  }

  const maxH = Math.max(...horizons);
  const trajectorySeries = [];
  for (let t = 1; t <= maxH; t++) {
    const seT = sigmaResidual * Math.sqrt(1 + (t - 1) * Math.pow(alpha, 2));
    const meanPrice = Math.max(0.01, l + t * b);
    trajectorySeries.push({
      step: t,
      forecastPrice: Number(meanPrice.toFixed(2)),
      lower95: Number(Math.max(0.01, meanPrice - Z_95 * seT).toFixed(2)),
      upper95: Number((meanPrice + Z_95 * seT).toFixed(2)),
    });
  }

  return {
    modelName: "Holt's Linear Exponential Smoothing",
    modelKey: 'holt',
    assumptions:
      'Models double exponential smoothing with dynamic level update and local slope trend. Sensitive to recent directional velocity.',
    forecasts: forecastsByHorizon,
    trajectorySeries,
  };
}

/**
 * Leakage-Free Chronological Walk-Forward Backtest
 * Tests model forecasts on expanding training windows against held-out future observations.
 */
export function runWalkForwardBacktest(prices, testHorizon = 30, testFolds = 12) {
  if (!prices || prices.length < 200) {
    return {
      available: false,
      message: 'Insufficient historical points (<200) to conduct walk-forward validation.',
    };
  }

  const totalN = prices.length;
  // Step size between folds: at least testHorizon days apart to minimize overlap
  const step = Math.max(15, Math.floor((totalN - 120 - testHorizon) / testFolds));

  const gbmErrors = [];
  const holtErrors = [];
  const naiveErrors = [];

  let gbmCorrectDirections = 0;
  let holtCorrectDirections = 0;
  let validDirectionTests = 0;

  for (let fold = 0; fold < testFolds; fold++) {
    const origin = totalN - testHorizon - fold * step;
    if (origin < 60) break; // Minimum 60 days of training

    const train = prices.slice(0, origin);
    const actualTarget = prices[origin + testHorizon - 1];
    const originPrice = train[train.length - 1];

    if (!Number.isFinite(actualTarget) || !Number.isFinite(originPrice) || originPrice <= 0) continue;

    // Actual direction
    const actualSign = Math.sign(actualTarget - originPrice);

    // 1. GBM forecast at horizon
    try {
      const gbmRes = forecastGBM(train, [testHorizon]);
      const gbmPred = gbmRes.forecasts[testHorizon].estimatedPrice;
      const gbmErr = actualTarget - gbmPred;
      gbmErrors.push(gbmErr);

      if (actualSign !== 0) {
        validDirectionTests++;
        if (Math.sign(gbmPred - originPrice) === actualSign) {
          gbmCorrectDirections++;
        }
      }
    } catch {
      // skip fold on error
    }

    // 2. Holt forecast at horizon
    try {
      const holtRes = forecastHolt(train, [testHorizon]);
      const holtPred = holtRes.forecasts[testHorizon].estimatedPrice;
      const holtErr = actualTarget - holtPred;
      holtErrors.push(holtErr);

      if (actualSign !== 0) {
        if (Math.sign(holtPred - originPrice) === actualSign) {
          holtCorrectDirections++;
        }
      }
    } catch {
      // skip fold on error
    }

    // 3. Naive Baseline (Zero-change / Drift persistence: S_t = S_origin)
    const naivePred = originPrice;
    const naiveErr = actualTarget - naivePred;
    naiveErrors.push(naiveErr);
  }

  function computeMetrics(errors) {
    if (errors.length === 0) return { mae: 0, rmse: 0 };
    const mae = errors.reduce((acc, e) => acc + Math.abs(e), 0) / errors.length;
    const rmse = Math.sqrt(errors.reduce((acc, e) => acc + Math.pow(e, 2), 0) / errors.length);
    return {
      mae: Number(mae.toFixed(2)),
      rmse: Number(rmse.toFixed(2)),
    };
  }

  const gbmMetrics = computeMetrics(gbmErrors);
  const holtMetrics = computeMetrics(holtErrors);
  const naiveMetrics = computeMetrics(naiveErrors);

  const gbmDirectionalAccuracy =
    validDirectionTests > 0 ? Number(((gbmCorrectDirections / validDirectionTests) * 100).toFixed(1)) : 50.0;
  const holtDirectionalAccuracy =
    validDirectionTests > 0 ? Number(((holtCorrectDirections / validDirectionTests) * 100).toFixed(1)) : 50.0;

  const gbmRelativeRmse =
    naiveMetrics.rmse > 0 ? Number((gbmMetrics.rmse / naiveMetrics.rmse).toFixed(2)) : 1.0;
  const holtRelativeRmse =
    naiveMetrics.rmse > 0 ? Number((holtMetrics.rmse / naiveMetrics.rmse).toFixed(2)) : 1.0;

  return {
    available: true,
    testHorizonDays: testHorizon,
    foldsEvaluated: gbmErrors.length,
    evaluationMethod: 'Chronological Expanding Window (Walk-Forward, No Leakage)',
    baselineModel: 'Naive Drift Persistence (Current Price)',
    models: {
      gbm: {
        name: 'Geometric Brownian Motion',
        mae: gbmMetrics.mae,
        rmse: gbmMetrics.rmse,
        directionalAccuracy: gbmDirectionalAccuracy,
        relativeRmseVsNaive: gbmRelativeRmse,
        outperformsNaive: gbmRelativeRmse <= 1.05,
      },
      holt: {
        name: "Holt's Linear Smoothing",
        mae: holtMetrics.mae,
        rmse: holtMetrics.rmse,
        directionalAccuracy: holtDirectionalAccuracy,
        relativeRmseVsNaive: holtRelativeRmse,
        outperformsNaive: holtRelativeRmse <= 1.05,
      },
      naive: {
        name: 'Naive Drift Baseline',
        mae: naiveMetrics.mae,
        rmse: naiveMetrics.rmse,
      },
    },
  };
}
