/**
 * lib/stockSearch.ts
 * ─────────────────────────────────────────────────────────
 * Pure search + filter logic for the Indian stock dataset.
 * No UI, no API calls — just data manipulation.
 */
import { INDIAN_STOCKS, } from './indianStocks';
/* ─────────────────────────────────────────────────────────
   isIndianSymbol — strict guardian
   Only allows .NS, .BO, ^ (index) symbols.
   Rejects AAPL, TSLA, GLD, etc.
───────────────────────────────────────────────────────── */
export function isIndianSymbol(symbol) {
    return /\.(NS|BO)$/i.test(symbol) || symbol.startsWith('^');
}
/* ─────────────────────────────────────────────────────────
   Normalize text for search comparison
───────────────────────────────────────────────────────── */
function normalize(s) {
    return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}
/* ─────────────────────────────────────────────────────────
   searchStocks — fuzzy search on name + symbol + sector
───────────────────────────────────────────────────────── */
export function searchStocks(query) {
    const q = normalize(query);
    if (!q)
        return INDIAN_STOCKS;
    return INDIAN_STOCKS.filter(stock => {
        const nameNorm = normalize(stock.name);
        const symbolNorm = normalize(stock.symbol);
        const sectorNorm = normalize(stock.sector);
        // Exact prefix match scores higher, but we return all matches
        return (nameNorm.includes(q) ||
            symbolNorm.includes(q) ||
            sectorNorm.includes(q));
    });
}
/* ─────────────────────────────────────────────────────────
   filterStocks — apply multi-dimensional filters
───────────────────────────────────────────────────────── */
export function filterStocks(filters) {
    let stocks = INDIAN_STOCKS;
    // Text search
    if (filters.query && filters.query.trim()) {
        stocks = searchStocks(filters.query);
    }
    // Exchange
    if (filters.exchange && filters.exchange !== 'All') {
        stocks = stocks.filter(s => s.exchange === filters.exchange);
    }
    // Market Cap
    if (filters.capCategory && filters.capCategory !== 'All') {
        stocks = stocks.filter(s => s.capCategory === filters.capCategory);
    }
    // Sector
    if (filters.sector && filters.sector !== 'All') {
        stocks = stocks.filter(s => s.sector === filters.sector);
    }
    // Asset Type
    if (filters.assetType && filters.assetType !== 'All') {
        stocks = stocks.filter(s => s.assetType === filters.assetType);
    }
    return stocks;
}
/* ─────────────────────────────────────────────────────────
   getTopSuggestions — for SearchBar autocomplete
   Returns up to `limit` results matching the query,
   prioritizing exact symbol prefix matches
───────────────────────────────────────────────────────── */
export function getTopSuggestions(query, limit = 8) {
    const q = normalize(query);
    if (!q || q.length < 1)
        return [];
    const results = INDIAN_STOCKS.filter(s => {
        const nameN = normalize(s.name);
        const symbolN = normalize(s.symbol);
        const sectorN = normalize(s.sector);
        return nameN.includes(q) || symbolN.includes(q) || sectorN.includes(q);
    });
    // Sort: exact symbol prefix first, then name prefix, then rest
    results.sort((a, b) => {
        const aSymN = normalize(a.symbol);
        const bSymN = normalize(b.symbol);
        const aNameN = normalize(a.name);
        const bNameN = normalize(b.name);
        const aSymPrefix = aSymN.startsWith(q) ? 0 : 1;
        const bSymPrefix = bSymN.startsWith(q) ? 0 : 1;
        if (aSymPrefix !== bSymPrefix)
            return aSymPrefix - bSymPrefix;
        const aNamePrefix = aNameN.startsWith(q) ? 0 : 1;
        const bNamePrefix = bNameN.startsWith(q) ? 0 : 1;
        if (aNamePrefix !== bNamePrefix)
            return aNamePrefix - bNamePrefix;
        return a.name.localeCompare(b.name);
    });
    return results.slice(0, limit);
}
