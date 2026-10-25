'use client';
import React from 'react';
import { useStockStore } from '@/store/stockStore';

const BADGE_STYLES = {
  violet: {
    dark: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    light: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  emerald: {
    dark: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    light: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  blue: {
    dark: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    light: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  amber: {
    dark: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    light: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  rose: {
    dark: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    light: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

/**
 * PageHeader — Standardized, premium header for all application pages
 * Provides consistent typography, badge indicator, and action CTA grouping.
 */
export function PageHeader({
  title,
  description,
  badge,
  badgeVariant = 'violet',
  badgeIcon: BadgeIcon,
  actions,
  children,
  className = '',
}) {
  const { theme } = useStockStore();
  const isDark = theme === 'dark';

  const badgeStyle = BADGE_STYLES[badgeVariant] || BADGE_STYLES.violet;
  const currentBadgeClass = isDark ? badgeStyle.dark : badgeStyle.light;

  return (
    <div className={`space-y-4 pb-4 border-b ${isDark ? 'border-white/8' : 'border-gray-200'} ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          {badge && (
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border shadow-sm ${currentBadgeClass}`}
              >
                {BadgeIcon && <BadgeIcon className="w-3 h-3" />}
                <span>{badge}</span>
              </span>
            </div>
          )}

          <h1
            className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {title}
          </h1>

          {description && (
            <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center flex-wrap gap-2.5 shrink-0 self-start md:self-center">
            {actions}
          </div>
        )}
      </div>

      {children && <div className="pt-2">{children}</div>}
    </div>
  );
}

export default PageHeader;
