'use client';
import { useStockStore } from '@/store/stockStore';
import { Clock, ShieldCheck } from 'lucide-react';
export function InsuranceRecommender({ isDark: propIsDark } = {}) {
    const { theme } = useStockStore();
    const isDark = propIsDark !== undefined ? propIsDark : theme === 'dark';
    return (<div className={`min-h-[460px] rounded-3xl border flex flex-col items-center justify-center p-8 sm:p-12 text-center transition-colors relative overflow-hidden ${isDark
            ? 'bg-[#0d0d1a]/80 border-white/10 text-white'
            : 'bg-white border-gray-200 text-gray-900 shadow-sm'}`}>
      {/* Subtle ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"/>

      <div className="relative z-10 flex flex-col items-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/10">
          <Clock className="w-8 h-8 text-violet-400 animate-pulse"/>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-400 mb-4">
          <ShieldCheck className="w-3.5 h-3.5"/>
          <span>Insurance & Mutual Funds Recommender</span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
          Coming Soon....
        </h2>

        <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          The Insurance & Mutual Funds Recommender is currently undergoing upgrades. Stay tuned!
        </p>
      </div>
    </div>);
}
export default InsuranceRecommender;
