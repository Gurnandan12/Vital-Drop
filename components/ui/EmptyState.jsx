'use client';
import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

/**
 * Reusable EmptyState component
 * Demonstrates: Reusable UI, Conditional rendering, Props, Composition
 */
export function EmptyState({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'There are no items matching your criteria at this moment.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  secondaryActionTo,
  onSecondaryAction,
  className = '',
  isDark = true,
}) {
  return (
    <div
      className={`rounded-2xl border flex flex-col items-center justify-center p-8 sm:p-12 text-center transition-all ${
        isDark ? 'bg-white/[0.02] border-white/8 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
      } ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4 text-violet-400">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold tracking-tight mb-1">{title}</h3>
      <p className={`text-sm max-w-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {description}
      </p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {actionLabel && onAction && (
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && (
          secondaryActionTo ? (
            <a
              href={secondaryActionTo}
              className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                isDark
                  ? 'border-white/10 hover:bg-white/5 text-gray-300 hover:text-white'
                  : 'border-gray-200 hover:bg-gray-100 text-gray-700'
              }`}
            >
              {secondaryActionLabel}
            </a>
          ) : onSecondaryAction ? (
            <Button variant="outline" size="md" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          ) : null
        )}
      </div>
    </div>
  );
}

export default EmptyState;
