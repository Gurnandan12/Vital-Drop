'use client';
import React from 'react';
import {
  WifiOff,
  AlertTriangle,
  Clock,
  SearchX,
  ServerCrash,
  ShieldAlert,
} from 'lucide-react';
import { RetryButton } from './RetryButton';

/**
 * ErrorState — Graceful error display with tailored guidance and accessible retry action
 *
 * Catches and categorizes:
 * - Network failures (offline / connection lost)
 * - Rate limiting (HTTP 429)
 * - 404 / Missing asset data
 * - Server errors (HTTP 500)
 */
export function ErrorState({
  title,
  message,
  errorType = 'GENERIC',
  onRetry,
  retryLabel = 'Try Again',
  isRetrying = false,
  compact = false,
  className = '',
  isDark = true,
}) {
  const getErrorConfig = () => {
    switch (errorType) {
      case 'NETWORK':
        return {
          icon: WifiOff,
          iconColor: 'text-amber-400',
          iconBg: isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200',
          defaultTitle: 'Network Connection Lost',
          defaultMessage:
            'Unable to communicate with the market data server. Please check your internet connection.',
        };
      case 'RATE_LIMIT':
        return {
          icon: Clock,
          iconColor: 'text-orange-400',
          iconBg: isDark ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50 border-orange-200',
          defaultTitle: 'Market Data Rate Limit Reached',
          defaultMessage:
            'The data provider is experiencing high traffic. Please wait a moment before refreshing.',
        };
      case 'NOT_FOUND':
        return {
          icon: SearchX,
          iconColor: 'text-rose-400',
          iconBg: isDark ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-200',
          defaultTitle: 'Data Not Found',
          defaultMessage:
            'Market quote or historical chart points are unavailable for this symbol.',
        };
      case 'SERVER':
        return {
          icon: ServerCrash,
          iconColor: 'text-rose-400',
          iconBg: isDark ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-200',
          defaultTitle: 'Market Service Error',
          defaultMessage:
            'The upstream market exchange service returned a temporary error.',
        };
      case 'GENERIC':
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-400',
          iconBg: isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200',
          defaultTitle: 'Unable to Load Data',
          defaultMessage:
            'An unexpected error occurred while fetching the requested market data.',
        };
    }
  };

  const config = getErrorConfig();
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;
  const Icon = config.icon;

  if (compact) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
          isDark
            ? 'bg-rose-950/20 border-rose-500/20 text-rose-300'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        } ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="truncate">{displayMessage}</span>
        </div>
        {onRetry && (
          <RetryButton
            onClick={onRetry}
            isLoading={isRetrying}
            label={retryLabel}
            size="sm"
            isDark={isDark}
            className="shrink-0"
          />
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`rounded-2xl border flex flex-col items-center justify-center p-6 sm:p-8 text-center transition-all ${
        isDark ? 'bg-[#0d0d1a] border-white/8 text-white' : 'bg-white border-gray-200 text-gray-900 shadow-sm'
      } ${className}`}
    >
      <div
        className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-3.5 ${config.iconBg}`}
      >
        <Icon className={`w-6 h-6 ${config.iconColor}`} />
      </div>

      <h3 className="text-base font-bold tracking-tight mb-1">{displayTitle}</h3>
      <p
        className={`text-xs max-w-sm mb-4 leading-relaxed ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}
      >
        {displayMessage}
      </p>

      {onRetry && (
        <RetryButton
          onClick={onRetry}
          isLoading={isRetrying}
          label={retryLabel}
          variant="primary"
          size="sm"
          cooldownSeconds={errorType === 'RATE_LIMIT' ? 5 : 0}
          isDark={isDark}
        />
      )}
    </div>
  );
}

export default ErrorState;
