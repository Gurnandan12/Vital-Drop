'use client';
import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, Wifi } from 'lucide-react';

/**
 * Format relative elapsed time from timestamp (e.g. 'just now', '15s ago', '2m ago')
 */
function getRelativeTime(timestamp) {
  if (!timestamp) return null;
  const time = new Date(timestamp).getTime();
  if (isNaN(time)) return null;

  const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

/**
 * DataUpdatedLabel — Honest data freshness indicator
 *
 * Clearly displays:
 * - Real-time vs cached data status
 * - Relative time since last verified market quote
 * - Warning when data is stale or connection is recovering
 */
export function DataUpdatedLabel({
  timestamp,
  source = 'api',
  isStale = false,
  onRefresh,
  isRefreshing = false,
  className = '',
  isDark = true,
}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => (t + 1) % 1000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const relativeTime = getRelativeTime(timestamp);

  if (!timestamp && !isStale) return null;

  if (isStale) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
          isDark
            ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        } ${className}`}
        title="Connection interrupted. Displaying cached data while reconnecting."
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>Stale • Reconnecting</span>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="ml-1 hover:underline text-amber-400"
            title="Force refresh"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    );
  }

  const isCached = source === 'cache';

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
        isDark ? 'text-gray-400' : 'text-gray-500'
      } ${className}`}
      title={isCached ? 'Served from 15s in-memory cache' : 'Live quote from market provider'}
    >
      <span className="flex items-center gap-1">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isCached ? 'bg-blue-400' : 'bg-emerald-400 animate-pulse'
          }`}
        />
        <span className="font-semibold text-gray-300 dark:text-gray-200">
          {isCached ? 'Cached' : 'Live'}
        </span>
      </span>

      {relativeTime && (
        <span className="text-gray-500 dark:text-gray-400">
          • {relativeTime}
        </span>
      )}

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh quote"
          className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          title="Refresh now"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-violet-400' : ''}`} />
        </button>
      )}
    </div>
  );
}

export default DataUpdatedLabel;
