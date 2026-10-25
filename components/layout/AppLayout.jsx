'use client';
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useStockStore } from '@/store/stockStore';
import { useAuthStore } from '@/store/authStore';
import { usePortfolio } from '@/hooks/usePortfolio';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNavigation } from './MobileNavigation';
import { TradeModal } from '../trading/TradeModal';

/**
 * AppLayout — Master Application Layout Shell
 * Integrates:
 * - Desktop Collapsible Sidebar
 * - Mobile Navigation Drawer
 * - Top Navbar with Breadcrumbs & Global Search
 * - Global Trade Modal State Management
 * - Ambient Fintech Background Lighting
 * - Accessible Semantics & Keyboard Shortcuts
 */
export function AppLayout() {
  const { theme } = useStockStore();
  const { balance } = usePortfolio();
  const isDark = theme === 'dark';
  const location = useLocation();

  // Desktop sidebar collapse state with persistence
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vitaldrop_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('vitaldrop_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  // Mobile menu drawer open state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Trade Modal state (lifted state so any page/card can trigger a trade)
  const [tradeModalState, setTradeModalState] = useState({
    isOpen: false,
    stock: null,
    initialAction: 'BUY',
  });

  // Global event listener to open trade modal from anywhere in the app
  useEffect(() => {
    const handleOpenTrade = (event) => {
      if (event.detail?.stock) {
        setTradeModalState({
          isOpen: true,
          stock: event.detail.stock,
          initialAction: event.detail.initialAction || 'BUY',
        });
      }
    };

    window.addEventListener('vitaldrop_open_trade', handleOpenTrade);
    return () => {
      window.removeEventListener('vitaldrop_open_trade', handleOpenTrade);
    };
  }, []);

  const closeTradeModal = () => {
    setTradeModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div
      className={`min-h-screen flex flex-row transition-colors duration-300 relative ${
        isDark ? 'bg-[#080814] text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Ambient background glows for dark mode */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px]" />
        </div>
      )}

      {/* ── DESKTOP SIDEBAR ── */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* ── MOBILE NAVIGATION DRAWER ── */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* ── MAIN CONTENT WRAPPER ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Sticky Top Navbar */}
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Dynamic Route Outlet */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* Global Application Footer */}
        <footer
          className={`py-8 border-t text-xs transition-colors ${
            isDark ? 'border-white/5 text-gray-600 bg-[#06060f]/80' : 'border-gray-200 text-gray-500 bg-white'
          }`}
        >
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-violet-400">Vital Drop</span>
              <span>— Real-Time Indian Stock Market Simulator. For educational purposes only.</span>
            </div>

            <div className="flex items-center flex-wrap gap-4 text-gray-400">
              <Link to="/" className="hover:text-violet-400 transition-colors">Home</Link>
              <Link to="/dashboard" className="hover:text-violet-400 transition-colors">Dashboard</Link>
              <Link to="/portfolio" className="hover:text-violet-400 transition-colors">Portfolio</Link>
              <Link to="/risk-analyzer" className="hover:text-violet-400 transition-colors">Risk Analyzer</Link>
              <Link to="/watchlist" className="hover:text-violet-400 transition-colors">Watchlist</Link>
              <Link to="/market" className="hover:text-violet-400 transition-colors">Market</Link>
              <Link to="/leaderboard" className="hover:text-violet-400 transition-colors">Leaderboard</Link>
              <Link to="/settings" className="hover:text-violet-400 transition-colors">Settings</Link>
            </div>
          </div>
        </footer>
      </div>

      {/* ── GLOBAL TRADE EXECUTION MODAL ── */}
      <TradeModal
        isOpen={tradeModalState.isOpen}
        onClose={closeTradeModal}
        stock={tradeModalState.stock}
        initialAction={tradeModalState.initialAction}
        isDark={isDark}
      />
    </div>
  );
}

export default AppLayout;
