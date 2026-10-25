'use client';
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

export function DemoPreviewSection() {
  return (
    <section className="bg-[#080814] py-24 overflow-hidden relative">
      <div className="absolute inset-0 bg-violet-600/5 blur-[150px] pointer-events-none rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]" />

      <div className="max-w-screen-xl mx-auto px-6 sm:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">
            Experience the Dashboard
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-8">
            Access professional-grade tools, simplified for beginners. Real charts, real insights, zero capital risk.
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-3 px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-600/30 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Launch Live Dashboard</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Dashboard Mockup Preview Linking Directly to Dashboard */}
        <Link
          to="/dashboard"
          className="block relative mx-auto w-full max-w-5xl rounded-t-[2rem] border border-white/10 bg-[#0d0d1a] shadow-2xl p-4 sm:p-6 pb-0 overflow-hidden group cursor-pointer hover:border-violet-500/40 transition-colors"
          title="Click to open the live Investment Dashboard"
        >
          {/* Mock Header */}
          <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
            </div>
            <div className="flex-1 bg-white/5 h-8 rounded-lg max-w-sm border border-white/5 flex items-center px-4">
              <div className="w-4 h-4 rounded bg-white/20 mr-2" />
              <span className="text-xs text-gray-400">vitaldrop.io/dashboard</span>
            </div>
            <span className="text-xs text-violet-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>Open live</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Mock Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
            <div className="md:col-span-2 space-y-6">
              {/* Mock Ticker Bar */}
              <div className="h-28 rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-white text-lg">RELIANCE.NS</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">NSE</span>
                  </div>
                  <div className="text-2xl font-black text-white">₹2,845.20</div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-400">+1.85%</span>
                  <p className="text-xs text-gray-500 mt-1">Live simulation</p>
                </div>
              </div>

              {/* Mock Chart Area */}
              <div className="h-64 rounded-2xl border border-white/5 bg-white/[0.02] p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Interactive Lightweight Financial Chart</span>
                  <span className="text-emerald-400 font-medium">Real-Time Data</span>
                </div>
                {/* SVG Graph Wave */}
                <svg className="w-full h-32 stroke-violet-500 fill-none" viewBox="0 0 100 25">
                  <path
                    d="M0 20 Q 15 5, 30 15 T 60 10 T 80 5 T 100 2"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="flex justify-between text-[10px] text-gray-600">
                  <span>09:15 AM</span>
                  <span>11:30 AM</span>
                  <span>01:30 PM</span>
                  <span>03:30 PM</span>
                </div>
              </div>
            </div>

            {/* Mock Sidebar */}
            <div className="space-y-4">
              <div className="h-40 rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">Virtual Portfolio</span>
                  <span className="text-xs text-emerald-400 font-bold">₹10,00,000</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-violet-500 w-3/4 rounded-full" />
                  </div>
                  <p className="text-[10px] text-gray-500">75% Capital Available</p>
                </div>
              </div>

              <div className="h-52 rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
                <div className="text-xs font-semibold text-gray-400">Top Movers (NSE)</div>
                <div className="space-y-2">
                  {['TCS.NS (+2.4%)', 'INFY.NS (+1.8%)', 'HDFCBANK.NS (-0.5%)'].map((stock, i) => (
                    <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-white/5">
                      <span className="text-gray-300 font-medium">{stock.split(' ')[0]}</span>
                      <span className={stock.includes('+') ? 'text-emerald-400' : 'text-red-400'}>
                        {stock.split(' ')[1]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

export default DemoPreviewSection;
