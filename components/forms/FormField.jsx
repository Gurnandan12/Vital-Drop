'use client';
import React from 'react';
import { useStockStore } from '@/store/stockStore';
import { FormError } from './FormError';

/**
 * FormField — Reusable wrapper for form inputs
 * Handles label, required indicator, helper text, and accessible error message
 */
export function FormField({
  label,
  id,
  required = false,
  error = null,
  hint = null,
  children,
  className = '',
  labelAction = null,
}) {
  const { theme } = useStockStore();
  const isDark = theme === 'dark';

  const errorId = id ? `${id}-error` : undefined;
  const hintId = id && hint ? `${id}-hint` : undefined;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={id}
            className={`block text-xs font-bold tracking-wide uppercase ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {label}
            {required && <span className="text-rose-400 ml-1 font-bold" aria-hidden="true">*</span>}
          </label>
          {labelAction && <div className="text-xs">{labelAction}</div>}
        </div>
      )}

      {/* Input container */}
      <div>{children}</div>

      {/* Helper / Hint Text */}
      {hint && !error && (
        <p
          id={hintId}
          className={`text-[11px] leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        >
          {hint}
        </p>
      )}

      {/* Error Message */}
      <FormError error={error} id={errorId} />
    </div>
  );
}

export default FormField;
