'use client';
import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useStockStore } from '@/store/stockStore';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

/**
 * DashboardActivity — Nested Route demonstrating:
 * - Rendering lists with unique keys
 * - Controlled search & filter form
 * - useMemo for filtering and aggregate trade calculations
 * - Browser file export (JSON / CSV generation)
 * - Empty state conditional rendering
 */
export function DashboardActivity() {
  const { transactions } = usePortfolio();
  const { theme } = useStockStore();
  const isDark = theme === 'dark';

  // Controlled filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'BUY' | 'SELL'
  const [sortBy, setSortBy] = useState('NEWEST'); // 'NEWEST' | 'OLDEST' | 'AMOUNT_DESC'

  // Filtered & Sorted Transactions via useMemo
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchesQuery =
          !searchQuery.trim() ||
          tx.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (tx.name && tx.name.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesType = filterType === 'ALL' || tx.type === filterType;
        return matchesQuery && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') return new Date(b.timestamp) - new Date(a.timestamp);
        if (sortBy === 'OLDEST') return new Date(a.timestamp) - new Date(b.timestamp);
        if (sortBy === 'AMOUNT_DESC') return b.total - a.total;
        return 0;
      });
  }, [transactions, searchQuery, filterType, sortBy]);

  // Aggregate statistics via useMemo
  const stats = useMemo(() => {
    let totalBuys = 0;
    let totalSells = 0;
    let buyVolume = 0;
    let sellVolume = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'BUY') {
        totalBuys += 1;
        buyVolume += tx.total;
      } else {
        totalSells += 1;
        sellVolume += tx.total;
      }
    });

    return { totalBuys, totalSells, buyVolume, sellVolume };
  }, [transactions]);

  // Export to JSON download
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vitaldrop_activity_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export to CSV download
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Symbol', 'Name', 'Quantity', 'Price', 'Total', 'RealizedPnL'];
    const rows = transactions.map((t) => [
      t.id,
      t.timestamp,
      t.type,
      t.symbol,
      `"${t.name?.replace(/"/g, '""') || ''}"`,
      t.quantity,
      t.price,
      t.total,
      t.realizedPnL || 0,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vitaldrop_trade_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/8' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            <span>Total Buy Volume</span>
          </div>
          <p className="text-xl font-bold text-emerald-400">
            ₹{stats.buyVolume.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">{stats.totalBuys} buy orders completed</p>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/8' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
            <span>Total Sell Volume</span>
          </div>
          <p className="text-xl font-bold text-rose-400">
            ₹{stats.sellVolume.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">{stats.totalSells} sell orders completed</p>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/8' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <CheckCircle2 className="w-4 h-4 text-violet-400" />
            <span>Total Orders Settled</span>
          </div>
          <p className="text-xl font-bold text-violet-400">{transactions.length}</p>
          <p className="text-xs text-gray-500 mt-1">100% simulated instantaneous execution</p>
        </div>
      </div>

      {/* ── CONTROLLED FILTER & SEARCH TOOLBAR ── */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
          isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200 shadow-sm'
        }`}
      >
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by ticker or name..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border outline-none transition-all ${
              isDark
                ? 'bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-violet-500'
            }`}
          />
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-end">
          {/* BUY / SELL / ALL tabs */}
          <div className="flex rounded-xl p-1 gap-1 bg-white/5 border border-white/10">
            {['ALL', 'BUY', 'SELL'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  filterType === type
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border outline-none ${
              isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-800'
            }`}
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
            <option value="AMOUNT_DESC">Highest Amount</option>
          </select>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              title="Download CSV log"
              disabled={transactions.length === 0}
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              title="Download JSON log"
              disabled={transactions.length === 0}
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── TRANSACTION LISTING TABLE ── */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={History}
          title="No transactions found"
          description={
            searchQuery
              ? `No transactions matched "${searchQuery}". Try clearing filters.`
              : 'You have not executed any trades yet. Head to Market to make your first trade!'
          }
          isDark={isDark}
        />
      ) : (
        <div
          className={`rounded-2xl border overflow-hidden ${
            isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`border-b font-semibold uppercase tracking-wider ${
                  isDark ? 'bg-white/[0.02] border-white/8 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                <tr>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4 text-right">Quantity</th>
                  <th className="py-3.5 px-4 text-right">Execution Price</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4 text-right">Realized P&amp;L</th>
                  <th className="py-3.5 px-4 text-right">Date &amp; Time</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                {filteredTransactions.map((tx) => {
                  const isBuy = tx.type === 'BUY';
                  const dateStr = new Date(tx.timestamp).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={tx.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <Badge variant={isBuy ? 'buy' : 'sell'}>
                          {isBuy ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          <span>{tx.type}</span>
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-sm">{tx.symbol}</div>
                        <div className="text-gray-400 truncate max-w-[160px]">{tx.name}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium">
                        {tx.quantity} shares
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium">
                        ₹{tx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold">
                        ₹{tx.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-right font-semibold">
                        {tx.realizedPnL !== undefined ? (
                          <span className={tx.realizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {tx.realizedPnL >= 0 ? '+' : ''}₹
                            {tx.realizedPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right text-gray-400 whitespace-nowrap">
                        {dateStr}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Settled</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardActivity;
