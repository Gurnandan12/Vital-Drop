/**
 * lib/riskCalculations.js — Financial Math & Scenario Utilities for What-If Risk Sandbox
 *
 * Mathematical Assumptions:
 * 1. Contribution Timing: Monthly contributions are modeled as an annuity due
 *    (occurring at the beginning of each monthly interval, earning compound interest for that month).
 * 2. Compounding Frequency: Compounded monthly (r_monthly = annual_return / 12 / 100).
 * 3. Future Value Formula:
 *    FV_total = FV_initial + FV_monthly
 *    FV_initial = P0 * (1 + r)^n
 *    FV_monthly = PMT * [((1 + r)^n - 1) / r] * (1 + r)   (for r > 0)
 *    FV_monthly = PMT * n                                   (for r = 0)
 *    where n = years * 12
 * 4. Multi-Scenario Modeling:
 *    - Conservative: Lower return assumption, higher debt/fixed-income, lower volatility.
 *    - Moderate: Balanced equity/debt, market-average growth assumption.
 *    - Aggressive: High equity concentration, higher illustrative return, elevated drawdown potential.
 *
 * Note: All figures are illustrative mathematical projections. Real market returns fluctuate,
 * can be negative, and are subject to inflation, taxes, and fees.
 */

export const RISK_PROFILES = {
  conservative: {
    id: 'conservative',
    name: 'Conservative',
    tagline: 'Capital Preservation & Steady Income',
    defaultReturn: 7.5, // 7.5% p.a.
    volatilityLabel: 'Low (4% - 6% historical std dev)',
    suggestedHorizon: '1 to 5 Years',
    color: '#10b981', // Emerald
    accentBg: 'bg-emerald-500/15',
    accentBorder: 'border-emerald-500/30',
    accentText: 'text-emerald-400',
    defaultAllocation: {
      equity: 20,
      debt: 60,
      gold: 10,
      cash: 10,
    },
    description:
      'Prioritizes stability and downside buffer by overweighting government debt and liquid instruments, with modest equity exposure to counteract inflation.',
    risks: [
      'Purchasing power erosion if inflation exceeds fixed-income yields',
      'Lower long-term capital appreciation compared to diversified equities',
      'Interest rate risk on longer-duration bond holdings',
    ],
  },
  moderate: {
    id: 'moderate',
    name: 'Moderate',
    tagline: 'Balanced Growth & Controlled Volatility',
    defaultReturn: 11.5, // 11.5% p.a.
    volatilityLabel: 'Moderate (10% - 14% historical std dev)',
    suggestedHorizon: '5 to 10 Years',
    color: '#8b5cf6', // Violet
    accentBg: 'bg-violet-500/15',
    accentBorder: 'border-violet-500/30',
    accentText: 'text-violet-400',
    defaultAllocation: {
      equity: 60,
      debt: 25,
      gold: 10,
      cash: 5,
    },
    description:
      'A classic balanced allocation seeking healthy capital expansion via Indian equities while dampening intermittent drawdowns with debt and gold.',
    risks: [
      'Subject to intermediate market corrections (10% to 20% temporary drawdowns)',
      'Requires multi-year holding period to allow equity compounding to smooth volatility',
      'Cyclical performance divergences between asset classes',
    ],
  },
  aggressive: {
    id: 'aggressive',
    name: 'Aggressive',
    tagline: 'Maximum Wealth Accumulation & Long-Term Growth',
    defaultReturn: 14.5, // 14.5% p.a.
    volatilityLabel: 'High (16% - 22% historical std dev)',
    suggestedHorizon: '10+ Years',
    color: '#f59e0b', // Amber
    accentBg: 'bg-amber-500/15',
    accentBorder: 'border-amber-500/30',
    accentText: 'text-amber-400',
    defaultAllocation: {
      equity: 85,
      debt: 5,
      gold: 5,
      cash: 5,
    },
    description:
      'Maximizes exposure to high-growth Indian blue chips and emerging sectoral leaders, accepting steep short-term swings for superior multi-decade compound gains.',
    risks: [
      'Severe bear market drawdowns (30% to 50%+ during market shocks)',
      'Sequence of returns risk if capital is liquidated prematurely during a crash',
      'High psychological discipline required during prolonged market downturns',
    ],
  },
};

export const PRESET_SCENARIOS = [
  {
    id: 'starter',
    title: 'SIP Starter',
    description: 'Beginner investor building financial discipline with manageable monthly steps.',
    initialAmount: 25000,
    monthlyContribution: 5000,
    years: 5,
    annualReturn: 11.0,
    riskProfile: 'moderate',
  },
  {
    id: 'wealth_builder',
    title: 'Wealth Builder',
    description: 'Long-term equity compounding aimed at major life milestones.',
    initialAmount: 100000,
    monthlyContribution: 15000,
    years: 15,
    annualReturn: 12.5,
    riskProfile: 'moderate',
  },
  {
    id: 'retirement_goal',
    title: 'Retirement Freedom',
    description: 'Aggressive multi-decade portfolio building exponential compound wealth.',
    initialAmount: 300000,
    monthlyContribution: 30000,
    years: 25,
    annualReturn: 13.5,
    riskProfile: 'aggressive',
  },
  {
    id: 'capital_preservation',
    title: 'Capital Shield',
    description: 'Short-to-medium horizon focused on stability and liquidity protection.',
    initialAmount: 500000,
    monthlyContribution: 10000,
    years: 4,
    annualReturn: 7.5,
    riskProfile: 'conservative',
  },
];

/**
 * Format currency in Indian Numbering System (Cr / L / K / plain ₹)
 */
export function formatINR(val, { compact = false } = {}) {
  const num = typeof val === 'number' && Number.isFinite(val) ? val : parseFloat(val);
  if (isNaN(num)) return '₹0';

  const isNeg = num < 0;
  const abs = Math.abs(num);

  if (compact) {
    if (abs >= 10000000) {
      return `${isNeg ? '-' : ''}₹${(abs / 10000000).toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      return `${isNeg ? '-' : ''}₹${(abs / 100000).toFixed(2)} L`;
    }
    if (abs >= 1000) {
      return `${isNeg ? '-' : ''}₹${(abs / 1000).toFixed(1)} K`;
    }
    return `${isNeg ? '-' : ''}₹${Math.round(abs).toLocaleString('en-IN')}`;
  }

  return `${isNeg ? '-' : ''}₹${Math.round(abs).toLocaleString('en-IN')}`;
}

/**
 * Safe numeric clamp helper
 */
export function clamp(value, min, max, fallback = min) {
  const parsed = parseFloat(value);
  if (isNaN(parsed) || !Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

/**
 * Core Compound Interest & Growth Calculator
 */
export function calculateFutureValue({
  initialAmount = 0,
  monthlyContribution = 0,
  years = 1,
  annualReturn = 10,
}) {
  const safeInitial = Math.max(0, parseFloat(initialAmount) || 0);
  const safeMonthly = Math.max(0, parseFloat(monthlyContribution) || 0);
  const safeYears = Math.max(1, Math.min(50, parseFloat(years) || 1));
  const safeReturn = Math.max(0, Math.min(100, parseFloat(annualReturn) || 0));

  const totalMonths = safeYears * 12;
  const monthlyRate = safeReturn / 12 / 100;

  // FV of lump sum
  const fvInitial = safeInitial * Math.pow(1 + monthlyRate, totalMonths);

  // FV of monthly contributions (annuity due)
  let fvMonthly = 0;
  if (monthlyRate === 0) {
    fvMonthly = safeMonthly * totalMonths;
  } else {
    fvMonthly =
      safeMonthly *
      (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
  }

  const finalValue = Math.round(fvInitial + fvMonthly);
  const totalInvested = Math.round(safeInitial + safeMonthly * totalMonths);
  const growthAmount = Math.max(0, finalValue - totalInvested);
  const growthPercent = totalInvested > 0 ? (growthAmount / totalInvested) * 100 : 0;

  return {
    initialAmount: safeInitial,
    monthlyContribution: safeMonthly,
    years: safeYears,
    annualReturn: safeReturn,
    totalInvested,
    finalValue,
    growthAmount,
    growthPercent,
  };
}

/**
 * Generate year-by-year trajectory for primary inputs and alternative scenarios
 */
export function generateTrajectorySeries({
  initialAmount,
  monthlyContribution,
  years,
  annualReturn,
  customProfileId = 'moderate',
}) {
  const safeYears = Math.max(1, Math.min(50, parseFloat(years) || 1));
  const data = [];

  // Comparison return rates
  const conservativeReturn = Math.max(3, RISK_PROFILES.conservative.defaultReturn);
  const moderateReturn = Math.max(5, RISK_PROFILES.moderate.defaultReturn);
  const aggressiveReturn = Math.max(8, RISK_PROFILES.aggressive.defaultReturn);

  // Initial milestone (Year 0)
  data.push({
    year: 0,
    label: 'Start',
    invested: Math.round(initialAmount),
    projected: Math.round(initialAmount),
    growth: 0,
    conservative: Math.round(initialAmount),
    moderate: Math.round(initialAmount),
    aggressive: Math.round(initialAmount),
  });

  for (let y = 1; y <= safeYears; y++) {
    const baseline = calculateFutureValue({
      initialAmount,
      monthlyContribution,
      years: y,
      annualReturn,
    });

    const cons = calculateFutureValue({
      initialAmount,
      monthlyContribution,
      years: y,
      annualReturn: conservativeReturn,
    });

    const mod = calculateFutureValue({
      initialAmount,
      monthlyContribution,
      years: y,
      annualReturn: moderateReturn,
    });

    const agg = calculateFutureValue({
      initialAmount,
      monthlyContribution,
      years: y,
      annualReturn: aggressiveReturn,
    });

    data.push({
      year: y,
      label: `Yr ${y}`,
      invested: baseline.totalInvested,
      projected: baseline.finalValue,
      growth: baseline.growthAmount,
      conservative: cons.finalValue,
      moderate: mod.finalValue,
      aggressive: agg.finalValue,
    });
  }

  return data;
}

/**
 * Compute scenario comparisons for summary cards
 */
export function calculateScenarioComparisons({
  initialAmount,
  monthlyContribution,
  years,
}) {
  const conservative = calculateFutureValue({
    initialAmount,
    monthlyContribution,
    years,
    annualReturn: RISK_PROFILES.conservative.defaultReturn,
  });

  const moderate = calculateFutureValue({
    initialAmount,
    monthlyContribution,
    years,
    annualReturn: RISK_PROFILES.moderate.defaultReturn,
  });

  const aggressive = calculateFutureValue({
    initialAmount,
    monthlyContribution,
    years,
    annualReturn: RISK_PROFILES.aggressive.defaultReturn,
  });

  return {
    conservative: {
      ...conservative,
      profile: RISK_PROFILES.conservative,
    },
    moderate: {
      ...moderate,
      profile: RISK_PROFILES.moderate,
    },
    aggressive: {
      ...aggressive,
      profile: RISK_PROFILES.aggressive,
    },
  };
}
