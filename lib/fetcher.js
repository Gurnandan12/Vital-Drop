/**
 * lib/fetcher.js — Resilient Market Data Fetching and Response Validation
 *
 * Implements:
 * - Configurable request timeouts (default 10s)
 * - Structured error classification (NETWORK, RATE_LIMIT, NOT_FOUND, SERVER, MALFORMED)
 * - Honest validation of quote and historical data (rejects NaN/Infinity/corrupt points)
 * - Lightweight-charts timestamp sanitization (strictly ascending order & deduplication)
 */

export class FetchError extends Error {
  constructor(message, { type = 'GENERIC', status = 0, canRetry = true, originalError = null } = {}) {
    super(message);
    this.name = 'FetchError';
    this.type = type; // 'NETWORK' | 'RATE_LIMIT' | 'NOT_FOUND' | 'SERVER' | 'MALFORMED' | 'GENERIC'
    this.status = status;
    this.canRetry = canRetry;
    this.originalError = originalError;
  }
}

/**
 * Fetch wrapper with timeout and structured error mapping
 */
export async function fetchWithTimeout(url, { timeoutMs = 10000, signal, ...options } = {}) {
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  // Link caller's signal if provided
  if (signal) {
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      controller.abort();
    });
  }

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      if (res.status === 429) {
        throw new FetchError('Market data rate limit reached. Please wait a few seconds.', {
          type: 'RATE_LIMIT',
          status: 429,
          canRetry: true,
        });
      }
      if (res.status === 404) {
        throw new FetchError('Requested market ticker or data was not found.', {
          type: 'NOT_FOUND',
          status: 404,
          canRetry: false,
        });
      }
      if (res.status >= 500) {
        throw new FetchError('Upstream market provider returned a server error.', {
          type: 'SERVER',
          status: res.status,
          canRetry: true,
        });
      }

      let errMessage = `HTTP error ${res.status}`;
      try {
        const body = await res.json();
        if (body?.error) errMessage = body.error;
      } catch {
        // use default HTTP error
      }

      throw new FetchError(errMessage, {
        type: 'GENERIC',
        status: res.status,
        canRetry: true,
      });
    }

    const json = await res.json();
    return json;
  } catch (err) {
    clearTimeout(timer);

    if (err instanceof FetchError) {
      throw err;
    }

    if (timedOut) {
      throw new FetchError('Request timed out while connecting to market servers.', {
        type: 'NETWORK',
        canRetry: true,
      });
    }

    if (err.name === 'AbortError') {
      throw err; // Allow clean caller aborts without logging
    }

    // Network / offline failure
    throw new FetchError('Unable to connect to market service. Please check your internet connection.', {
      type: 'NETWORK',
      originalError: err,
      canRetry: true,
    });
  }
}

/**
 * Validates and sanitizes a single stock quote object
 */
export function validateQuote(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const symbol = raw.symbol ? String(raw.symbol).trim().toUpperCase() : null;
  const currentPrice = parseFloat(raw.currentPrice);

  if (!symbol) {
    return null;
  }

  if (isNaN(currentPrice) || !Number.isFinite(currentPrice) || currentPrice <= 0) {
    return null;
  }

  const percentChange = Number.isFinite(parseFloat(raw.percentChange))
    ? parseFloat(raw.percentChange)
    : 0;

  const change = Number.isFinite(parseFloat(raw.change))
    ? parseFloat(raw.change)
    : 0;

  return {
    ...raw,
    symbol,
    currentPrice,
    percentChange,
    change,
    marketState: raw.marketState || 'REGULAR',
    shortName: raw.shortName || symbol,
  };
}

/**
 * Validates, deduplicates and sorts chart data points for lightweight-charts
 * Lightweight-charts requires:
 * 1. Strictly ascending time (points[i].time > points[i-1].time)
 * 2. Finite positive numbers for prices
 * 3. At least 2 points to draw a meaningful series
 */
export function validateHistoricalPoints(points) {
  if (!Array.isArray(points) || points.length === 0) {
    return { isValid: false, points: [], reason: 'No historical points returned for this timeframe.' };
  }

  const cleaned = [];
  const seenTimes = new Set();

  for (const p of points) {
    if (!p || typeof p !== 'object') continue;

    const time = Math.floor(Number(p.time));
    const close = Number(p.close ?? p.value);

    if (isNaN(time) || time <= 0) continue;
    if (isNaN(close) || !Number.isFinite(close) || close <= 0) continue;

    if (!seenTimes.has(time)) {
      seenTimes.add(time);
      cleaned.push({
        time,
        value: close,
        open: Number.isFinite(Number(p.open)) ? Number(p.open) : close,
        high: Number.isFinite(Number(p.high)) ? Number(p.high) : close,
        low: Number.isFinite(Number(p.low)) ? Number(p.low) : close,
        close,
        volume: Number.isFinite(Number(p.volume)) ? Number(p.volume) : 0,
      });
    }
  }

  // Ensure strictly ascending order by timestamp
  cleaned.sort((a, b) => a.time - b.time);

  if (cleaned.length < 2) {
    return {
      isValid: false,
      points: cleaned,
      reason: 'Insufficient historical data points available to construct a trend.',
    };
  }

  return {
    isValid: true,
    points: cleaned,
    count: cleaned.length,
  };
}
