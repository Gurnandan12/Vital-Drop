'use client';
import React from 'react';

/**
 * Reusable Card component demonstrating Component Composition
 */
export function Card({ children, className = '', isDark = true, ...props }) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        isDark
          ? 'bg-[#0d0d1a] border-white/8 text-white'
          : 'bg-white border-gray-200 text-gray-900 shadow-sm'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-5 pb-3 flex flex-col gap-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`text-lg font-bold tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-xs text-gray-400 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-5 pt-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`p-5 pt-0 flex items-center justify-between gap-4 border-t border-white/5 mt-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
