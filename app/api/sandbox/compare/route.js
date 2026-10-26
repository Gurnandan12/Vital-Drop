import { NextResponse } from 'next/server';
import { getStockQuote, getFiveYearHistoricalData } from '@/lib/services/marketDataService';
import { calculateFinancialMetrics } from '@/lib/services/financialMetrics';
import { forecastGBM } from '@/lib/services/forecastingEngine';
import { cache } from '@/lib/cache';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols');

  if (!symbolsParam) {
    return NextResponse.json(
      { error: 'Missing parameter: symbols (comma separated)', code: 'MISSING_PARAM' },
      { status: 400 }
    );
  }

  const rawSymbols = symbolsParam
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 5); // Max 5 stocks comparison

  if (rawSymbols.length === 0) {
    return NextResponse.json({ error: 'No valid symbols provided' }, { status: 400 });
  }

  const cacheKey = `sandbox_compare_${rawSymbols.sort().join('_')}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, source: 'cache' });
  }

  try {
    const stockResults = await Promise.allSettled(
      rawSymbols.map(async (sym) => {
        const [quote, history] = await Promise.all([
          getStockQuote(sym),
          getFiveYearHistoricalData(sym),
        ]);
        const metrics = calculateFinancialMetrics(
          history.series,
          quote.currency === 'INR' ? 0.065 : 0.04
        );
        const closePrices = history.series.map((s) => s.adjClose || s.close);
        const gbm = forecastGBM(closePrices, [252]);

        return {
          symbol: quote.symbol,
          shortName: quote.shortName,
          currency: quote.currency,
          exchange: quote.exchange,
          currentPrice: quote.currentPrice,
          history: history.series,
          metrics,
          forecast1Y: gbm.forecasts[252],
        };
      })
    );

    const successfulStocks = stockResults
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value);

    if (successfulStocks.length === 0) {
      return NextResponse.json(
        { error: 'Failed to retrieve data for any of the selected stocks' },
        { status: 500 }
      );
    }

    // 1. Build Normalized Performance Series (Base 100)
    // Find intersection date range
    const dateToPriceMap = {};
    for (const stock of successfulStocks) {
      dateToPriceMap[stock.symbol] = {};
      for (const item of stock.history) {
        dateToPriceMap[stock.symbol][item.date] = item.adjClose || item.close;
      }
    }

    // Common dates that exist in the primary (first) stock
    const primaryStock = successfulStocks[0];
    const normalizedSeries = [];

    // Base initial prices
    const basePrices = {};
    for (const s of successfulStocks) {
      basePrices[s.symbol] = s.history[0]?.adjClose || s.history[0]?.close || 1;
    }

    for (const item of primaryStock.history) {
      const point = { date: item.date };
      for (const s of successfulStocks) {
        const p = dateToPriceMap[s.symbol][item.date];
        if (p && basePrices[s.symbol]) {
          point[s.symbol] = Number(((p / basePrices[s.symbol]) * 100).toFixed(2));
        } else {
          point[s.symbol] = null;
        }
      }
      normalizedSeries.push(point);
    }

    // 2. Comparison Metrics Table
    const comparisonTable = successfulStocks.map((s) => ({
      symbol: s.symbol,
      shortName: s.shortName,
      currency: s.currency,
      exchange: s.exchange,
      currentPrice: s.currentPrice,
      cumulativeReturn5Y: s.metrics?.cumulativeReturn ?? null,
      annualizedReturn: s.metrics?.annualizedReturn ?? null,
      annualizedVolatility: s.metrics?.annualizedVolatility ?? null,
      maxDrawdown: s.metrics?.maxDrawdown ?? null,
      sharpeRatio: s.metrics?.sharpeRatio ?? null,
      forecast1YChangePct: s.forecast1Y?.pctChange ?? null,
      forecast1YEstimatedPrice: s.forecast1Y?.estimatedPrice ?? null,
    }));

    // 3. Risk-vs-Return Scatter Data
    const riskReturnScatter = successfulStocks.map((s) => ({
      symbol: s.symbol,
      shortName: s.shortName,
      volatility: s.metrics?.annualizedVolatility ?? 0,
      annualReturn: s.metrics?.annualizedReturn ?? 0,
      sharpeRatio: s.metrics?.sharpeRatio ?? 0,
      maxDrawdown: s.metrics?.maxDrawdown ?? 0,
    }));

    const payload = {
      stocksCount: successfulStocks.length,
      symbols: successfulStocks.map((s) => s.symbol),
      normalizedSeries,
      comparisonTable,
      riskReturnScatter,
      timestamp: new Date().toISOString(),
    };

    cache.set(cacheKey, payload, 1800);
    return NextResponse.json({ ...payload, source: 'api' });
  } catch (err) {
    console.error('[API/sandbox/compare] Error:', err);
    return NextResponse.json(
      { error: 'Failed to process stock comparison', details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
