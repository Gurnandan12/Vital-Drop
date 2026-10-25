'use client';
import React, { forwardRef } from 'react';
import { useStockStore } from '@/store/stockStore';

/**
 * TextInput — Controlled accessible text input with icon/prefix/suffix support
 */
export const TextInput = forwardRef(function TextInput(
  {
    id,
    name,
    type = 'text',
    value = '',
    onChange,
    onBlur,
    placeholder,
    error,
    disabled = false,
    prefixIcon: PrefixIcon,
    prefixText,
    suffixText,
    suffixIcon: SuffixIcon,
    className = '',
    required = false,
    autoComplete,
    ...rest
  },
  ref
) {
  const { theme } = useStockStore();
  const isDark = theme === 'dark';
  const hasError = Boolean(error);

  const errorId = id && hasError ? `${id}-error` : undefined;

  return (
    <div className="relative flex items-center w-full">
      {/* Prefix Icon */}
      {PrefixIcon && (
        <div className="absolute left-3.5 pointer-events-none text-gray-400">
          <PrefixIcon className="w-4 h-4" aria-hidden="true" />
        </div>
      )}

      {/* Prefix Text (e.g. currency symbol or @) */}
      {prefixText && !PrefixIcon && (
        <span
          className={`absolute left-3.5 pointer-events-none text-sm font-semibold select-none ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          {prefixText}
        </span>
      )}

      <input
        ref={ref}
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={errorId}
        className={`w-full rounded-xl border text-sm font-medium transition-all outline-none ${
          PrefixIcon ? 'pl-10' : prefixText ? 'pl-8' : 'pl-4'
        } ${
          SuffixIcon ? 'pr-10' : suffixText ? 'pr-10' : 'pr-4'
        } py-2.5 ${
          hasError
            ? isDark
              ? 'bg-rose-500/10 border-rose-500/50 text-white focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
              : 'bg-rose-50 border-rose-400 text-gray-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
            : isDark
            ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 hover:border-white/20 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25'
            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 hover:border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        {...rest}
      />

      {/* Suffix Text or Icon */}
      {suffixText && !SuffixIcon && (
        <span
          className={`absolute right-3.5 pointer-events-none text-xs font-semibold select-none ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}
        >
          {suffixText}
        </span>
      )}

      {SuffixIcon && (
        <div className="absolute right-3.5 pointer-events-none text-gray-400">
          <SuffixIcon className="w-4 h-4" aria-hidden="true" />
        </div>
      )}
    </div>
  );
});

export default TextInput;
