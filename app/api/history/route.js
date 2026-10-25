import { NextResponse } from 'next/server';
import { yahooFinance } from '@/lib/apiClients';
import { cache } from '@/lib/cache';
import { subDays, subMonths, subYears } from 'date-fns';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const range = (searchParams.get('range') || '1M').toUpperCase(); // 1D, 1W, 1M, 1Y, 5Y, MAX

  if (!symbol) {
    return NextResponse.json(
      { error: 'Missing required parameter: symbol', code: 'MISSING_PARAM' },
      { status: 400 }
    );
  }

  const cleanSymbol = symbol.trim().toUpperCase();
  const cacheKey = `history_${cleanSymbol}_${range}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return NextResponse.json({
      data: cachedData.data || cachedData,
      source: 'cache',
      timestamp: cachedData.timestamp || new Date().toISOString(),
      symbol: cleanSymbol,
      range,
    });
  }

  const now = new Date();
  let period1;
  let interval = '1d';

  switch (range) {
    case '1D':
      period1 = subDays(now, 1);
      interval = '5m'; // Intraday 5m
      break;
    case '1W':
      period1 = subDays(now, 7);
      interval = '15m';
      break;
    case '1M':
      period1 = subMonths(now, 1);
      interval = '1d';
      break;
    case '1Y':
      period1 = subYears(now, 1);
      interval = '1d';
      break;
    case '5Y':
      period1 = subYears(now, 5);
      interval = '1wk';
      break;
    case 'MAX':
      period1 = new Date('1990-01-01');
      interval = '1mo';
      break;
    default:
      period1 = subMonths(now, 1);
      interval = '1d';
  }

  try {
    let result = [];
    if (typeof yahooFinance.chart === 'function') {
      const chartRes = await yahooFinance.chart(cleanSymbol, {
        period1,
        period2: now,
        interval,
      });
      result = Array.isArray(chartRes?.quotes) ? chartRes.quotes : [];
    } else if (typeof yahooFinance.historical === 'function') {
      result = await yahooFinance.historical(cleanSymbol, {
        period1,
        period2: now,
        interval,
      });
    }

    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json({
        data: [],
        source: 'api',
        timestamp: new Date().toISOString(),
        message: 'No historical records available for this range',
      });
    }

    const seenTimes = new Set();
    const formattedData = [];

    for (const item of result) {
      if (!item || !item.date) continue;
      const time = Math.floor(new Date(item.date).getTime() / 1000);
      
      // Determine valid price point honestly
      const rawClose = item.close !== null && item.close !== undefined ? Number(item.close) : null;
      const rawAdj = item.adjclose !== null && item.adjclose !== undefined ? Number(item.adjclose) : null;
      const rawOpen = item.open !== null && item.open !== undefined ? Number(item.open) : null;

      const close = Number.isFinite(rawClose) && rawClose > 0 
        ? rawClose 
        : Number.isFinite(rawAdj) && rawAdj > 0 
          ? rawAdj 
          : Number.isFinite(rawOpen) && rawOpen > 0 
            ? rawOpen 
            : null;

      // Validate finite positive values
      if (isNaN(time) || time <= 0 || close === null) continue;

      // Prevent duplicate timestamps which causes lightweight-charts to throw
      if (!seenTimes.has(time)) {
        seenTimes.add(time);
        formattedData.push({
          time,
          open: Number.isFinite(Number(item.open)) && Number(item.open) > 0 ? Number(item.open) : close,
          high: Number.isFinite(Number(item.high)) && Number(item.high) > 0 ? Number(item.high) : close,
          low: Number.isFinite(Number(item.low)) && Number(item.low) > 0 ? Number(item.low) : close,
          close,
          value: close,
          volume: Number.isFinite(Number(item.volume)) ? Number(item.volume) : 0,
        });
      }
    }

    // Sort strictly ascending
    formattedData.sort((a, b) => a.time - b.time);

    // Cache TTL: 1D is 60s, others 1 hour (3600s)
    const ttl = range === '1D' ? 60 : 3600;
    const nowIso = new Date().toISOString();
    cache.set(cacheKey, { data: formattedData, timestamp: nowIso }, ttl);

    return NextResponse.json({
      data: formattedData,
      source: 'api',
      timestamp: nowIso,
      symbol: cleanSymbol,
      range,
    });
  } catch (error) {
    const errMsg = String(error?.message || error || '');
    console.error(`[API/history] Error fetching ${cleanSymbol} (${range}):`, errMsg);

    if (errMsg.includes('429') || errMsg.toLowerCase().includes('too many requests')) {
      return NextResponse.json(
        { error: 'Market provider rate limit reached for historical data.', code: 'RATE_LIMITED' },
        { status: 429 }
      );
    }

    if (errMsg.includes('404') || errMsg.toLowerCase().includes('not found')) {
      return NextResponse.json(
        { error: `Historical data not found for ticker: ${cleanSymbol}`, code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch historical market data.', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
