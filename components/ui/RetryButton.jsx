'use client';
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * RetryButton — Accessible retry trigger with spinner and rate-limit spam protection
 */
export function RetryButton({
  onClick,
  isLoading = false,
  label = 'Retry',
  size = 'sm',
  variant = 'outline',
  cooldownSeconds = 0,
  className = '',
  isDark = true,
}) {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleClick = (e) => {
    e.preventDefault();
    if (isLoading || cooldown > 0 || !onClick) return;
    if (cooldownSeconds > 0) {
      setCooldown(cooldownSeconds);
    }
    onClick();
  };

  const isDisabled = isLoading || cooldown > 0;

  const sizeClasses =
    size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';

  const variantClasses =
    variant === 'primary'
      ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/25 border-transparent'
      : isDark
      ? 'border-white/10 hover:border-violet-500/40 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10'
      : 'border-gray-200 hover:border-violet-300 text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={cooldown > 0 ? `Please wait ${cooldown}s before retrying` : label}
      aria-busy={isLoading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
    >
      <RefreshCw
        className={`w-3.5 h-3.5 transition-transform ${
          isLoading ? 'animate-spin text-violet-400' : ''
        }`}
      />
      <span>
        {isLoading ? 'Retrying…' : cooldown > 0 ? `Wait ${cooldown}s` : label}
      </span>
    </button>
  );
}

export default RetryButton;
