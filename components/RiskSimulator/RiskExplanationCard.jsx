'use client';
import React from 'react';
import {
  AlertTriangle,
  Info,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { RISK_PROFILES } from '@/lib/riskCalculations';

export function RiskExplanationCard({ profileId = 'moderate', annualReturn = 11.5, isDark = true }) {
  const profile = RISK_PROFILES[profileId] || RISK_PROFILES.moderate;

  return (
    <div className="space-y-6">
      {/* ── Active Profile Detail Box ── */}
      <div
        className={`p-6 rounded-3xl border transition-all ${
          isDark ? 'bg-white/3 border-white/8' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${profile.accentBg} ${profile.accentBorder} ${profile.accentText}`}
              >
                {profile.name} Profile
              </span>
              <span className="text-xs text-gray-400 font-semibold">• {profile.tagline}</span>
            </div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Risk &amp; Return Behavior Calibration
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="text-right">
              <p className="text-gray-400 text-[11px]">Volatility Profile</p>
              <p className="font-bold text-gray-200">{profile.volatilityLabel}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-right">
              <p className="text-gray-400 text-[11px]">Suggested Horizon</p>
              <p className="font-bold text-violet-400">{profile.suggestedHorizon}</p>
            </div>
          </div>
        </div>

        <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {profile.description}
        </p>

        {/* Inherent Trade-offs & Risks */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-violet-400" />
            <span>Key Risk Factors for this Strategy</span>
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {profile.risks.map((risk, idx) => (
              <li
                key={idx}
                className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                  isDark ? 'bg-black/20 border-white/5 text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 mt-1.5" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Key Mathematical Assumptions & Uncertainty Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Core Calculation Assumptions */}
        <div
          className={`p-5 rounded-3xl border ${
            isDark ? 'bg-white/3 border-white/8' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Calculation Assumptions
            </h4>
          </div>

          <ul className="space-y-2 text-xs text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>
                <strong className="text-gray-200">Compounding Frequency:</strong> Compounded
                monthly with an effective periodic rate of <em>(annual return ÷ 12)</em>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>
                <strong className="text-gray-200">Contribution Timing:</strong> Modeled as an
                annuity due, assuming deposits happen at the start of each month to begin compounding immediately.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>
                <strong className="text-gray-200">Reinvestment:</strong> Assumes all dividends,
                interest coupons, and capital gains are 100% reinvested without leakage.
              </span>
            </li>
          </ul>
        </div>

        {/* Real-World Uncertainties */}
        <div
          className={`p-5 rounded-3xl border ${
            isDark ? 'bg-white/3 border-white/8' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Sources of Uncertainty
            </h4>
          </div>

          <ul className="space-y-2 text-xs text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>
                <strong className="text-gray-200">Sequence of Returns:</strong> Real markets do not
                yield a steady {annualReturn}% every single year. Severe early downturns reduce terminal wealth.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>
                <strong className="text-gray-200">Inflation Drag:</strong> Long-term inflation
                (historically 5% to 7% in India) will reduce the real purchasing power of future rupees.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>
                <strong className="text-gray-200">Taxes &amp; Fees:</strong> Projections exclude
                LTCG/STCG taxes, exit loads, expense ratios, and trading brokerage.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Mandatory Educational Disclaimer Banner ── */}
      <div
        className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
          isDark
            ? 'bg-amber-500/10 border-amber-500/25 text-amber-200'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
      >
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold">Educational Simulation Disclaimer</p>
          <p className="text-[11px] leading-relaxed opacity-90">
            All projected figures, growth curves, and outcomes displayed in this What-If Risk Sandbox
            are purely illustrative mathematical models based on fixed rate assumptions. They do not
            constitute financial advice, performance forecasts, or return guarantees. Real market
            investments in Indian equities and fixed-income are subject to market risks, including
            the potential loss of principal.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RiskExplanationCard;
