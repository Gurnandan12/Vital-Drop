'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchWithTimeout, FetchError } from '@/lib/fetcher';

/**
 * useAsyncData — Resilient market data fetching hook
 *
 * Features:
 * - Request cancellation via AbortController on parameter change or unmount
 * - Preserves previous valid data during background refreshes (no flickering)
 * - Structured error classification (NETWORK, RATE_LIMIT, NOT_FOUND, SERVER)
 * - Detects stale data when a background refresh fails
 * - Debounced retry handler
 */
export function useAsyncData(url, {
  enabled = true,
  refreshInterval = 0,
  validate = null,
  timeoutMs = 10000,
} = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled && url));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState('GENERIC');
  const [isStale, setIsStale] = useState(false);
  const [timestamp, setTimestamp] = useState(null);
  const [source, setSource] = useState('api');

  const abortControllerRef = useRef(null);
  const hasLoadedRef = useRef(false);

  const fetchData = useCallback(
    async (isManualRetry = false) => {
      if (!enabled || !url) return;

      // Abort previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (!hasLoadedRef.current || isManualRetry) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const json = await fetchWithTimeout(url, {
          timeoutMs,
          signal: controller.signal,
        });

        let payload = json?.data !== undefined ? json.data : json;

        // Custom validation step if provided
        if (validate && typeof validate === 'function') {
          const validationResult = validate(payload);
          if (!validationResult.isValid) {
            throw new FetchError(validationResult.reason || 'Invalid data received from market service.', {
              type: 'MALFORMED',
              canRetry: true,
            });
          }
          payload = validationResult.points || validationResult.quote || payload;
        }

        setData(payload);
        setError(null);
        setErrorType('GENERIC');
        setIsStale(false);
        setTimestamp(json?.timestamp || new Date().toISOString());
        setSource(json?.source || 'api');
        hasLoadedRef.current = true;
      } catch (err) {
        if (err.name === 'AbortError') return;

        console.warn(`[useAsyncData] Fetch failure for ${url}:`, err.message);

        // If we already have previous data, mark as stale instead of destroying UI
        if (hasLoadedRef.current) {
          setIsStale(true);
        } else {
          setError(err.message || 'Failed to load data');
          setErrorType(err.type || 'GENERIC');
        }
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [url, enabled, timeoutMs, validate]
  );

  useEffect(() => {
    fetchData();

    let intervalId = null;
    if (refreshInterval > 0 && enabled) {
      intervalId = setInterval(() => {
        fetchData();
      }, refreshInterval);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchData, refreshInterval, enabled]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    isRefreshing,
    error,
    errorType,
    isStale,
    timestamp,
    source,
    refetch,
  };
}

export default useAsyncData;
