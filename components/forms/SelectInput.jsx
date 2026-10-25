'use client';
import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useStockStore } from '@/store/stockStore';

/**
 * SelectInput — Controlled accessible select dropdown
 */
export const SelectInput = forwardRef(function SelectInput(
  {
    id,
    name,
    value = '',
    onChange,
    onBlur,
    options = [],
    placeholder = 'Select an option…',
    error,
    disabled = false,
    className = '',
    required = false,
    ...rest
  },
  ref
) {
  const { theme } = useStockStore();
  const isDark = theme === 'dark';
  const hasError = Boolean(error);
  const errorId = id && hasError ? `${id}-error` : undefined;

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <select
        ref={ref}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={errorId}
        className={`w-full rounded-xl border text-sm font-semibold transition-all appearance-none outline-none pl-4 pr-10 py-2.5 cursor-pointer ${
          hasError
            ? isDark
              ? 'bg-rose-500/10 border-rose-500/50 text-white focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
              : 'bg-rose-50 border-rose-400 text-gray-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
            : isDark
            ? 'bg-[#101024] border-white/10 text-white hover:border-white/20 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25'
            : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled className={isDark ? 'bg-[#0f0f22] text-gray-400' : 'bg-white text-gray-400'}>
            {placeholder}
          </option>
        )}

        {options.map((opt) => {
          const optValue = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;

          return (
            <option
              key={optValue}
              value={optValue}
              className={isDark ? 'bg-[#121226] text-white py-1' : 'bg-white text-gray-900 py-1'}
            >
              {optLabel}
            </option>
          );
        })}
      </select>

      {/* Dropdown Chevron Arrow */}
      <div className="absolute right-3.5 pointer-events-none text-gray-400">
        <ChevronDown className="w-4 h-4" aria-hidden="true" />
      </div>
    </div>
  );
});

export default SelectInput;
