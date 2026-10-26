'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  ShieldAlert,
  ArrowUpDown,
  Layers,
  Activity,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const PALETTE = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

export function StockComparisonWorkspace({ primarySymbol = 'RELIANCE.NS', compareSymbols = [] }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState('cumulativeReturn5Y');
  const [sortAsc, setSortAsc] = useState(false);

  const allSymbols = useMemo(() => {
    const list = [primarySymbol, ...compareSymbols.filter((s) => s !== primarySymbol)];
    return list.slice(0, 5);
  }, [primarySymbol, compareSymbols]);

  useEffect(() => {
    let isMounted = true;
    async function fetchComparison() {
      if (allSymbols.length === 0) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/sandbox/compare?symbols=${allSymbols.join(',')}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load comparison data');
        if (isMounted) setData(json);
      } catch (err) {
        if (isMounted) setError(err.message || 'Error loading stock comparison');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchComparison();
    return () => {
      isMounted = false;
    };
  }, [allSymbols]);

  // Sorted comparison table
  const sortedTable = useMemo(() => {
    if (!data?.comparisonTable) return [];
    return [...data.comparisonTable].sort((a, b) => {
      const valA = a[sortKey] ?? -Infinity;
      const valB = b[sortKey] ?? -Infinity;
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [data, sortKey, sortAsc]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const CustomScatterTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const pt = payload[0]?.payload;
    if (!pt) return null;

    return (
      <div className="bg-[#0e0e1e]/95 border border-white/15 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-1 font-mono">
        <div className="font-bold text-white font-sans">{pt.symbol}</div>
        <div className="text-gray-300">Annual Return: {pt.annualReturn}%</div>
        <div className="text-gray-300">Annual Volatility: {pt.volatility}%</div>
        <div className="text-violet-400">Sharpe Ratio: {pt.sharpeRatio}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-[#0c0c1c] border border-white/10 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin mb-3" />
        <span className="text-sm font-semibold text-gray-300">
          Syncing peer data &amp; computing normalized performance...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#0c0c1c] border border-white/10 rounded-3xl p-6 text-center text-xs text-gray-400">
        <AlertCircle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
        <p>{error || 'Select additional stocks using the search bar above to enable peer comparison.'}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0c0c1c] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Peer Comparison &amp; Risk-Adjusted Screening
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Rebased normalized return curves (Base 100) and risk-vs-return scatter plot across {allSymbols.length} equities.
          </p>
        </div>
      </div>

      {/* ── 1. Normalized Historical Chart (Base 100) ── */}
      <div>
        <div className="flex items-center justify-between text-xs mb-3 text-gray-400">
          <span className="font-semibold text-white">Normalized 5-Year Performance (Base = 100)</span>
          <span className="font-mono text-[11px] text-gray-500">Common historical timeline</span>
        </div>
        <div className="w-full h-[300px] sm:h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.normalizedSeries} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={11} minTickGap={45} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={11} tickLine={false} orientation="right" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0e0e1eee',
                  borderColor: '#ffffff20',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {data.symbols?.map((sym, idx) => (
                <Line
                  key={sym}
                  type="monotone"
                  dataKey={sym}
                  stroke={PALETTE[idx % PALETTE.length]}
                  strokeWidth={sym === primarySymbol ? 2.5 : 1.8}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 2. Risk vs Return Scatter Plot & Screening Table Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Risk-Return Scatter */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-violet-400" />
            <span>Risk vs Return Frontier</span>
          </div>
          <p className="text-[11px] text-gray-500 mb-3">
            X-axis: Annualized Volatility % • Y-axis: Annualized Return %
          </p>

          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis
                  type="number"
                  dataKey="volatility"
                  name="Volatility"
                  unit="%"
                  stroke="#6b7280"
                  fontSize={10}
                />
                <YAxis
                  type="number"
                  dataKey="annualReturn"
                  name="Return"
                  unit="%"
                  stroke="#6b7280"
                  fontSize={10}
                />
                <Tooltip content={<CustomScatterTooltip />} />
                <Scatter name="Equities" data={data.riskReturnScatter} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Screening Table */}
        <div className="lg:col-span-7 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 font-semibold">
                <th className="py-2.5 px-2">Ticker</th>
                <th
                  onClick={() => handleSort('cumulativeReturn5Y')}
                  className="py-2.5 px-2 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>5Y Return</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('annualizedVolatility')}
                  className="py-2.5 px-2 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Volatility</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('maxDrawdown')}
                  className="py-2.5 px-2 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Max DD</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('sharpeRatio')}
                  className="py-2.5 px-2 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Sharpe</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('forecast1YChangePct')}
                  className="py-2.5 px-2 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>1Y Forecast</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {sortedTable.map((stock) => (
                <tr
                  key={stock.symbol}
                  className={`hover:bg-white/[0.02] transition-colors ${
                    stock.symbol === primarySymbol ? 'bg-violet-600/10' : ''
                  }`}
                >
                  <td className="py-2.5 px-2 font-sans font-bold text-white">
                    <div className="flex items-center gap-1.5">
                      <span>{stock.symbol}</span>
                      {stock.symbol === primarySymbol && (
                        <span className="text-[10px] px-1 py-0.2 rounded bg-violet-500/20 text-violet-300">
                          Primary
                        </span>
                      )}
                    </div>
                  </td>
                  <td
                    className={`py-2.5 px-2 font-bold ${
                      stock.cumulativeReturn5Y >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {stock.cumulativeReturn5Y >= 0 ? '+' : ''}
                    {stock.cumulativeReturn5Y}%
                  </td>
                  <td className="py-2.5 px-2 text-gray-300">{stock.annualizedVolatility}%</td>
                  <td className="py-2.5 px-2 text-rose-400">{stock.maxDrawdown}%</td>
                  <td className="py-2.5 px-2 font-bold text-violet-300">{stock.sharpeRatio}</td>
                  <td
                    className={`py-2.5 px-2 font-bold ${
                      stock.forecast1YChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {stock.forecast1YChangePct >= 0 ? '+' : ''}
                    {stock.forecast1YChangePct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
