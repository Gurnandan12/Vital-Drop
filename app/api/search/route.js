import { NextResponse } from 'next/server';
import { yahooFinance } from '@/lib/apiClients';
import { cache } from '@/lib/cache';
import { getTopSuggestions, isIndianSymbol } from '@/lib/stockSearch';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  if (!q || !q.trim()) {
    return NextResponse.json({ error: 'Missing query parameter q' }, { status: 400 });
  }

  const query = q.trim();
  const cacheKey = `search_global_${query.toLowerCase()}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return NextResponse.json({ data: cachedData, source: 'cache' });
  }

  // 1. Local Indian dataset search (instant response)
  const localResults = getTopSuggestions(query, 6);
  const formatted = localResults.map((s) => ({
    symbol: s.symbol,
    shortname: s.name,
    exchange: s.exchange,
    sector: s.sector,
    currency: 'INR',
    capCategory: s.capCategory,
    assetType: s.assetType,
    quoteType: s.assetType === 'Equity' ? 'EQUITY' : 'ETF',
    source: 'local',
  }));

  // 2. Yahoo Finance live search (for both Indian and US equities)
  try {
    const result = await yahooFinance.search(query, { newsCount: 0 });
    const quotes = Array.isArray(result?.quotes) ? result.quotes : [];

    const yahooHits = quotes
      .filter((item) => item.isYahooFinance && (item.quoteType === 'EQUITY' || item.quoteType === 'ETF'))
      .map((item) => {
        const sym = item.symbol;
        const isIndia = isIndianSymbol(sym);
        let exchange = item.exchange || 'US';
        if (sym.endsWith('.NS')) exchange = 'NSE';
        else if (sym.endsWith('.BO')) exchange = 'BSE';

        const currency = isIndia ? 'INR' : 'USD';

        return {
          symbol: sym,
          shortname: item.shortname || item.longname || sym,
          exchange,
          currency,
          sector: item.sector || (isIndia ? 'Indian Market' : 'Global Market'),
          capCategory: 'Equity',
          assetType: item.quoteType === 'EQUITY' ? 'Equity' : 'ETF',
          quoteType: item.quoteType,
          source: 'yahoo',
        };
      })
      .slice(0, 6);

    const seen = new Set(formatted.map((f) => f.symbol.toUpperCase()));
    for (const hit of yahooHits) {
      if (!seen.has(hit.symbol.toUpperCase())) {
        formatted.push(hit);
        seen.add(hit.symbol.toUpperCase());
      }
    }
  } catch (err) {
    console.warn('[SearchAPI] Yahoo search fallback:', err?.message || err);
  }

  cache.set(cacheKey, formatted, 300);
  return NextResponse.json({ data: formatted, source: 'api' });
}
