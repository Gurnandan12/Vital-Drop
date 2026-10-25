'use client';
import React, { useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  X,
  Sparkles,
  LayoutDashboard,
  LineChart,
  Briefcase,
  SlidersHorizontal,
  Star,
  Trophy,
  User,
  Settings,
  Wallet,
  LogIn,
  LogOut,
  ShoppingBag,
} from 'lucide-react';
import { useStockStore } from '@/store/stockStore';
import { useAuthStore } from '@/store/authStore';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useBasketStore, selectBasketItemCount } from '@/store/basketStore';
import { SearchBar } from '../SearchBar';

/**
 * MobileNavigation — Slide-in Drawer for Small and Medium Screens
 * Features:
 * - Backdrop overlay with animated blur
 * - Keyboard (ESC) accessibility
 * - Full route navigation tree with active route indicators
 * - Integrated SearchBar
 * - Quick Virtual Balance summary
 */
export function MobileNavigation({ isOpen, onClose }) {
  const { theme, watchlist } = useStockStore();
  const { user, logout } = useAuthStore();
  const { balance } = usePortfolio();
  const basketCount = useBasketStore(selectBasketItemCount);
  const location = useLocation();
  const isDark = theme === 'dark';

  // Close drawer on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname, isOpen, onClose]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const navLinks = [
    { to: '/', label: 'Overview / Home', icon: Sparkles, exact: true },
    {
      to: '/dashboard',
      label: 'Investment Dashboard',
      icon: LayoutDashboard,
      isActiveRoute: (pathname) => pathname.startsWith('/dashboard'),
    },
    { to: '/portfolio', label: 'Portfolio', icon: Briefcase },
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
    { to: '/market', label: 'Market Directory', icon: LineChart },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`relative w-4/5 max-w-sm flex-1 flex flex-col h-full shadow-2xl transition-transform animate-in slide-in-from-left duration-300 z-10 ${
          isDark ? 'bg-[#0a0a18] text-white border-r border-white/10' : 'bg-white text-gray-900 border-r border-gray-200'
        }`}
      >
        {/* Header */}
        <div className={`h-16 px-4 flex items-center justify-between border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"
            >
              <defs>
                <linearGradient id="drop-grad-mobile" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop stopColor="#a855f7" offset="0%" />
                  <stop stopColor="#3b82f6" offset="100%" />
                </linearGradient>
              </defs>
              <path
                d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"
                stroke="url(#drop-grad-mobile)"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight leading-none">
                Vital <span className="text-violet-400">Drop</span>
              </span>
              <span className="text-[8px] font-bold tracking-widest text-violet-400 uppercase mt-0.5">
                Crash • Recover • Repeat
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors ${
              isDark
                ? 'border-white/10 hover:bg-white/5 text-gray-400 hover:text-white'
                : 'border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/5">
          <SearchBar />
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
          {navLinks.map((item) => {
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
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isCurrent
                    ? isDark
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                      : 'bg-violet-100 text-violet-700 border border-violet-200'
                    : isDark
                    ? 'text-gray-300 hover:bg-white/5'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 text-violet-400" />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${item.badgeStyle}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Virtual Cash & User Bottom Bar */}
        <div className={`p-4 border-t space-y-3 ${isDark ? 'border-white/10 bg-[#080814]' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-gray-400">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Virtual Balance:</span>
            </span>
            <span className="text-sm font-bold text-emerald-400">
              ₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>

          {user ? (
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-xs shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-bold truncate">{user.name || 'Investor'}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="text-xs font-semibold text-red-400 hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/30"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Your Account</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default MobileNavigation;
