'use client';
import React from 'react';

/**
 * Reusable Badge component
 * Demonstrates: Reusable UI, Props, List/tag styling, Conditional rendering
 */
export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
  ...restProps
}) {
  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded',
    sm: 'text-xs px-2.5 py-1 rounded-md font-semibold',
    md: 'text-sm px-3 py-1 rounded-lg font-semibold',
  }[size] || 'text-xs px-2 py-0.5 rounded font-medium';

  const variantStyles = {
    default: 'bg-white/10 text-gray-300 border border-white/10',
    primary: 'bg-violet-500/15 text-violet-300 border border-violet-500/25',
    nse: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
    bse: 'bg-orange-500/15 text-orange-400 border border-orange-500/25',
    index: 'bg-purple-500/15 text-purple-400 border border-purple-500/25',
    buy: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    sell: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    danger: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/25',
    info: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25',
    largeCap: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25',
    midCap: 'bg-sky-500/15 text-sky-300 border border-sky-500/25',
    smallCap: 'bg-teal-500/15 text-teal-300 border border-teal-500/25',
  }[variant] || 'bg-white/10 text-gray-300 border border-white/10';

  return (
    <span
      className={`inline-flex items-center gap-1 leading-none tracking-wide ${sizeStyles} ${variantStyles} ${className}`}
      {...restProps}
    >
      {children}
    </span>
  );
}

export default Badge;
