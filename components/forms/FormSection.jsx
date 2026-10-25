'use client';
import React from 'react';
import { useStockStore } from '@/store/stockStore';

/**
 * FormSection — Visual card container grouping related fields
 */
export function FormSection({
  title,
  description,
  icon: Icon,
  badge,
  actions,
  children,
  className = '',
}) {
  const { theme } = useStockStore();
  const isDark = theme === 'dark';

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
        isDark
          ? 'bg-[#0d0d1a] border-white/8 shadow-[0_4px_20px_rgba(0,0,0,0.25)]'
          : 'bg-white border-gray-200 shadow-sm'
      } ${className}`}
    >
      {(title || description || Icon || badge) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-white/6">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-violet-600/15 border border-violet-500/25 flex items-center justify-center shrink-0 text-violet-400">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {title}
                </h3>
                {badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isDark
                        ? 'bg-violet-500/15 text-violet-300 border-violet-500/30'
                        : 'bg-violet-50 text-violet-700 border-violet-200'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </div>
              {description && (
                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {description}
                </p>
              )}
            </div>
          </div>

          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      <div className="space-y-5">{children}</div>
    </div>
  );
}

export default FormSection;
