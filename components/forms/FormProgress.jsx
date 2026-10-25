'use client';
import React from 'react';
import { Check } from 'lucide-react';
import { useStockStore } from '@/store/stockStore';

/**
 * FormProgress — Stepper and completion indicator for multi-step or complex forms
 */
export function FormProgress({
  currentStep = 1,
  totalSteps = 1,
  steps = [],
  onStepClick,
  percent,
  mode = 'steps', // 'steps' | 'percent' | 'both'
  className = '',
}) {
  const { theme } = useStockStore();
  const isDark = theme === 'dark';

  const calculatedPercent =
    typeof percent === 'number'
      ? Math.min(Math.max(percent, 0), 100)
      : Math.round(((currentStep - 1) / Math.max(totalSteps - 1, 1)) * 100);

  return (
    <div className={`space-y-3 w-full ${className}`}>
      {/* Percentage Bar Mode or Header */}
      {(mode === 'percent' || mode === 'both') && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Form Progress
            </span>
            <span className="font-extrabold text-violet-400">{calculatedPercent}%</span>
          </div>

          <div
            className={`w-full h-2 rounded-full overflow-hidden ${
              isDark ? 'bg-white/10' : 'bg-gray-200'
            }`}
          >
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${calculatedPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Multi-Step Indicator */}
      {(mode === 'steps' || mode === 'both') && steps.length > 0 && (
        <nav aria-label="Form Steps Progress" className="w-full">
          <ol className="flex items-center justify-between gap-2">
            {steps.map((step, idx) => {
              const stepNum = idx + 1;
              const isCompleted = stepNum < currentStep;
              const isCurrent = stepNum === currentStep;
              const stepLabel = typeof step === 'object' ? step.label : step;

              return (
                <li
                  key={stepNum}
                  className="flex-1 flex flex-col items-center relative group"
                >
                  {/* Step Connector Line (before) */}
                  {idx > 0 && (
                    <div
                      className={`absolute top-4 -left-1/2 w-full h-0.5 -z-0 transition-colors ${
                        stepNum <= currentStep
                          ? 'bg-violet-600'
                          : isDark
                          ? 'bg-white/10'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => onStepClick && onStepClick(stepNum)}
                    disabled={!onStepClick || (!isCompleted && !isCurrent)}
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : isCurrent
                        ? 'bg-violet-600 text-white ring-4 ring-violet-500/20 shadow-lg shadow-violet-600/30'
                        : isDark
                        ? 'bg-white/5 border border-white/10 text-gray-500'
                        : 'bg-gray-100 border border-gray-300 text-gray-400'
                    } ${
                      onStepClick && (isCompleted || isCurrent)
                        ? 'cursor-pointer hover:scale-105'
                        : 'cursor-default'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : stepNum}
                  </button>

                  <span
                    className={`text-[11px] font-semibold mt-2 text-center truncate max-w-[120px] transition-colors ${
                      isCurrent
                        ? isDark
                          ? 'text-white'
                          : 'text-gray-900'
                        : isCompleted
                        ? isDark
                          ? 'text-gray-300'
                          : 'text-gray-600'
                        : isDark
                        ? 'text-gray-500'
                        : 'text-gray-400'
                    }`}
                  >
                    {stepLabel}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>
      )}
    </div>
  );
}

export default FormProgress;
