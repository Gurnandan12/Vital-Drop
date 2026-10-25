'use client';
import React, { useState } from 'react';
import {
  User,
  Sliders,
  Target,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Save,
  RotateCcw,
  Sparkles,
  Briefcase,
  TrendingUp,
  Award,
  Wallet,
  Calendar,
  Layers,
  PieChart,
} from 'lucide-react';
import { useStockStore } from '@/store/stockStore';
import { useAuthStore } from '@/store/authStore';
import {
  FormField,
  TextInput,
  NumberInput,
  SelectInput,
  RadioGroup,
  CheckboxField,
  FormSection,
  FormProgress,
  FormSummary,
  FormError,
} from './';
import { Button } from '../ui/Button';

const STEPS = [
  { label: 'Investment Preferences', description: 'Experience & trading style' },
  { label: 'Financial Goals', description: 'Targets & timeline' },
  { label: 'Risk Preferences', description: 'Appetite & crash tolerance' },
  { label: 'Review & Confirm', description: 'Summary & persona verification' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Beginner', description: 'Less than 1 year. Learning core chart patterns and equity fundamentals.' },
  { value: 'intermediate', label: 'Intermediate', description: '1 to 3 years. Active stock picker with swing or SIP experience.' },
  { value: 'advanced', label: 'Advanced', description: '3+ years. Experienced with technical indicators, multi-cap diversification, or hedging.' },
];

const EXCHANGE_OPTIONS = [
  { value: 'NSE', label: 'National Stock Exchange (NSE)' },
  { value: 'BSE', label: 'Bombay Stock Exchange (BSE)' },
  { value: 'BOTH', label: 'Both NSE & BSE' },
];

const ASSET_OPTIONS = [
  { value: 'equity', label: 'Direct Equities (Large / Mid / Small Cap)' },
  { value: 'mutual_funds', label: 'Mutual Funds & Index ETFs' },
  { value: 'hybrid', label: 'Balanced Hybrid & Multi-Asset Allocations' },
  { value: 'fixed_income', label: 'Bonds & Fixed Income' },
];

const GOAL_OPTIONS = [
  { value: 'wealth_creation', label: 'Long-term Wealth Compounding' },
  { value: 'retirement', label: 'Early Financial Independence / Retirement' },
  { value: 'home', label: 'Real Estate / House Purchase' },
  { value: 'education', label: 'Higher Education / Family Security' },
  { value: 'safety', label: 'Capital Preservation' },
];

const RISK_TIERS = [
  {
    value: 'Low',
    label: 'Conservative',
    description: 'Protect capital above all. Preference for minimal drawdowns (< 10%).',
    badge: 'Low Volatility',
  },
  {
    value: 'Moderate',
    label: 'Balanced',
    description: 'Grow wealth steadily with managed market pullbacks (10% - 20%).',
    badge: 'Core Growth',
  },
  {
    value: 'High',
    label: 'Aggressive',
    description: 'Maximize upside; capable of riding out 30%+ volatility for alpha.',
    badge: 'High Alpha',
  },
];

const DEFAULT_WIZARD_DATA = {
  experience: 'intermediate',
  exchange: 'NSE',
  preferredAsset: 'equity',
  defaultTradeSize: '50000',
  confirmOrders: true,
  primaryGoal: 'wealth_creation',
  targetHorizonYears: '5',
  targetCorpus: '2500000', // ₹25 Lakhs
  monthlySavings: '10000',
  riskTier: 'Moderate',
  drawdownLimit: '20%',
  hasEmergencyFund: true,
  useStopLoss: true,
};

/**
 * ProfileSetupWizard — Reusable Multi-Step Profile Setup & Investor Calibration Wizard
 */
export function ProfileSetupWizard({ onComplete, onCancel }) {
  const { theme } = useStockStore();
  const { investorProfile, setInvestorProfile, user } = useAuthStore();
  const isDark = theme === 'dark';

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(() => investorProfile || DEFAULT_WIZARD_DATA);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Step-level validation
  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!formData.experience) newErrors.experience = 'Please select your experience level.';
      if (!formData.exchange) newErrors.exchange = 'Please choose a primary exchange.';
      if (!formData.preferredAsset) newErrors.preferredAsset = 'Please choose an asset class.';
      const tradeSize = parseFloat(formData.defaultTradeSize);
      if (isNaN(tradeSize) || tradeSize <= 0) {
        newErrors.defaultTradeSize = 'Please enter a valid positive default trade size.';
      }
    } else if (stepNumber === 2) {
      if (!formData.primaryGoal) newErrors.primaryGoal = 'Please select your financial goal.';
      const horizon = parseFloat(formData.targetHorizonYears);
      if (isNaN(horizon) || horizon < 1 || horizon > 40) {
        newErrors.targetHorizonYears = 'Horizon must be between 1 and 40 years.';
      }
      const corpus = parseFloat(formData.targetCorpus);
      if (isNaN(corpus) || corpus <= 0) {
        newErrors.targetCorpus = 'Please enter a valid target portfolio corpus.';
      }
      const savings = parseFloat(formData.monthlySavings);
      if (isNaN(savings) || savings < 0) {
        newErrors.monthlySavings = 'Monthly savings capacity cannot be negative.';
      }
    } else if (stepNumber === 3) {
      if (!formData.riskTier) newErrors.riskTier = 'Please select your risk tier.';
      if (!formData.drawdownLimit) newErrors.drawdownLimit = 'Please pick a drawdown tolerance.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const handleFinalSubmit = () => {
    if (validateStep(1) && validateStep(2) && validateStep(3)) {
      // Calculate Investor Persona
      let persona = 'Balanced Market Compounder';
      if (formData.riskTier === 'High' && formData.experience === 'advanced') {
        persona = 'Alpha Momentum Specialist';
      } else if (formData.riskTier === 'High') {
        persona = 'High-Growth Equities Explorer';
      } else if (formData.riskTier === 'Low') {
        persona = 'Capital Preservation Strategist';
      }

      const completedProfile = {
        ...formData,
        persona,
        updatedAt: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      };

      setInvestorProfile(completedProfile);
      setIsSuccess(true);
      if (onComplete) onComplete(completedProfile);
    }
  };

  if (isSuccess) {
    return (
      <div
        className={`rounded-3xl border p-8 text-center space-y-6 animate-in zoom-in-95 ${
          isDark
            ? 'bg-[#0d0d1e]/90 border-emerald-500/30 shadow-[0_10px_40px_rgba(16,185,129,0.1)]'
            : 'bg-white border-emerald-200 shadow-xl'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Profile Calibrated &amp; Saved
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3">
            Investor Persona Established!
          </h2>
          <p className={`text-sm max-w-md mx-auto mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Your preferences, financial targets, and risk parameters have been synchronized with your simulator account.
          </p>
        </div>

        {/* Persona Highlight Pill */}
        <div
          className={`max-w-md mx-auto p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            isDark ? 'bg-white/[0.02] border-white/8' : 'bg-gray-50 border-gray-100'
          }`}
        >
          <div className="flex items-center gap-3 text-left">
            <Award className="w-6 h-6 text-violet-400 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-500">Calibrated Archetype</span>
              <p className="text-base font-bold text-violet-300">
                {formData.riskTier === 'High'
                  ? 'Alpha Growth Seeker'
                  : formData.riskTier === 'Low'
                  ? 'Capital Preservation Strategist'
                  : 'Balanced Market Compounder'}
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 font-bold border border-violet-500/30">
            {formData.riskTier} Risk
          </span>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => {
              setIsSuccess(false);
              setCurrentStep(1);
            }}
          >
            Edit Profile Again
          </Button>

          {onCancel && (
            <Button type="button" variant="primary" size="md" onClick={onCancel}>
              Done
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl border p-6 sm:p-8 space-y-8 transition-all ${
        isDark
          ? 'bg-[#0d0d1e]/90 border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.5)]'
          : 'bg-white border-gray-200 shadow-xl'
      }`}
    >
      {/* ── Wizard Header & Progress ── */}
      <div className="space-y-6 pb-6 border-b border-white/8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Step Investor Setup</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Investor Profile Wizard
            </h2>
            <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].label}
            </p>
          </div>

          {onCancel && (
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Close Wizard
            </Button>
          )}
        </div>

        {/* FormProgress Stepper */}
        <FormProgress
          currentStep={currentStep}
          totalSteps={STEPS.length}
          steps={STEPS}
          onStepClick={(step) => {
            if (step < currentStep || validateStep(currentStep)) {
              setCurrentStep(step);
            }
          }}
          mode="both"
        />
      </div>

      {/* ── STEP 1: Investment Preferences ── */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
          <FormSection
            title="Trading Experience & Exchange Settings"
            description="Help us tailor charting tools and order sizes to your market familiarity."
            icon={Briefcase}
          >
            {/* Experience Level */}
            <FormField
              id="wiz-experience"
              label="Trading Experience Level"
              required
              error={errors.experience}
              hint="How long have you been actively trading or investing in equities?"
            >
              <RadioGroup
                name="experience"
                value={formData.experience}
                onChange={(val) => handleFieldChange('experience', val)}
                options={EXPERIENCE_OPTIONS}
                layout="stack"
                error={errors.experience}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {/* Primary Exchange */}
              <FormField
                id="wiz-exchange"
                label="Primary Indian Market Exchange"
                required
                error={errors.exchange}
                hint="Default exchange for ticker searches and order routing."
              >
                <SelectInput
                  id="wiz-exchange"
                  name="exchange"
                  value={formData.exchange}
                  onChange={(e) => handleFieldChange('exchange', e.target.value)}
                  options={EXCHANGE_OPTIONS}
                  error={errors.exchange}
                />
              </FormField>

              {/* Preferred Asset Class */}
              <FormField
                id="wiz-asset"
                label="Preferred Asset Class"
                required
                error={errors.preferredAsset}
                hint="Primary security type you intend to analyze and trade."
              >
                <SelectInput
                  id="wiz-asset"
                  name="preferredAsset"
                  value={formData.preferredAsset}
                  onChange={(e) => handleFieldChange('preferredAsset', e.target.value)}
                  options={ASSET_OPTIONS}
                  error={errors.preferredAsset}
                />
              </FormField>
            </div>

            {/* Default Trade Allocation */}
            <FormField
              id="wiz-tradesize"
              label="Default Order Ticket Size (₹)"
              required
              error={errors.defaultTradeSize}
              hint="Pre-fills your trade order quantity when clicking BUY/SELL."
            >
              <NumberInput
                id="wiz-tradesize"
                name="defaultTradeSize"
                value={formData.defaultTradeSize}
                onChange={(val) => handleFieldChange('defaultTradeSize', val)}
                min={1000}
                max={500000}
                step={5000}
                prefix="₹"
                error={errors.defaultTradeSize}
              />
            </FormField>

            <CheckboxField
              id="wiz-confirm"
              name="confirmOrders"
              checked={formData.confirmOrders}
              onChange={(e) => handleFieldChange('confirmOrders', e.target.checked)}
              label="Require Confirmation Prompt Before Executing Orders"
              description="Displays an interactive modal confirming share count and capital before trade settlement."
            />
          </FormSection>
        </div>
      )}

      {/* ── STEP 2: Financial Goals ── */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
          <FormSection
            title="Targets, Timeline & Financial Milestones"
            description="Define what you are investing for and set quantitative milestone targets."
            icon={Target}
          >
            {/* Primary Goal */}
            <FormField
              id="wiz-goal"
              label="Core Financial Objective"
              required
              error={errors.primaryGoal}
              hint="Your guiding North Star milestone."
            >
              <SelectInput
                id="wiz-goal"
                name="primaryGoal"
                value={formData.primaryGoal}
                onChange={(e) => handleFieldChange('primaryGoal', e.target.value)}
                options={GOAL_OPTIONS}
                error={errors.primaryGoal}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {/* Target Horizon */}
              <FormField
                id="wiz-horizon"
                label="Target Time Horizon (Years)"
                required
                error={errors.targetHorizonYears}
                hint="Expected years to achieve this milestone."
              >
                <NumberInput
                  id="wiz-horizon"
                  name="targetHorizonYears"
                  value={formData.targetHorizonYears}
                  onChange={(val) => handleFieldChange('targetHorizonYears', val)}
                  min={1}
                  max={40}
                  step={1}
                  prefix=""
                  suffix="Years"
                  error={errors.targetHorizonYears}
                />
              </FormField>

              {/* Target Corpus */}
              <FormField
                id="wiz-corpus"
                label="Target Portfolio Valuation (₹)"
                required
                error={errors.targetCorpus}
                hint="Desired portfolio wealth at the end of your horizon."
              >
                <NumberInput
                  id="wiz-corpus"
                  name="targetCorpus"
                  value={formData.targetCorpus}
                  onChange={(val) => handleFieldChange('targetCorpus', val)}
                  min={50000}
                  max={1000000000}
                  step={100000}
                  prefix="₹"
                  error={errors.targetCorpus}
                />
              </FormField>
            </div>

            {/* Monthly Savings Capacity */}
            <FormField
              id="wiz-savings"
              label="Monthly Investment Capacity (₹)"
              error={errors.monthlySavings}
              hint="How much surplus income can you consistently allocate into investments every month?"
            >
              <NumberInput
                id="wiz-savings"
                name="monthlySavings"
                value={formData.monthlySavings}
                onChange={(val) => handleFieldChange('monthlySavings', val)}
                min={0}
                max={5000000}
                step={2000}
                prefix="₹"
                suffix="/ month"
                error={errors.monthlySavings}
              />
            </FormField>
          </FormSection>
        </div>
      )}

      {/* ── STEP 3: Risk Preferences ── */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
          <FormSection
            title="Risk Profile & Drawdown Resilience"
            description="Calibrate how much portfolio volatility and market drawdown you can emotionally stomach."
            icon={ShieldCheck}
          >
            {/* Risk Tier */}
            <FormField
              id="wiz-risk-tier"
              label="Risk Tolerance Archetype"
              required
              error={errors.riskTier}
            >
              <RadioGroup
                name="riskTier"
                value={formData.riskTier}
                onChange={(val) => handleFieldChange('riskTier', val)}
                options={RISK_TIERS}
                layout="grid"
                error={errors.riskTier}
              />
            </FormField>

            {/* Drawdown Tolerance */}
            <div className="pt-2">
              <FormField
                id="wiz-drawdown"
                label="Max Acceptable Temporary Drawdown"
                required
                error={errors.drawdownLimit}
                hint="If the market undergoes a steep correction, what is the maximum unrealized loss you can endure without panic selling?"
              >
                <div className="grid grid-cols-3 gap-3">
                  {['10%', '20%', '35%'].map((limit) => (
                    <button
                      key={limit}
                      type="button"
                      onClick={() => handleFieldChange('drawdownLimit', limit)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        formData.drawdownLimit === limit
                          ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/20 font-bold'
                          : isDark
                          ? 'bg-white/4 border-white/10 text-gray-400 hover:text-white'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-violet-300'
                      }`}
                    >
                      <span className="text-base font-extrabold block">{limit}</span>
                      <span className="text-[10px] text-gray-400">Max drop</span>
                    </button>
                  ))}
                </div>
              </FormField>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/6">
              <CheckboxField
                id="wiz-emergency"
                name="hasEmergencyFund"
                checked={formData.hasEmergencyFund}
                onChange={(e) => handleFieldChange('hasEmergencyFund', e.target.checked)}
                label="Emergency Fund Already Established (6 Months Expenses)"
                description="Separately parked liquid savings to prevent premature equity liquidations during crises."
              />

              <CheckboxField
                id="wiz-stoploss"
                name="useStopLoss"
                checked={formData.useStopLoss}
                onChange={(e) => handleFieldChange('useStopLoss', e.target.checked)}
                label="Practice Strict Stop-Loss Risk Management in Simulator"
                description="Automatically tag positions with a recommended trailing stop exit threshold."
              />
            </div>
          </FormSection>
        </div>
      )}

      {/* ── STEP 4: Review and Confirmation ── */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
          <FormSummary
            title="Review Your Calibrated Profile"
            subtitle="Verify your selections across all 3 modules before saving your profile."
            items={[
              {
                label: 'Experience Level',
                value: formData.experience.toUpperCase(),
                icon: Briefcase,
              },
              {
                label: 'Primary Exchange',
                value: formData.exchange,
                icon: Layers,
              },
              {
                label: 'Asset Preference',
                value: formData.preferredAsset === 'equity' ? 'Direct Equities' : formData.preferredAsset,
                icon: PieChart,
              },
              {
                label: 'Target Time Horizon',
                value: `${formData.targetHorizonYears} Years`,
                icon: Calendar,
              },
              {
                label: 'Target Portfolio Corpus',
                value: `₹${parseFloat(formData.targetCorpus).toLocaleString('en-IN')}`,
                icon: Wallet,
              },
              {
                label: 'Monthly Investment',
                value: `₹${parseFloat(formData.monthlySavings).toLocaleString('en-IN')}/mo`,
                icon: TrendingUp,
              },
              {
                label: 'Risk Appetite',
                value: `${formData.riskTier} Risk`,
                badge: formData.riskTier === 'High' ? 'Aggressive' : formData.riskTier === 'Low' ? 'Conservative' : 'Balanced',
                badgeStyle: formData.riskTier === 'High' ? 'bg-rose-500/20 text-rose-300' : formData.riskTier === 'Low' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300',
                icon: ShieldCheck,
              },
              {
                label: 'Drawdown Tolerance',
                value: formData.drawdownLimit,
                icon: Sliders,
              },
            ]}
            disclaimer="Your profile calibrations are stored client-side and synchronized with your virtual trading session. You can update these parameters anytime."
            actions={
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(1)}
                >
                  Edit Preferences
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(2)}
                >
                  Edit Goals
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(3)}
                >
                  Edit Risk
                </Button>
              </div>
            }
          />
        </div>
      )}

      {/* ── NAVIGATION CONTROLS (Previous / Continue / Submit) ── */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </Button>

        {currentStep < 4 ? (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleNext}
            className="gap-2 px-6"
          >
            <span>Continue to Step {currentStep + 1}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleFinalSubmit}
            className="gap-2 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-none shadow-lg shadow-emerald-600/30"
          >
            <Save className="w-4 h-4" />
            <span>Confirm &amp; Save Investor Profile</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export default ProfileSetupWizard;
