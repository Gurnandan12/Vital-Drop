'use client';
import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * FormError — Accessible, reusable error message for forms and inputs
 */
export function FormError({ error, id, className = '' }) {
  if (!error) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={`flex items-center gap-1.5 text-xs font-semibold text-rose-400 mt-1.5 animate-in fade-in slide-in-from-top-1 duration-150 ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" aria-hidden="true" />
      <span>{error}</span>
    </div>
  );
}

export default FormError;
