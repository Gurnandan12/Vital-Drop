'use client';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  LayoutDashboard,
  LineChart,
  ArrowLeft,
  Briefcase,
  SlidersHorizontal,
  Star,
  Home,
} from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * NotFoundPage — 404 Custom Error Route
 * Demonstrates:
 * - 404 routing with React Router catch-all (*)
 * - Vital Drop visual branding and cohesive fintech styling
 * - Direct navigation shortcuts to all core sections
 */
export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 text-center">
      <div className="relative max-w-lg w-full p-8 sm:p-10 rounded-3xl border border-white/10 bg-[#0d0d1e]/90 backdrop-blur-2xl shadow-2xl space-y-6 animate-in zoom-in-95">
        {/* Glowing Drop Icon Graphic */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-violet-600/30 blur-2xl rounded-full pointer-events-none" />
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative drop-shadow-[0_0_20px_rgba(168,85,247,0.7)]"
            >
              <defs>
                <linearGradient id="drop-404" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop stopColor="#a855f7" offset="0%" />
                  <stop stopColor="#ef4444" offset="100%" />
                </linearGradient>
              </defs>
              <path
                d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"
                stroke="url(#drop-404)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* 404 Headline */}
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
            Error 404 • Ticker Not Found
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-4 tracking-tight">
            Lost in the Market
          </h1>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            The page or route you are looking for has been delisted, moved, or never existed in the simulator.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </Button>

          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span>Investment Dashboard</span>
            </Button>
          </Link>
        </div>

        {/* Quick Route Shortcuts */}
        <div className="pt-4 border-t border-white/5">
          <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">
            Explore Other Sections
          </p>
          <div className="flex items-center justify-center flex-wrap gap-2 text-xs">
            <Link
              to="/"
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              to="/portfolio"
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            >
              Portfolio
            </Link>
            <Link
              to="/risk-analyzer"
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            >
              Risk Analyzer
            </Link>
            <Link
              to="/watchlist"
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            >
              Watchlist
            </Link>
            <Link
              to="/market"
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            >
              Market Directory
            </Link>
          </div>
        </div>

        <p className="text-[11px] text-gray-600 pt-2 border-t border-white/5">
          Vital Drop Indian Stock Market Simulator
        </p>
      </div>
    </div>
  );
}

export default NotFoundPage;
