'use client';
import React, { useState, useMemo } from 'react';
import { Trophy, Medal, Search, TrendingUp, Award, User, Flame } from 'lucide-react';
import { useStockStore } from '@/store/stockStore';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '../ui/Badge';

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Aarav Sharma', handle: '@aarav_trades', returnPercent: 44.8, totalTrades: 142, badge: 'Alpha Bull', winRate: '78%' },
  { rank: 2, name: 'Priya Iyer', handle: '@piyer_quant', returnPercent: 39.2, totalTrades: 98, badge: 'Value Hunter', winRate: '74%' },
  { rank: 3, name: 'Rohit Verma', handle: '@rverma_dalal', returnPercent: 35.1, totalTrades: 215, badge: 'Momentum King', winRate: '69%' },
  { rank: 4, name: 'Ananya Deshmukh', handle: '@ananya_d', returnPercent: 31.6, totalTrades: 64, badge: 'Swing Trader', winRate: '72%' },
  { rank: 5, name: 'Kunal Patel', handle: '@kunal_invests', returnPercent: 28.4, totalTrades: 89, badge: 'Bluechip Hold', winRate: '65%' },
  { rank: 6, name: 'Sneha Roy', handle: '@sneha_r', returnPercent: 25.9, totalTrades: 110, badge: 'Risk Pro', winRate: '63%' },
  { rank: 7, name: 'Vikramjit Singh', handle: '@vikram_gill', returnPercent: 22.3, totalTrades: 55, badge: 'Index Hedger', winRate: '61%' },
  { rank: 8, name: 'Meera Nambiar', handle: '@meera_n', returnPercent: 19.7, totalTrades: 72, badge: 'Sector Rotator', winRate: '59%' },
  { rank: 9, name: 'Rohan Gupta', handle: '@rohan_g', returnPercent: 16.4, totalTrades: 43, badge: 'Disciplined', winRate: '58%' },
  { rank: 10, name: 'Zoya Khan', handle: '@zoyak', returnPercent: 14.8, totalTrades: 38, badge: 'Newbie Prodigy', winRate: '55%' },
];

/**
 * LeaderboardPage — Demonstrates:
 * - List rendering with keys
 * - Controlled search input
 * - useMemo for filtering
 * - Conditional styling for top 3 podium ranks
 */
export function LeaderboardPage() {
  const { theme } = useStockStore();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';

  const [search, setSearch] = useState('');

  const filteredLeaders = useMemo(() => {
    return MOCK_LEADERBOARD.filter(
      (l) =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.handle.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* ── Page Heading ── */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-400 mb-3">
          <Trophy className="w-3.5 h-3.5" />
          <span>Vital Drop Community Arena</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Trader Leaderboard
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Rankings of simulated investors based on realized + unrealized percentage returns this season.
        </p>
      </div>

      {/* ── Top 3 Podium Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        {MOCK_LEADERBOARD.slice(0, 3).map((trader, idx) => {
          const podiumStyles = [
            'border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent',
            'border-slate-400/40 bg-gradient-to-b from-slate-400/10 to-transparent',
            'border-amber-700/40 bg-gradient-to-b from-amber-700/10 to-transparent',
          ][idx];

          const medalColors = ['text-amber-400', 'text-slate-300', 'text-amber-600'][idx];

          return (
            <div
              key={trader.name}
              className={`rounded-3xl border p-6 text-center space-y-3 relative overflow-hidden backdrop-blur-xl ${podiumStyles}`}
            >
              <div className="flex justify-center">
                <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${medalColors}`}>
                  <Medal className="w-7 h-7" />
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Rank #{trader.rank}
                </span>
                <h3 className="font-extrabold text-xl">{trader.name}</h3>
                <p className="text-xs text-gray-400">{trader.handle}</p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-2xl font-black text-emerald-400">
                  +{trader.returnPercent}%
                </div>
                <div className="text-[11px] text-gray-400">Total Net Return</div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <Badge variant="primary">{trader.badge}</Badge>
                <span className="text-xs text-gray-400">{trader.winRate} Win Rate</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Full Leaderboard Table ── */}
      <div
        className={`rounded-3xl border overflow-hidden ${
          isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200 shadow-sm'
        }`}
      >
        {/* Search header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trader by name or handle..."
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border outline-none ${
                isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            />
          </div>

          <span className="text-xs text-gray-400 hidden sm:inline">
            Updated every 60s • Virtual Simulated Trades
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className={`border-b font-semibold uppercase tracking-wider ${
                isDark ? 'bg-white/[0.02] border-white/8 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}
            >
              <tr>
                <th className="py-4 px-5">Rank</th>
                <th className="py-4 px-5">Investor</th>
                <th className="py-4 px-5 text-right">Net Return</th>
                <th className="py-4 px-5 text-right">Trades</th>
                <th className="py-4 px-5 text-right">Win Rate</th>
                <th className="py-4 px-5 text-center">Badge</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
              {filteredLeaders.map((trader) => (
                <tr
                  key={trader.name}
                  className={`transition-colors ${
                    isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="py-4 px-5 font-black text-sm">
                    <span className={trader.rank <= 3 ? 'text-amber-400' : 'text-gray-400'}>
                      #{trader.rank}
                    </span>
                  </td>

                  <td className="py-4 px-5">
                    <div className="font-bold text-sm">{trader.name}</div>
                    <div className="text-gray-400">{trader.handle}</div>
                  </td>

                  <td className="py-4 px-5 text-right font-bold text-sm text-emerald-400">
                    +{trader.returnPercent}%
                  </td>

                  <td className="py-4 px-5 text-right font-medium">
                    {trader.totalTrades}
                  </td>

                  <td className="py-4 px-5 text-right font-medium text-violet-400">
                    {trader.winRate}
                  </td>

                  <td className="py-4 px-5 text-center">
                    <Badge variant="default">{trader.badge}</Badge>
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

export default LeaderboardPage;
