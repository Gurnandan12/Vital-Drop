'use client';
import React from 'react';
import { useStockStore } from '@/store/stockStore';

/**
 * RangeSlider — Controlled range slider with gradient track fill and value readout
 */
export function RangeSlider({
  id,
  name,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  formatValue,
  minLabel,
  maxLabel,
  disabled = false,
  className = '',
}) {
  const { theme } = useStockStore();
  const isDark = theme === 'dark';

  const numVal = typeof value === 'number' ? value : parseFloat(value) || min;
  const percentage = Math.min(Math.max(((numVal - min) / (max - min)) * 100, 0), 100);

  const displayValue = formatValue ? formatValue(numVal) : numVal;

  const handleChange = (e) => {
    const next = parseFloat(e.target.value);
    if (onChange) {
      onChange(next);
    }
  };

  return (
    <div className={`space-y-2 w-full ${className}`}>
      {/* Current Value Display Pill */}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-semibold ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          {minLabel || min}
        </span>

        <span
          className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border shadow-sm ${
            isDark
              ? 'bg-violet-500/15 border-violet-500/30 text-violet-300'
              : 'bg-violet-50 border-violet-200 text-violet-700'
          }`}
        >
          {displayValue}
        </span>

        <span
          className={`text-xs font-semibold ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          {maxLabel || max}
        </span>
      </div>

      {/* Styled Slider Track */}
      <div className="relative py-1 flex items-center">
        <input
          id={id}
          name={name}
          type="range"
          min={min}
          max={max}
          step={step}
          value={numVal}
          onChange={handleChange}
          disabled={disabled}
          style={{
            background: isDark
              ? `linear-gradient(to right, #8b5cf6 0%, #6366f1 ${percentage}%, rgba(255,255,255,0.08) ${percentage}%, rgba(255,255,255,0.08) 100%)`
              : `linear-gradient(to right, #8b5cf6 0%, #6366f1 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
          }}
          className={`w-full h-2 rounded-full appearance-none cursor-pointer outline-none transition-all focus:ring-2 focus:ring-violet-500/30 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-violet-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
      </div>
    </div>
  );
}

export default RangeSlider;
