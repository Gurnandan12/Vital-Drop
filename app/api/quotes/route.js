/**
 * app/api/quotes/route.ts
 * ─────────────────────────────────────────────────────────
 * Batch multi-symbol quote fetcher.
 * Accepts: ?symbols=RELIANCE.NS,TCS.NS,HDFCBANK.NS (up to 20)
 * Returns: array of lightweight quote objects with live price / % change
 *
 * Performance:
 * - Checks cache first per-symbol (TTL 60s)
 * - Fetches uncached symbols in parallel with Promise.allSettled
 * - No throwing on partial failures — returns null fields for errored symbols
 */
import { NextResponse } from 'next/server';
import { yahooFinance } from '@/lib/apiClients';
import { cache } from '@/lib/cache';
import { isIndianSymbol } from '@/lib/stockSearch';
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');
    if (!symbolsParam) {
        return NextResponse.json({ error: 'Missing symbols parameter' }, { status: 400 });
    }
    // Parse, dedupe, enforce Indian-only, cap at 20
    const symbols = [
        ...new Set(symbolsParam
            .split(',')
            .map(s => s.trim().toUpperCase())
            .filter(s => s && isIndianSymbol(s))),
    ].slice(0, 20);
    if (!symbols.length) {
        return NextResponse.json({ data: [], source: 'empty' });
    }
    // Split into cached vs. uncached
    const results = [];
    const toFetch = [];
    for (const symbol of symbols) {
        const cached = cache.get(`batchquote_${symbol}`);
        if (cached) {
            results.push(cached);
        }
        else {
            toFetch.push(symbol);
            // Placeholder so order is preserved
            results.push({ symbol, price: null, change: null, changePercent: null, volume: null, marketCap: null, dayHigh: null, dayLow: null, open: null, fiftyTwoWeekHigh: null, fiftyTwoWeekLow: null });
        }
    }
    // Fetch uncached in parallel
    if (toFetch.length > 0) {
        const fetched = await Promise.allSettled(toFetch.map(sym => yahooFinance.quote(sym)));
        fetched.forEach((result, i) => {
            const symbol = toFetch[i];
            const idx = results.findIndex(r => r.symbol === symbol);
            let bq;
            if (result.status === 'fulfilled' && result.value) {
                const q = result.value;
                const price = q.regularMarketPrice ?? q.postMarketPrice ?? null;
                const prevClose = q.regularMarketPreviousClose ?? price ?? 0;
                bq = {
                    symbol,
                    price,
                    change: price !== null && prevClose ? price - prevClose : (q.regularMarketChange ?? null),
                    changePercent: q.regularMarketChangePercent ?? (price !== null && prevClose ? ((price - prevClose) / prevClose) * 100 : null),
                    volume: q.regularMarketVolume ?? null,
                    marketCap: q.marketCap ?? null,
                    dayHigh: q.regularMarketDayHigh ?? null,
                    dayLow: q.regularMarketDayLow ?? null,
                    open: q.regularMarketOpen ?? null,
                    fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? null,
                    fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? null,
                };
            }
            else {
                bq = {
                    symbol, price: null, change: null, changePercent: null, volume: null,
                    marketCap: null, dayHigh: null, dayLow: null, open: null,
                    fiftyTwoWeekHigh: null, fiftyTwoWeekLow: null, error: true,
                };
            }
            cache.set(`batchquote_${symbol}`, bq, 60); // 1 minute cache
            if (idx !== -1)
                results[idx] = bq;
        });
    }
    return NextResponse.json({
        data: results,
        source: 'api',
        timestamp: new Date().toISOString(),
    });
}
