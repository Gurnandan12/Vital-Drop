'use client';
import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  LineChart,
  Briefcase,
  Trophy,
  User,
  Settings,
  Sparkles,
  SlidersHorizontal,
  Star,
  ChevronLeft,
  ChevronRight,
  Wallet,
  LogOut,
  LogIn,
  ShoppingBag,
} from 'lucide-react';
import { useStockStore } from '@/store/stockStore';
import { useAuthStore } from '@/store/authStore';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useBasketStore, selectBasketItemCount } from '@/store/basketStore';

/**
 * Sidebar — Reusable Desktop Navigation Sidebar
 * Features:
 * - Collapsible state (expanded: 260px, collapsed: 80px)
 * - Vital Drop brand identity
 * - Active route highlighting with glow and indicator pill
 * - Dynamic badge display (e.g. watchlist count, AI badge)
 * - Quick virtual cash balance preview
 * - User authentication state
 */
export function Sidebar({ collapsed, onToggleCollapse }) {
  const { theme, watchlist } = useStockStore();
  const { user, logout } = useAuthStore();
  const { balance } = usePortfolio();
  const basketCount = useBasketStore(selectBasketItemCount);
  const location = useLocation();
  const isDark = theme === 'dark';

  const navSections = [
    {
      title: 'Navigation',
      items: [
        {
          to: '/',
          label: 'Overview / Home',
          icon: Sparkles,
          exact: true,
        },
        {
          to: '/dashboard',
          label: 'Investment Dashboard',
          icon: LayoutDashboard,
          // Active for any /dashboard sub-route
          isActiveRoute: (pathname) => pathname.startsWith('/dashboard'),
        },
        {
          to: '/portfolio',
          label: 'Portfolio',
          icon: Briefcase,
        },
        {
          to: '/risk-analyzer',
          label: 'Risk Analyzer',
          icon: SlidersHorizontal,
          badge: 'AI',
          badgeStyle: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
        },
        {
          to: '/risk-sandbox',
          label: 'Risk Sandbox',
          icon: Sparkles,
          badge: 'WHAT-IF',
          badgeStyle: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
        },
        {
          to: '/watchlist',
          label: 'Watchlist',
          icon: Star,
          badge: watchlist?.length > 0 ? `${watchlist.length}` : null,
          badgeStyle: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        },
        {
          to: '/basket',
          label: 'Investment Basket',
          icon: ShoppingBag,
          badge: basketCount > 0 ? `${basketCount}` : null,
          badgeStyle: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        },
      ],
    },
    {
      title: 'Market & Social',
      items: [
        {
          to: '/market',
          label: 'Market Directory',
          icon: LineChart,
        },
        {
          to: '/leaderboard',
          label: 'Leaderboard',
          icon: Trophy,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          to: '/profile',
          label: 'Profile',
          icon: User,
        },
        {
          to: '/settings',
          label: 'Settings',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <aside
      aria-label="Application Sidebar"
      className={`hidden md:flex flex-col border-r transition-all duration-300 select-none z-30 shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      } ${
        isDark
          ? 'bg-[#080814]/95 border-white/8 shadow-[4px_0_24px_rgba(0,0,0,0.4)]'
          : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      {/* ── Brand Logo Header ── */}
      <div
        className={`h-16 flex items-center px-4 border-b ${
          isDark ? 'border-white/8' : 'border-gray-200'
        } ${collapsed ? 'justify-center' : 'justify-between'}`}
      >
        <Link
          to="/"
          className="flex items-center gap-3 group overflow-hidden"
          title="Vital Drop — Crash. Recover. Repeat."
        >
          {/* Animated Glowing Drop Logo */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-violet-600/30 blur-md rounded-full pointer-events-none group-hover:bg-violet-600/50 transition-all" />
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative drop-shadow-[0_0_10px_rgba(168,85,247,0.6)] transition-transform group-hover:scale-105"
            >
              <defs>
                <linearGradient id="drop-grad-sidebar" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop stopColor="#a855f7" offset="0%" />
                  <stop stopColor="#3b82f6" offset="100%" />
                </linearGradient>
              </defs>
              <path
                d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"
                stroke="url(#drop-grad-sidebar)"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0 transition-opacity duration-200">
              <span
                className={`font-black text-lg tracking-tight leading-none ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                Vital <span className="text-violet-400">Drop</span>
              </span>
              <span className="text-[9px] font-bold tracking-widest text-violet-400/80 uppercase mt-0.5 truncate">
                Crash • Recover • Repeat
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* ── Navigation Links ── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!collapsed && (
              <div
                className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                {section.title}
              </div>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isCurrent = item.isActiveRoute
                  ? item.isActiveRoute(location.pathname)
                  : item.exact
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    title={collapsed ? item.label : undefined}
                    className={`relative flex items-center rounded-xl text-xs font-semibold transition-all group ${
                      collapsed
                        ? 'justify-center w-12 h-12 mx-auto'
                        : 'gap-3 px-3.5 py-2.5 w-full'
                    } ${
                      isCurrent
                        ? isDark
                          ? 'bg-violet-600/15 text-white border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                          : 'bg-violet-50 text-violet-700 border border-violet-200 shadow-sm'
                        : isDark
                        ? 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    {/* Active Route Left Accent Pill */}
                    {isCurrent && (
                      <span
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full ${
                          isDark ? 'bg-violet-500 shadow-[0_0_8px_#a855f7]' : 'bg-violet-600'
                        }`}
                      />
                    )}

                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isCurrent
                          ? isDark
                            ? 'text-violet-400'
                            : 'text-violet-600'
                          : isDark
                          ? 'text-gray-400 group-hover:text-white'
                          : 'text-gray-500 group-hover:text-gray-900'
                      }`}
                    />

                    {!collapsed && (
                      <span className="truncate flex-1 font-medium">{item.label}</span>
                    )}

                    {!collapsed && item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${item.badgeStyle}`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {collapsed && item.badge && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-violet-500 ring-2 ring-[#080814]" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Virtual Portfolio Cash Card ── */}
      <div className={`p-3 border-t ${isDark ? 'border-white/8' : 'border-gray-200'}`}>
        {!collapsed ? (
          <Link
            to="/portfolio"
            title="View Virtual Portfolio"
            className={`block rounded-2xl p-3 border transition-all hover:scale-[1.02] ${
              isDark
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-medium text-emerald-400/90 mb-1">
              <span className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />
                <span>Virtual Balance</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider">Active</span>
            </div>
            <div className="text-base font-extrabold tracking-tight">
              ₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </Link>
        ) : (
          <Link
            to="/portfolio"
            title={`Virtual Balance: ₹${balance.toLocaleString('en-IN')}`}
            className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
          >
            <Wallet className="w-5 h-5" />
          </Link>
        )}
      </div>

      {/* ── Sidebar Footer (User / Login / Collapse Toggle) ── */}
      <div
        className={`p-3 border-t flex items-center justify-between gap-2 ${
          isDark ? 'border-white/8' : 'border-gray-200'
        }`}
      >
        {!collapsed ? (
          user ? (
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/40 text-violet-300 font-bold flex items-center justify-center text-xs shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate leading-tight">{user.name || 'Investor'}</p>
                <p className="text-[10px] text-gray-500 truncate">{user.email || 'Free Tier'}</p>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 text-xs font-semibold text-violet-400 hover:text-violet-300 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )
        ) : (
          user ? (
            <button
              onClick={logout}
              title="Sign Out"
              className="mx-auto p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <Link
              to="/login"
              title="Sign In"
              className="mx-auto p-2 rounded-xl text-violet-400 hover:bg-white/5 transition-colors"
            >
              <LogIn className="w-4 h-4" />
            </Link>
          )
        )}

        {/* Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className={`p-2 rounded-xl border transition-all ${
            collapsed ? 'mx-auto' : ''
          } ${
            isDark
              ? 'border-white/10 hover:bg-white/5 text-gray-400 hover:text-white'
              : 'border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
