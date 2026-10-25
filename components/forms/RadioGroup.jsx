'use client';
import React from 'react';
import { useStockStore } from '@/store/stockStore';
import { FormError } from './FormError';

/**
 * RadioGroup — Accessible, interactive card/pill-based radio group
 */
export function RadioGroup({
  name,
  value,
  onChange,
  options = [],
  layout = 'grid', // 'grid' | 'stack' | 'row'
  error,
  disabled = false,
  className = '',
}) {
  const { theme } = useStockStore();
  const isDark = theme === 'dark';
  const hasError = Boolean(error);
  const errorId = name && hasError ? `${name}-error` : undefined;

  const layoutClass =
    layout === 'stack'
      ? 'flex flex-col gap-2.5'
      : layout === 'row'
      ? 'flex flex-row flex-wrap gap-2.5'
      : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3';

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div role="radiogroup" aria-describedby={errorId} className={layoutClass}>
        {options.map((option) => {
          const isSelected = value === option.value;
          const optId = `${name}-${option.value}`;
          const Icon = option.icon;

          return (
            <label
              key={option.value}
              htmlFor={optId}
              className={`relative flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer select-none transition-all duration-200 group ${
                isSelected
                  ? isDark
                    ? 'bg-violet-600/15 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.15)] ring-1 ring-violet-500/30'
                    : 'bg-violet-50/80 border-violet-300 shadow-sm ring-1 ring-violet-400'
                  : isDark
                  ? 'bg-white/4 border-white/8 hover:border-white/15 hover:bg-white/6 text-gray-300'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
              } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <input
                id={optId}
                name={name}
                type="radio"
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                disabled={disabled}
                className="sr-only"
              />

              {/* Radio Indicator Circle */}
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  isSelected
                    ? 'border-violet-500 bg-violet-600'
                    : isDark
                    ? 'border-white/20 group-hover:border-white/40'
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>

              {/* Option Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5 mb-0.5">
                  <div className="flex items-center gap-1.5">
                    {Icon && (
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isSelected
                            ? isDark
                              ? 'text-violet-400'
                              : 'text-violet-600'
                            : isDark
                            ? 'text-gray-400'
                            : 'text-gray-500'
                        }`}
                      />
                    )}
                    <span
                      className={`text-sm font-bold ${
                        isSelected
                          ? isDark
                            ? 'text-white'
                            : 'text-gray-900'
                          : isDark
                          ? 'text-gray-300'
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </span>
                  </div>

                  {option.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                        option.badgeStyle ||
                        (isDark
                          ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                          : 'bg-violet-50 text-violet-700 border-violet-200')
                      }`}
                    >
                      {option.badge}
                    </span>
                  )}
                </div>

                {option.description && (
                  <p
                    className={`text-xs leading-normal ${
                      isSelected
                        ? isDark
                          ? 'text-gray-300'
                          : 'text-gray-600'
                        : isDark
                        ? 'text-gray-500'
                        : 'text-gray-400'
                    }`}
                  >
                    {option.description}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      <FormError error={error} id={errorId} />
    </div>
  );
}

export default RadioGroup;
