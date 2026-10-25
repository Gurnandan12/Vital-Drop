'use client';
import React, { forwardRef } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useStockStore } from '@/store/stockStore';

/**
 * NumberInput — Controlled numeric input with bounds checking and quick steppers
 */
export const NumberInput = forwardRef(function NumberInput(
  {
    id,
    name,
    value = '',
    onChange,
    onBlur,
    min,
    max,
    step = 1,
    prefix = '₹',
    suffix = '',
    placeholder,
    error,
    disabled = false,
    showSteppers = true,
    className = '',
    ...rest
  },
  ref
) {
  const { theme } = useStockStore();
  const isDark = theme === 'dark';
  const hasError = Boolean(error);
  const errorId = id && hasError ? `${id}-error` : undefined;

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (onChange) {
      onChange(val);
    }
  };

  const handleStep = (direction) => {
    if (disabled) return;
    const current = parseFloat(value) || 0;
    const delta = direction === 'up' ? step : -step;
    let next = current + delta;

    if (typeof min === 'number' && next < min) next = min;
    if (typeof max === 'number' && next > max) next = max;

    if (onChange) {
      onChange(next);
    }
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {/* Prefix currency / symbol */}
      {prefix && (
        <span
          className={`absolute left-3.5 pointer-events-none text-sm font-bold select-none ${
            isDark ? 'text-violet-400' : 'text-violet-600'
          }`}
        >
          {prefix}
        </span>
      )}

      <input
        ref={ref}
        id={id}
        name={name}
        type="number"
        value={value}
        onChange={handleInputChange}
        onBlur={onBlur}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={errorId}
        className={`w-full rounded-xl border text-sm font-semibold transition-all outline-none ${
          prefix ? 'pl-8' : 'pl-4'
        } ${
          showSteppers ? (suffix ? 'pr-24' : 'pr-16') : suffix ? 'pr-14' : 'pr-4'
        } py-2.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
          hasError
            ? isDark
              ? 'bg-rose-500/10 border-rose-500/50 text-white focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
              : 'bg-rose-50 border-rose-400 text-gray-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
            : isDark
            ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 hover:border-white/20 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25'
            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 hover:border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        {...rest}
      />

      {/* Right cluster: optional suffix and step buttons */}
      <div className="absolute right-2 flex items-center gap-1.5">
        {suffix && (
          <span
            className={`text-xs font-semibold mr-1 select-none ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {suffix}
          </span>
        )}

        {showSteppers && !disabled && (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => handleStep('down')}
              disabled={typeof min === 'number' && parseFloat(value) <= min}
              tabIndex={-1}
              aria-label="Decrease value"
              className={`p-1 rounded-lg border transition-all ${
                isDark
                  ? 'border-white/10 hover:bg-white/10 text-gray-300 disabled:opacity-30'
                  : 'border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-30'
              }`}
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => handleStep('up')}
              disabled={typeof max === 'number' && parseFloat(value) >= max}
              tabIndex={-1}
              aria-label="Increase value"
              className={`p-1 rounded-lg border transition-all ${
                isDark
                  ? 'border-white/10 hover:bg-white/10 text-gray-300 disabled:opacity-30'
                  : 'border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-30'
              }`}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default NumberInput;
