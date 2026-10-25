import { NextResponse } from 'next/server';
import { yahooFinance } from '@/lib/apiClients';
import { cache } from '@/lib/cache';
import { getTopSuggestions, isIndianSymbol } from '@/lib/stockSearch';
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    if (!q) {
        return NextResponse.json({ error: 'Missing query parameter q' }, { status: 400 });
    }
    const cacheKey = `search_india_${q.toLowerCase()}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        return NextResponse.json({ data: cachedData, source: 'cache' });
    }
    // ── Step 1: local dataset search (instant, no network) ──
    const localResults = getTopSuggestions(q, 6);
    const formatted = localResults.map(s => ({
        symbol: s.symbol,
        shortname: s.name,
        exchange: s.exchange,
        sector: s.sector,
        capCategory: s.capCategory,
        assetType: s.assetType,
        quoteType: s.assetType === 'Equity' ? 'EQUITY' : 'ETF',
        source: 'local',
    }));
    // ── Step 2: Yahoo Finance enrichment (only for specific symbols) ──
    // Only call Yahoo if query looks like a symbol (short, alphanumeric + suffix)
    const looksLikeSymbol = /^[A-Z0-9&\-]{2,15}(\.(NS|BO))?$/i.test(q.trim());
    if (looksLikeSymbol) {
        try {
            const result = await yahooFinance.search(q, { newsCount: 0 });
            const yahooHits = result.quotes
                .filter((item) => item.isYahooFinance && isIndianSymbol(item.symbol))
                .map((item) => ({
                symbol: item.symbol,
                shortname: (item.shortname || item.longname || item.symbol),
                exchange: (item.symbol.endsWith('.BO') ? 'BSE' : 'NSE'),
                sector: 'Banking',
                capCategory: 'Large Cap',
                assetType: 'Equity',
                quoteType: item.quoteType,
                source: 'yahoo',
            }))
                .slice(0, 4);
            // Merge: local first, then yahoo, deduped by symbol
            const seen = new Set(formatted.map(f => f.symbol));
            for (const hit of yahooHits) {
                if (!seen.has(hit.symbol)) {
                    formatted.push(hit);
                    seen.add(hit.symbol);
                }
            }
        }
        catch {
            // Yahoo call is optional — silently fall through to local results
        }
    }
    cache.set(cacheKey, formatted, 300);
    return NextResponse.json({ data: formatted, source: 'api' });
}
