'use client';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useStockStore } from '@/store/stockStore';

/**
 * Route path-to-label dictionary
 */
const ROUTE_LABELS = {
  dashboard: 'Investment Dashboard',
  overview: 'Overview',
  activity: 'Trade Activity',
  market: 'Market Directory',
  stock: 'Stock Analysis',
  portfolio: 'Portfolio',
  'risk-analyzer': 'Risk Analyzer',
  watchlist: 'Watchlist',
  leaderboard: 'Leaderboard',
  profile: 'Profile',
  settings: 'Settings',
  login: 'Sign In',
  signup: 'Create Account',
};

/**
 * Breadcrumbs — Dynamic hierarchical navigation trail
 * Supports automatic route parsing or custom items override
 */
export function Breadcrumbs({ items, className = '' }) {
  const location = useLocation();
  const { theme } = useStockStore();
  const isDark = theme === 'dark';

  // Derive breadcrumb segments from current pathname if items not passed explicitly
  const crumbs = React.useMemo(() => {
    if (items && Array.isArray(items)) return items;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const generated = [{ label: 'Home', to: '/' }];

    let accumulatedPath = '';
    pathSegments.forEach((segment, idx) => {
      accumulatedPath += `/${segment}`;
      const isLast = idx === pathSegments.length - 1;

      // Handle stock ticker symbols or dynamic params
      let label = ROUTE_LABELS[segment.toLowerCase()] || segment.toUpperCase();
      if (segment.includes('.')) {
        // e.g. RELIANCE.NS -> RELIANCE (NSE)
        const parts = segment.split('.');
        label = `${parts[0]} (${parts[1] || 'NSE'})`;
      }

      generated.push({
        label,
        to: isLast ? null : accumulatedPath,
        isCurrent: isLast,
      });
    });

    return generated;
  }, [items, location.pathname]);

  if (crumbs.length <= 1) {
    return null; // Omit on landing page or root
  }

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5">
        {crumbs.map((crumb, index) => {
          const isFirst = index === 0;
          const isLast = index === crumbs.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {!isFirst && (
                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isDark ? 'text-gray-600' : 'text-gray-400'
                  }`}
                  aria-hidden="true"
                />
              )}

              {crumb.to && !isLast ? (
                <Link
                  to={crumb.to}
                  className={`flex items-center gap-1 font-medium transition-colors hover:underline ${
                    isDark
                      ? 'text-gray-400 hover:text-violet-400'
                      : 'text-gray-500 hover:text-violet-600'
                  }`}
                >
                  {isFirst && <Home className="w-3.5 h-3.5 shrink-0" />}
                  <span>{crumb.label}</span>
                </Link>
              ) : (
                <span
                  className={`font-semibold truncate max-w-[200px] sm:max-w-xs ${
                    isDark ? 'text-violet-300' : 'text-violet-700'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
