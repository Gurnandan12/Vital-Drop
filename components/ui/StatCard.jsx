'use client';
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Reusable StatCard Component
 * Demonstrates: Reusable UI, Props, Conditional rendering, ES6+ Template literals
 */
export function StatCard({
  title,
  value,
  subtitle,
  change,
  isPositive,
  icon: Icon,
  isDark = true,
  className = '',
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-200 hover:border-violet-500/30 ${
        isDark
          ? 'bg-[#0d0d1a] border-white/8 text-white'
          : 'bg-white border-gray-200 text-gray-900 shadow-sm'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <h4 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {value}
        </h4>

        {change !== undefined && (
          <div
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
              isPositive
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default StatCard;
