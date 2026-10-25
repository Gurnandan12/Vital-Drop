'use client';
import React from 'react';

/**
 * ChartSkeleton — Specialized wireframe placeholder for financial charts
 *
 * Prevents layout shifts by preserving the exact chart canvas height while
 * displaying simulated gridlines and an animated wave shimmer.
 */
export function ChartSkeleton({ height = '18rem', isDark = true, message = 'Loading market price history…' }) {
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const labelColor = isDark ? 'text-gray-600' : 'text-gray-400';

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={message}
      style={{ height }}
      className={`relative w-full rounded-xl overflow-hidden flex flex-col justify-between p-4 border select-none ${
        isDark ? 'bg-[#0d0d1a] border-white/5' : 'bg-gray-50 border-gray-100'
      }`}
    >
      {/* Background Horizontal Grid Lines */}
      <div className="absolute inset-x-0 inset-y-8 flex flex-col justify-between pointer-events-none px-4">
        <div className="w-full border-b" style={{ borderColor: gridColor }} />
        <div className="w-full border-b" style={{ borderColor: gridColor }} />
        <div className="w-full border-b" style={{ borderColor: gridColor }} />
        <div className="w-full border-b" style={{ borderColor: gridColor }} />
      </div>

      {/* Simulated Top Price Line */}
      <div className="flex items-center justify-between text-[10px] font-mono z-10">
        <span className={labelColor}>High: ---</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
          <span className="text-xs text-violet-400 font-semibold">{message}</span>
        </div>
      </div>

      {/* SVG Shimmering Area Wave */}
      <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
        <svg
          viewBox="0 0 500 150"
          preserveAspectRatio="none"
          className="w-full h-3/5 text-violet-500/20 animate-pulse"
        >
          <path
            d="M0,80 Q70,40 140,70 T280,50 T420,90 T500,40 L500,150 L0,150 Z"
            fill="currentColor"
          />
          <path
            d="M0,80 Q70,40 140,70 T280,50 T420,90 T500,40"
            fill="none"
            stroke={isDark ? '#8b5cf6' : '#7c3aed'}
            strokeWidth="2"
            strokeDasharray="4 4"
            className="opacity-60"
          />
        </svg>
      </div>

      {/* Simulated Time Axis & Bottom Price */}
      <div className="flex items-center justify-between text-[10px] font-mono z-10 pt-2 border-t border-white/5">
        <span className={labelColor}>Low: ---</span>
        <div className="flex items-center gap-6">
          <span className={labelColor}>--:--</span>
          <span className={labelColor}>--:--</span>
          <span className={labelColor}>--:--</span>
        </div>
      </div>

      <span className="sr-only">{message}</span>
    </div>
  );
}

export default ChartSkeleton;
