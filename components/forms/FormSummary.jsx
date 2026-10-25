'use client';
import React from 'react';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { useStockStore } from '@/store/stockStore';

/**
 * FormSummary — Readable card summarizing confirmed inputs & illustrative calculations
 */
export function FormSummary({
  title = 'Summary of Submitted Values',
  subtitle = 'Review your calibrated parameters and strategy inputs below.',
  items = [],
  disclaimer = 'Assumptions and calculations are illustrative models based on user inputs and do not represent guaranteed market returns.',
  actions,
  className = '',
}) {
  const { theme } = useStockStore();
  const isDark = theme === 'dark';

  return (
    <div
      className={`rounded-2xl border p-6 space-y-6 transition-all ${
        isDark
          ? 'bg-[#0d0d1e]/90 border-violet-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.4)]'
          : 'bg-white border-violet-200 shadow-md'
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          {subtitle && (
            <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Grid of Key-Value Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-1 transition-all ${
                isDark ? 'bg-white/[0.02] border-white/8' : 'bg-gray-50 border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  {Icon && <Icon className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                  <span>{item.label}</span>
                </span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeStyle ||
                      (isDark ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              <div className="mt-1">
                <span className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.value}
                </span>
                {item.hint && (
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{item.hint}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mandatory Regulatory / Assumption Disclaimer */}
      {disclaimer && (
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
            isDark
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div className="leading-relaxed">
            <span className="font-bold">Important Notice: </span>
            <span>{disclaimer}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {actions && (
        <div className="pt-2 border-t border-white/8 flex items-center justify-end flex-wrap gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}

export default FormSummary;
