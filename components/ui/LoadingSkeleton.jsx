'use client';
import React from 'react';

/**
 * LoadingSkeleton — Accessible, customizable skeleton shimmer placeholder
 *
 * Props:
 * - variant: 'text' | 'rect' | 'circle' | 'card' | 'tableRow'
 * - width: CSS width string or number (e.g. '100%', 120, '4rem')
 * - height: CSS height string or number (e.g. '1.5rem', 40, '100%')
 * - count: Number of repeated lines
 * - isDark: boolean theme flag
 * - className: additional Tailwind CSS classes
 */
export function LoadingSkeleton({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
  isDark = true,
  'aria-label': ariaLabel = 'Loading content...',
}) {
  const baseBg = isDark
    ? 'bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04]'
    : 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200';

  const getVariantStyles = () => {
    switch (variant) {
      case 'circle':
        return 'rounded-full aspect-square';
      case 'rect':
        return 'rounded-xl';
      case 'card':
        return 'rounded-2xl h-36 w-full';
      case 'tableRow':
        return 'rounded-lg h-10 w-full';
      case 'text':
      default:
        return 'rounded-md h-4 w-full';
    }
  };

  const inlineStyles = {
    ...(width ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  };

  const renderSingle = (key) => (
    <div
      key={key}
      role="status"
      aria-busy="true"
      aria-label={ariaLabel}
      style={inlineStyles}
      className={`animate-pulse bg-[length:200%_100%] transition-opacity duration-200 ${baseBg} ${getVariantStyles()} ${className}`}
    >
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );

  if (count > 1) {
    return (
      <div className="space-y-2.5 w-full" aria-busy="true" role="status">
        {Array.from({ length: count }, (_, i) => renderSingle(i))}
      </div>
    );
  }

  return renderSingle(0);
}

export default LoadingSkeleton;
