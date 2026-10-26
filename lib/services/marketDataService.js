import { yahooFinance } from '@/lib/apiClients';
import { cache } from '@/lib/cache';

/**
 * Normalizes ticker symbols for Indian and US exchanges.
 * e.g., 'RELIANCE' -> 'RELIANCE.NS', 'AAPL' -> 'AAPL'
 */
export function normalizeTicker(symbol) {
  if (!symbol) return '';
  const clean = symbol.trim().toUpperCase();
  // If already has exchange suffix (.NS or .BO), return as is
  if (clean.endsWith('.NS') || clean.endsWith('.BO')) {
    return clean;
  }
  // If it's a known Indian symbol without suffix, assume .NS
  const commonIndianSymbols = new Set([
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'BHARTIARTL',
    'ITC', 'KOTAKBANK', 'LT', 'AXISBANK', 'HINDUNILVR', 'TATAMOTORS', 'WIPRO',
    'MARUTI', 'SUNPHARMA', 'BAJFINANCE', 'TITAN', 'ADANIENT', 'ULTRACEMCO'
  ]);
  if (commonIndianSymbols.has(clean)) {
    return `${clean}.NS`;
  }
  return clean;
}

/**
 * Fetch quote information with exchange, currency, and market metadata.
 */
export async function getStockQuote(rawSymbol) {
  const symbol = normalizeTicker(rawSymbol);
  const cacheKey = `quote_v2_${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const quote = await yahooFinance.quote(symbol);
    if (!quote) throw new Error(`Stock not found: ${symbol}`);

    const currency = quote.currency || (symbol.endsWith('.NS') || symbol.endsWith('.BO') ? 'INR' : 'USD');
    const exchange = quote.exchange || (symbol.endsWith('.NS') ? 'NSE' : symbol.endsWith('.BO') ? 'BSE' : 'NASDAQ/NYSE');
    const currentPrice = quote.regularMarketPrice || quote.postMarketPrice || 0;
    const previousClose = quote.regularMarketPreviousClose || currentPrice;
    const percentChange = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0;

    const data = {
      symbol: quote.symbol || symbol,
      shortName: quote.shortName || quote.longName || symbol,
      longName: quote.longName || quote.shortName || symbol,
      currency,
      exchange,
      currentPrice,
      previousClose,
      change: currentPrice - previousClose,
      percentChange,
      marketCap: quote.marketCap || null,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || null,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow || null,
      marketState: quote.marketState || 'REGULAR',
      timestamp: new Date().toISOString(),
    };

    cache.set(cacheKey, data, 120); // 2-min cache
    return data;
  } catch (err) {
    console.error(`[MarketDataService] Quote error for ${symbol}:`, err?.message || err);
    throw err;
  }
}

/**
 * Fetch ~5 years of daily adjusted historical data.
 */
export async function getFiveYearHistoricalData(rawSymbol) {
  const symbol = normalizeTicker(rawSymbol);
  const cacheKey = `history_5y_daily_${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const fiveYearsAgo = new Date(now.getTime() - 5 * 365.25 * 24 * 60 * 60 * 1000);

  try {
    let rawQuotes = [];
    if (typeof yahooFinance.chart === 'function') {
      const chartRes = await yahooFinance.chart(symbol, {
        period1: fiveYearsAgo,
        period2: now,
        interval: '1d',
      });
      rawQuotes = Array.isArray(chartRes?.quotes) ? chartRes.quotes : [];
    } else if (typeof yahooFinance.historical === 'function') {
      rawQuotes = await yahooFinance.historical(symbol, {
        period1: fiveYearsAgo,
        period2: now,
        interval: '1d',
      });
    }

    if (!Array.isArray(rawQuotes) || rawQuotes.length === 0) {
      throw new Error(`No historical daily records found for ${symbol}`);
    }

    // Clean, validate, and deduplicate daily observations
    const seenDates = new Set();
    const cleanSeries = [];

    for (const q of rawQuotes) {
      if (!q || !q.date) continue;
      const dateObj = new Date(q.date);
      const dateStr = dateObj.toISOString().slice(0, 10);
      if (seenDates.has(dateStr)) continue;

      const rawClose = Number(q.close);
      const rawAdj = Number(q.adjclose);
      const rawOpen = Number(q.open);
      const rawHigh = Number(q.high);
      const rawLow = Number(q.low);
      const rawVol = Number(q.volume);

      const close = Number.isFinite(rawClose) && rawClose > 0 ? rawClose : null;
      const adjClose = Number.isFinite(rawAdj) && rawAdj > 0 ? rawAdj : close;
      if (!close || !adjClose) continue;

      seenDates.add(dateStr);
      cleanSeries.push({
        date: dateStr,
        timestamp: Math.floor(dateObj.getTime() / 1000),
        open: Number.isFinite(rawOpen) && rawOpen > 0 ? rawOpen : close,
        high: Number.isFinite(rawHigh) && rawHigh > 0 ? rawHigh : close,
        low: Number.isFinite(rawLow) && rawLow > 0 ? rawLow : close,
        close,
        adjClose,
        volume: Number.isFinite(rawVol) && rawVol >= 0 ? rawVol : 0,
      });
    }

    // Sort strictly chronological ascending
    cleanSeries.sort((a, b) => a.timestamp - b.timestamp);

    if (cleanSeries.length < 30) {
      throw new Error(`Insufficient historical trading days (${cleanSeries.length}) for reliable analysis.`);
    }

    const payload = {
      symbol,
      recordsCount: cleanSeries.length,
      startDate: cleanSeries[0].date,
      endDate: cleanSeries[cleanSeries.length - 1].date,
      series: cleanSeries,
      source: 'Yahoo Finance (Adjusted Daily)',
      retrievedAt: new Date().toISOString(),
    };

    cache.set(cacheKey, payload, 3600); // 1-hour cache
    return payload;
  } catch (err) {
    console.error(`[MarketDataService] 5Y History error for ${symbol}:`, err?.message || err);
    throw err;
  }
}
