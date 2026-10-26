import { NextResponse } from 'next/server';
import { getStockQuote, getFiveYearHistoricalData } from '@/lib/services/marketDataService';
import { calculateFinancialMetrics } from '@/lib/services/financialMetrics';
import { forecastGBM, forecastHolt, runWalkForwardBacktest } from '@/lib/services/forecastingEngine';
import { cache } from '@/lib/cache';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json(
      { error: 'Missing required parameter: symbol', code: 'MISSING_PARAM' },
      { status: 400 }
    );
  }

  const cleanSymbol = symbol.trim().toUpperCase();
  const cacheKey = `sandbox_analysis_${cleanSymbol}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return NextResponse.json({
      ...cached,
      source: 'cache',
      servedAt: new Date().toISOString(),
    });
  }

  try {
    // 1. Fetch quote metadata and 5-year daily history in parallel
    const [quote, history] = await Promise.all([
      getStockQuote(cleanSymbol),
      getFiveYearHistoricalData(cleanSymbol),
    ]);

    const series = history.series;
    const closePrices = series.map((s) => s.adjClose || s.close);

    // 2. Compute quantitative risk and performance metrics
    const riskFreeRate = quote.currency === 'INR' ? 0.065 : 0.04; // 6.5% for India, 4.0% for US
    const metrics = calculateFinancialMetrics(series, riskFreeRate);

    // 3. Statistical Forecasts
    const gbmForecast = forecastGBM(closePrices, [30, 90, 252]);
    const holtForecast = forecastHolt(closePrices, [30, 90, 252]);

    // 4. Chronological Walk-Forward Backtesting (30-day forecast horizon)
    const backtest = runWalkForwardBacktest(closePrices, 30, 10);

    const payload = {
      symbol: quote.symbol,
      quote,
      dataSummary: {
        recordsCount: history.recordsCount,
        startDate: history.startDate,
        endDate: history.endDate,
        source: history.source,
        retrievedAt: history.retrievedAt,
      },
      metrics,
      forecasts: {
        gbm: gbmForecast,
        holt: holtForecast,
      },
      backtest,
      timestamp: new Date().toISOString(),
    };

    cache.set(cacheKey, payload, 1800); // 30-minute cache

    return NextResponse.json({
      ...payload,
      source: 'api',
      servedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[API/sandbox/analyze] Error analyzing ${cleanSymbol}:`, error?.message || error);
    const msg = String(error?.message || error);

    if (msg.includes('not found') || msg.includes('Stock not found')) {
      return NextResponse.json(
        {
          error: `Stock "${cleanSymbol}" was not found. Please verify the ticker symbol (e.g. RELIANCE.NS, TCS.NS, or AAPL).`,
          code: 'STOCK_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: `Failed to retrieve historical data and compute forecasts: ${msg}`,
        code: 'ANALYSIS_FAILED',
      },
      { status: 500 }
    );
  }
}
