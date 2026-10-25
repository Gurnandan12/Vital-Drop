'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';
import { useStockStore } from '@/store/stockStore';
import { ChartSkeleton } from './ui/ChartSkeleton';
import { ErrorState } from './ui/ErrorState';
import { DataUpdatedLabel } from './ui/DataUpdatedLabel';
import { fetchWithTimeout, validateHistoricalPoints, FetchError } from '@/lib/fetcher';

const TIME_FILTERS = ['1D', '1W', '1M', '1Y', '5Y', 'MAX'];

export function StockChart() {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const areaSeriesRef = useRef(null);
  const abortControllerRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState('1M');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState('GENERIC');
  const [hasValidData, setHasValidData] = useState(false);
  const [dataTimestamp, setDataTimestamp] = useState(null);
  const [dataSource, setDataSource] = useState('api');
  const [hoveredPrice, setHoveredPrice] = useState(null);
  const [hoveredTime, setHoveredTime] = useState(null);

  const { selectedSymbol, theme } = useStockStore();
  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? '#0d0d1a' : '#ffffff',
    text: isDark ? '#9ca3af' : '#6b7280',
    grid: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)',
    crosshair: '#7c3aed',
    line: '#7c3aed',
    areaTop: 'rgba(124, 58, 237, 0.28)',
    areaBottom: 'rgba(124, 58, 237, 0.0)',
  };

  // Initialize lightweight-charts instance, re-init when theme changes
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: colors.bg },
        textColor: colors.text,
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: colors.crosshair, width: 1, style: 3, labelBackgroundColor: '#7c3aed' },
        horzLine: { color: colors.crosshair, width: 1, style: 3, labelBackgroundColor: '#7c3aed' },
      },
      rightPriceScale: { borderColor: 'transparent' },
      timeScale: {
        borderColor: 'transparent',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true },
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: colors.line,
      topColor: colors.areaTop,
      bottomColor: colors.areaBottom,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    // Crosshair hover tooltip
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData.size) {
        setHoveredPrice(null);
        setHoveredTime(null);
        return;
      }
      const d = param.seriesData.get(series);
      if (d) {
        setHoveredPrice(d.value);
        const date = new Date(param.time * 1000);
        setHoveredTime(
          date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        );
      }
    });

    chartRef.current = chart;
    areaSeriesRef.current = series;

    // Responsive resize observer
    const observer = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      areaSeriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark]);

  // Fetch and validate historical data
  const loadChartData = useCallback(async () => {
    if (!selectedSymbol || !areaSeriesRef.current) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const url = `/api/history?symbol=${encodeURIComponent(selectedSymbol)}&range=${activeFilter}`;
      const json = await fetchWithTimeout(url, {
        timeoutMs: 12000,
        signal: controller.signal,
      });

      const validation = validateHistoricalPoints(json?.data);
      if (!validation.isValid) {
        throw new FetchError(validation.reason, {
          type: 'NOT_FOUND',
          canRetry: false,
        });
      }

      // Format strictly for lightweight-charts
      const formattedPoints = validation.points.map((p) => ({
        time: p.time,
        value: p.value,
      }));

      areaSeriesRef.current.setData(formattedPoints);
      chartRef.current?.timeScale().fitContent();

      setHasValidData(true);
      setError(null);
      setDataTimestamp(json?.timestamp || new Date().toISOString());
      setDataSource(json?.source || 'api');
    } catch (err) {
      if (err.name === 'AbortError') return;

      console.warn(`[StockChart] Error loading ${selectedSymbol}:`, err.message);
      setError(err.message || 'Failed to load chart data');
      setErrorType(err.type || 'GENERIC');
    } finally {
      setLoading(false);
    }
  }, [selectedSymbol, activeFilter]);

  useEffect(() => {
    loadChartData();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadChartData]);

  return (
    <div
      className={`rounded-2xl border p-5 transition-colors ${
        isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      {/* Header Bar: Timeframe Filters & Hover Details */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Chart time range">
          {TIME_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              disabled={loading && !hasValidData}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                activeFilter === f
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30'
                  : isDark
                  ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Hovered Price / Time Tooltip */}
        {hoveredPrice !== null ? (
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-violet-400">
              ₹{hoveredPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {hoveredTime && (
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {hoveredTime}
              </span>
            )}
          </div>
        ) : (
          <DataUpdatedLabel
            timestamp={dataTimestamp}
            source={dataSource}
            onRefresh={loadChartData}
            isRefreshing={loading}
            isDark={isDark}
          />
        )}
      </div>

      {/* Chart Canvas Area */}
      <div className="relative h-72 w-full">
        {/* Initial Loading Skeleton */}
        {loading && !hasValidData && (
          <div className="absolute inset-0 z-10">
            <ChartSkeleton
              isDark={isDark}
              message={`Loading ${selectedSymbol} (${activeFilter})…`}
            />
          </div>
        )}

        {/* Background Re-fetching Indicator (Keeps existing chart visible) */}
        {loading && hasValidData && (
          <div className="absolute top-2 right-2 z-20 px-2.5 py-1 rounded-full bg-violet-600/80 backdrop-blur-md text-[11px] font-bold text-white flex items-center gap-1.5 shadow-lg animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>Updating {activeFilter}…</span>
          </div>
        )}

        {/* Error State with Retry Button */}
        {error && !loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
            <ErrorState
              title={`Unable to load ${activeFilter} chart`}
              message={error}
              errorType={errorType}
              onRetry={loadChartData}
              retryLabel="Retry Chart"
              isRetrying={loading}
              isDark={isDark}
            />
          </div>
        )}

        {/* Underlying Lightweight Chart Container */}
        <div
          ref={containerRef}
          className={`w-full h-full transition-opacity duration-300 ${
            loading && !hasValidData ? 'opacity-0' : error ? 'opacity-20' : 'opacity-100'
          }`}
        />
      </div>

      {/* Data Source & Timestamp Footer */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 flex-wrap gap-2">
        <span>Historical data verified via NSE/BSE feeds</span>
        <span>Honest pricing • Zero synthesized points</span>
      </div>
    </div>
  );
}

export default StockChart;
