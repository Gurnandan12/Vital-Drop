'use client';
import React from 'react';

/**
 * Reusable Button component
 * Demonstrates: Reusable UI, Props, Component Composition, Accessibility basics
 *
 * @param {'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success'} variant
 * @param {'sm' | 'md' | 'lg'} size
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  type = 'button',
  onClick,
  ...restProps
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  }[size] || 'px-4 py-2.5 text-sm gap-2';

  const variantStyles = {
    primary:
      'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 focus:ring-violet-500 border border-violet-500/50',
    secondary:
      'bg-white/10 hover:bg-white/15 text-white border border-white/10 focus:ring-white/20',
    danger:
      'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 focus:ring-rose-500',
    success:
      'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 focus:ring-emerald-500',
    outline:
      'bg-transparent hover:bg-white/5 text-gray-300 border border-white/15 focus:ring-violet-500',
    ghost:
      'bg-transparent hover:bg-white/5 text-gray-400 hover:text-white focus:ring-white/20',
  }[variant] || 'bg-violet-600 hover:bg-violet-500 text-white';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...restProps}
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
