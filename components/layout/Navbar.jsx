'use client';
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Sun, Moon, Wallet, Activity, Bell, ShoppingBag } from 'lucide-react';
import { useStockStore } from '@/store/stockStore';
import { useAuthStore } from '@/store/authStore';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useBasketStore, selectBasketItemCount } from '@/store/basketStore';
import { SearchBar } from '../SearchBar';
import { UserProfileMenu } from '../UserProfileMenu';
import { Breadcrumbs } from './Breadcrumbs';

/**
 * Navbar — Top Application Navigation Bar
 * Features:
 * - Mobile hamburger trigger
 * - Integrated Breadcrumbs trail
 * - Global Instant SearchBar
 * - Live Market status badge
 * - Quick virtual balance pill
 * - Theme toggle (Dark / Light)
 * - User Profile / Sign In CTA
 */
export function Navbar({ onOpenMobileMenu }) {
  const { theme, toggleTheme } = useStockStore();
  const { user } = useAuthStore();
  const { balance } = usePortfolio();
  const basketCount = useBasketStore(selectBasketItemCount);
  const isDark = theme === 'dark';

  return (
    <header
      className={`sticky top-0 z-30 h-16 border-b backdrop-blur-xl transition-colors duration-200 ${
        isDark
          ? 'bg-[#080814]/85 border-white/8 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
          : 'bg-white/90 border-gray-200 shadow-sm'
      }`}
    >
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left Side: Mobile Menu Button + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className={`p-2 rounded-xl border md:hidden transition-colors ${
              isDark
                ? 'border-white/10 hover:bg-white/5 text-gray-400 hover:text-white'
                : 'border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:block min-w-0">
            <Breadcrumbs />
          </div>
        </div>

        {/* Center: Global Instant Search Bar */}
        <div className="flex-1 max-w-md mx-2">
          <SearchBar />
        </div>

        {/* Right Side: Market Status, Balance, Theme, Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Live Indian Market Pulse Badge */}
          <div
            className={`hidden xl:flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold ${
              isDark
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
            title="Real-time live feeds enabled for NSE & BSE"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="tracking-wide">NSE/BSE • Live</span>
          </div>

          {/* Quick Virtual Balance Pill */}
          <Link
            to="/portfolio"
            title="View Virtual Portfolio"
            className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-105 ${
              isDark
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 shrink-0" />
            <span>₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </Link>

          {/* Quick Investment Basket Cart Trigger */}
          <Link
            to="/basket"
            title="Investment Planning Basket"
            aria-label={`Investment Basket with ${basketCount} assets`}
            className={`relative p-2 rounded-xl border transition-all ${
              isDark
                ? 'border-white/10 hover:bg-white/5 text-gray-300 hover:text-white'
                : 'border-gray-200 hover:bg-gray-100 text-gray-700 hover:text-gray-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
            {basketCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-[10px] font-black text-white flex items-center justify-center shadow-md animate-in zoom-in">
                {basketCount}
              </span>
            )}
          </Link>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all ${
              isDark
                ? 'border-white/10 hover:bg-white/5 text-gray-400 hover:text-white'
                : 'border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            aria-label="Toggle theme mode"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-600" />}
          </button>

          {/* Profile Dropdown or Sign In */}
          {user ? (
            <UserProfileMenu isDark={isDark} />
          ) : (
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md shadow-violet-600/30 active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
