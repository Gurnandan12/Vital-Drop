import { NextResponse } from 'next/server';
import { yahooFinance } from '@/lib/apiClients';
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
  const cacheKey = `quote_${cleanSymbol}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return NextResponse.json({
      data: cachedData.data || cachedData,
      source: 'cache',
      timestamp: cachedData.timestamp || new Date().toISOString(),
    });
  }

  try {
    const quote = await yahooFinance.quote(cleanSymbol);

    if (!quote) {
      return NextResponse.json(
        { error: `Market quote not found for symbol: ${cleanSymbol}`, code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const currentPrice = quote.regularMarketPrice || quote.postMarketPrice || 0;
    const previousClose = quote.regularMarketPreviousClose || currentPrice;
    const percentChange = previousClose
      ? ((currentPrice - previousClose) / previousClose) * 100
      : 0;

    const formattedData = {
      symbol: quote.symbol || cleanSymbol,
      shortName: quote.shortName || quote.longName || cleanSymbol,
      currentPrice,
      percentChange,
      change: currentPrice - previousClose,
      marketState: quote.marketState || 'REGULAR',
      high: quote.regularMarketDayHigh || null,
      low: quote.regularMarketDayLow || null,
      open: quote.regularMarketOpen || null,
      volume: quote.regularMarketVolume || null,
      marketCap: quote.marketCap || null,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || null,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow || null,
    };

    const now = new Date().toISOString();
    cache.set(cacheKey, { data: formattedData, timestamp: now }, 15); // Cache for 15 seconds

    return NextResponse.json({
      data: formattedData,
      source: 'api',
      timestamp: now,
    });
  } catch (error) {
    const errMsg = String(error?.message || error || '');
    console.error(`[API/quote] Error fetching ${cleanSymbol}:`, errMsg);

    // Detect upstream rate-limiting / throttling
    if (errMsg.includes('429') || errMsg.toLowerCase().includes('too many requests') || errMsg.toLowerCase().includes('rate limit')) {
      return NextResponse.json(
        { error: 'Market data provider rate limit reached. Please wait a moment.', code: 'RATE_LIMITED' },
        { status: 429 }
      );
    }

    if (errMsg.includes('404') || errMsg.toLowerCase().includes('not found')) {
      return NextResponse.json(
        { error: `Symbol ${cleanSymbol} not found on NSE/BSE exchange.`, code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to retrieve quote from market provider.', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
