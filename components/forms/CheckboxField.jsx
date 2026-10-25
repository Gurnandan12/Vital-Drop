'use client';
import React from 'react';
import { Check } from 'lucide-react';
import { useStockStore } from '@/store/stockStore';
import { FormError } from './FormError';

/**
 * CheckboxField — Accessible custom checkbox with label and optional description
 */
export function CheckboxField({
  id,
  name,
  checked = false,
  onChange,
  label,
  description,
  error,
  disabled = false,
  className = '',
}) {
  const { theme } = useStockStore();
  const isDark = theme === 'dark';
  const hasError = Boolean(error);
  const errorId = id && hasError ? `${id}-error` : undefined;

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={id}
        className={`flex items-start gap-3 cursor-pointer select-none group ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={id}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={errorId}
            className="sr-only peer"
          />

          <div
            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
              checked
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500 shadow-md shadow-violet-500/25 text-white'
                : hasError
                ? isDark
                  ? 'bg-rose-500/10 border-rose-500/50'
                  : 'bg-rose-50 border-rose-400'
                : isDark
                ? 'bg-white/5 border-white/15 group-hover:border-white/30'
                : 'bg-white border-gray-300 group-hover:border-gray-400'
            } peer-focus-visible:ring-2 peer-focus-visible:ring-violet-500/50`}
          >
            {checked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
          </div>
        </div>

        <div className="flex-1">
          {label && (
            <span
              className={`text-sm font-semibold block leading-tight ${
                isDark ? 'text-gray-200' : 'text-gray-900'
              }`}
            >
              {label}
            </span>
          )}

          {description && (
            <p className={`text-xs mt-0.5 leading-normal ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {description}
            </p>
          )}
        </div>
      </label>

      <FormError error={error} id={errorId} />
    </div>
  );
}

export default CheckboxField;
