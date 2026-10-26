/**
 * Financial and Quantitative Risk Calculation Engine
 * Implements standard, defensible quantitative formulas for historical market series.
 */

export function calculateFinancialMetrics(series, riskFreeRate = 0.065) {
  if (!Array.isArray(series) || series.length < 2) {
    return null;
  }

  const n = series.length;
  const first = series[0];
  const last = series[n - 1];

  // 1. Cumulative & Annualized Total Return (using adjusted close)
  const initialPrice = first.adjClose || first.close;
  const finalPrice = last.adjClose || last.close;
  const cumulativeReturn = ((finalPrice - initialPrice) / initialPrice) * 100;

  // Approximate trading years (~252 trading days per year)
  const tradingYears = Math.max(0.1, n / 252);
  const annualizedReturn = (Math.pow(finalPrice / initialPrice, 1 / tradingYears) - 1) * 100;

  // 2. Daily Log Returns and Arithmetic Returns
  const dailyLogReturns = [];
  const dailyPctReturns = [];
  for (let i = 1; i < n; i++) {
    const prev = series[i - 1].adjClose || series[i - 1].close;
    const curr = series[i].adjClose || series[i].close;
    if (prev > 0 && curr > 0) {
      dailyLogReturns.push(Math.log(curr / prev));
      dailyPctReturns.push(((curr - prev) / prev) * 100);
    }
  }

  // 3. Average Daily Return
  const sumDailyReturn = dailyPctReturns.reduce((acc, r) => acc + r, 0);
  const avgDailyReturn = dailyPctReturns.length > 0 ? sumDailyReturn / dailyPctReturns.length : 0;

  // 4. Annualized Volatility (Sample standard deviation of daily log returns * sqrt(252))
  let annualizedVolatility = 0;
  if (dailyLogReturns.length > 1) {
    const meanLog = dailyLogReturns.reduce((acc, r) => acc + r, 0) / dailyLogReturns.length;
    const variance =
      dailyLogReturns.reduce((acc, r) => acc + Math.pow(r - meanLog, 2), 0) /
      (dailyLogReturns.length - 1);
    annualizedVolatility = Math.sqrt(variance * 252) * 100;
  }

  // 5. Maximum Drawdown (Peak to Trough analysis)
  let peak = -Infinity;
  let peakDate = '';
  let maxDrawdown = 0;
  let mddPeakDate = '';
  let mddTroughDate = '';
  let currentDrawdown = 0;

  for (let i = 0; i < n; i++) {
    const price = series[i].adjClose || series[i].close;
    if (price > peak) {
      peak = price;
      peakDate = series[i].date;
    }
    const dd = ((price - peak) / peak) * 100;
    if (dd < maxDrawdown) {
      maxDrawdown = dd;
      mddPeakDate = peakDate;
      mddTroughDate = series[i].date;
    }
    if (i === n - 1) {
      currentDrawdown = dd;
    }
  }

  // 6. Calendar-Year Returns
  const yearsMap = {};
  for (const item of series) {
    const y = item.date.slice(0, 4);
    if (!yearsMap[y]) {
      yearsMap[y] = { start: item, end: item };
    } else {
      yearsMap[y].end = item;
    }
  }
  const calendarReturns = Object.keys(yearsMap)
    .sort()
    .map((yr) => {
      const pStart = yearsMap[yr].start.adjClose || yearsMap[yr].start.close;
      const pEnd = yearsMap[yr].end.adjClose || yearsMap[yr].end.close;
      const ret = ((pEnd - pStart) / pStart) * 100;
      return {
        year: yr,
        returnPct: Number(ret.toFixed(2)),
        startPrice: pStart,
        endPrice: pEnd,
      };
    });

  // 7. Best & Worst Periods
  let bestDay = { date: '', returnPct: -Infinity };
  let worstDay = { date: '', returnPct: Infinity };
  for (let i = 0; i < dailyPctReturns.length; i++) {
    const r = dailyPctReturns[i];
    const d = series[i + 1].date;
    if (r > bestDay.returnPct) bestDay = { date: d, returnPct: Number(r.toFixed(2)) };
    if (r < worstDay.returnPct) worstDay = { date: d, returnPct: Number(r.toFixed(2)) };
  }

  // Best/Worst 30-Day Rolling Window
  let best30Day = { startDate: '', endDate: '', returnPct: -Infinity };
  let worst30Day = { startDate: '', endDate: '', returnPct: Infinity };
  for (let i = 30; i < n; i++) {
    const pPrev = series[i - 30].adjClose || series[i - 30].close;
    const pCurr = series[i].adjClose || series[i].close;
    const rollRet = ((pCurr - pPrev) / pPrev) * 100;
    if (rollRet > best30Day.returnPct) {
      best30Day = {
        startDate: series[i - 30].date,
        endDate: series[i].date,
        returnPct: Number(rollRet.toFixed(2)),
      };
    }
    if (rollRet < worst30Day.returnPct) {
      worst30Day = {
        startDate: series[i - 30].date,
        endDate: series[i].date,
        returnPct: Number(rollRet.toFixed(2)),
      };
    }
  }

  // 8. Rolling Moving Averages (50-Day and 200-Day)
  const seriesWithMA = series.map((item, idx) => {
    let sma50 = null;
    let sma200 = null;

    if (idx >= 49) {
      let sum50 = 0;
      for (let j = idx - 49; j <= idx; j++) {
        sum50 += series[j].adjClose || series[j].close;
      }
      sma50 = Number((sum50 / 50).toFixed(2));
    }

    if (idx >= 199) {
      let sum200 = 0;
      for (let j = idx - 199; j <= idx; j++) {
        sum200 += series[j].adjClose || series[j].close;
      }
      sma200 = Number((sum200 / 200).toFixed(2));
    }

    return {
      ...item,
      sma50,
      sma200,
    };
  });

  // Current MA status
  const latestItem = seriesWithMA[n - 1];
  const sma50Latest = latestItem.sma50;
  const sma200Latest = latestItem.sma200;
  const isAboveSma50 = sma50Latest !== null ? finalPrice > sma50Latest : null;
  const isAboveSma200 = sma200Latest !== null ? finalPrice > sma200Latest : null;

  // 9. Volume Trends (20d vs 90d average volume)
  let vol20 = 0;
  let vol90 = 0;
  const volSlice20 = series.slice(-20);
  const volSlice90 = series.slice(-90);
  if (volSlice20.length > 0) {
    vol20 = volSlice20.reduce((acc, d) => acc + (d.volume || 0), 0) / volSlice20.length;
  }
  if (volSlice90.length > 0) {
    vol90 = volSlice90.reduce((acc, d) => acc + (d.volume || 0), 0) / volSlice90.length;
  }
  const volumeTrendRatio = vol90 > 0 ? Number((vol20 / vol90).toFixed(2)) : 1.0;

  // 10. Risk-Adjusted Ratios (Sharpe & Sortino)
  // Sharpe = (Annualized Return - Risk Free Rate) / Annualized Volatility
  const rfPct = riskFreeRate * 100;
  const sharpeRatio =
    annualizedVolatility > 0
      ? Number(((annualizedReturn - rfPct) / annualizedVolatility).toFixed(2))
      : 0;

  // Sortino Ratio: uses downside semi-deviation
  const downsideLogReturns = dailyLogReturns.filter((r) => r < 0);
  let sortinoRatio = 0;
  if (downsideLogReturns.length > 1) {
    const downsideVar =
      downsideLogReturns.reduce((acc, r) => acc + Math.pow(r, 2), 0) / dailyLogReturns.length;
    const downsideVol = Math.sqrt(downsideVar * 252) * 100;
    if (downsideVol > 0) {
      sortinoRatio = Number(((annualizedReturn - rfPct) / downsideVol).toFixed(2));
    }
  }

  return {
    cumulativeReturn: Number(cumulativeReturn.toFixed(2)),
    annualizedReturn: Number(annualizedReturn.toFixed(2)),
    annualizedVolatility: Number(annualizedVolatility.toFixed(2)),
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
    mddPeakDate,
    mddTroughDate,
    currentDrawdown: Number(currentDrawdown.toFixed(2)),
    avgDailyReturn: Number(avgDailyReturn.toFixed(3)),
    calendarReturns,
    bestDay,
    worstDay,
    best30Day,
    worst30Day,
    sharpeRatio,
    sortinoRatio,
    sma50: sma50Latest,
    sma200: sma200Latest,
    isAboveSma50,
    isAboveSma200,
    volumeTrend: {
      avg20d: Math.round(vol20),
      avg90d: Math.round(vol90),
      ratio: volumeTrendRatio,
      momentum: volumeTrendRatio > 1.1 ? 'Higher' : volumeTrendRatio < 0.9 ? 'Lower' : 'Stable',
    },
    seriesWithMA,
  };
}
