'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  Wallet,
  Calendar,
  Target,
  Shield,
  Layers,
  TrendingUp,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  PieChart,
  ShieldAlert,
  Percent,
  PlusCircle,
} from 'lucide-react';
import { useStockStore } from '@/store/stockStore';
import { usePortfolio } from '@/hooks/usePortfolio';
import {
  FormField,
  NumberInput,
  SelectInput,
  RadioGroup,
  RangeSlider,
  CheckboxField,
  FormSection,
  FormProgress,
  FormSummary,
  FormError,
} from '../forms';
import { Button } from '../ui/Button';

// Goal options
const GOAL_OPTIONS = [
  { value: 'wealth_creation', label: 'Long-term Wealth Creation' },
  { value: 'retirement', label: 'Retirement Corpus Building' },
  { value: 'home_purchase', label: 'Buying a Home / Real Estate' },
  { value: 'education', label: 'Higher Education / Child Future' },
  { value: 'emergency_fund', label: 'Capital Preservation & Safety Buffer' },
];

// Investment category options
const CATEGORY_OPTIONS = [
  { value: 'equity', label: 'Direct Equities (NSE/BSE Large & Mid Cap)' },
  { value: 'mutual_funds', label: 'Diversified Index & Mutual Funds' },
  { value: 'hybrid', label: 'Balanced Hybrid Portfolio (Equity + Debt)' },
  { value: 'fixed_income', label: 'Government Bonds & Debt Securities' },
];

// Risk tolerance options
const RISK_TOLERANCE_OPTIONS = [
  {
    value: 'Low',
    label: 'Low Risk',
    description: 'Capital preservation priority. Low volatility tolerance; preference for debt and index stability.',
    badge: 'Conservative',
    badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    value: 'Moderate',
    label: 'Moderate Risk',
    description: 'Balanced growth. Comfortable with normal market pullbacks in pursuit of inflation-beating alpha.',
    badge: 'Balanced',
    badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  {
    value: 'High',
    label: 'High Risk',
    description: 'Aggressive compounding. Long horizon capable of weathering 30%+ market drawdowns for peak upside.',
    badge: 'Aggressive',
    badgeStyle: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
];

const INITIAL_FORM_STATE = {
  amount: '100000', // ₹1,00,000
  duration: '5', // 5 years
  goal: 'wealth_creation',
  riskTolerance: 'Moderate',
  category: 'equity',
  monthlyContribution: '5000', // ₹5,000 / month
  expectedReturn: '12', // 12% annual assumption
  includeCrashSimulation: true,
};

/**
 * RiskAnalyzerForm — Complete, validated risk profiler & investment strategy form
 */
export function RiskAnalyzerForm({ isDark }) {
  const { balance } = usePortfolio();

  // Controlled form state
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submittedData, setSubmittedData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrorSummary, setSubmitErrorSummary] = useState(null);

  // Field validation engine
  const validateField = useCallback((name, value, allValues = formData) => {
    switch (name) {
      case 'amount': {
        if (!value || value.toString().trim() === '') {
          return 'Investment amount is required.';
        }
        const num = parseFloat(value);
        if (isNaN(num)) return 'Please enter a valid numeric amount.';
        if (num <= 0) return 'Investment amount must be greater than zero.';
        if (num < 1000) return 'Minimum initial investment is ₹1,000.';
        if (num > 100000000) return 'Maximum initial investment limit is ₹10 Crores.';
        return null;
      }
      case 'duration': {
        if (!value || value.toString().trim() === '') {
          return 'Investment duration is required.';
        }
        const num = parseFloat(value);
        if (isNaN(num)) return 'Please enter a valid duration.';
        if (num < 1) return 'Investment duration must be at least 1 year.';
        if (num > 40) return 'Investment duration cannot exceed 40 years.';
        return null;
      }
      case 'goal': {
        if (!value || value.trim() === '') {
          return 'Please select an investment goal.';
        }
        return null;
      }
      case 'riskTolerance': {
        if (!value || !['Low', 'Moderate', 'High'].includes(value)) {
          return 'Please select a risk tolerance tier (Low, Moderate, or High).';
        }
        return null;
      }
      case 'category': {
        if (!value || value.trim() === '') {
          return 'Please select an investment asset category.';
        }
        return null;
      }
      case 'monthlyContribution': {
        if (value !== '' && value !== null && value !== undefined) {
          const num = parseFloat(value);
          if (isNaN(num)) return 'Monthly contribution must be a valid number.';
          if (num < 0) return 'Monthly contribution cannot be negative.';
          if (num > 10000000) return 'Monthly contribution limit is ₹1 Crore.';
        }
        return null;
      }
      case 'expectedReturn': {
        if (value !== '' && value !== null && value !== undefined) {
          const num = parseFloat(value);
          if (isNaN(num)) return 'Expected return assumption must be a valid number.';
          if (num < 1) return 'Expected return assumption should be at least 1%.';
          if (num > 35) return 'Return assumptions above 35% are realistically unsustainable.';
        }
        return null;
      }
      default:
        return null;
    }
  }, [formData]);

  // Validate entire form
  const validateAll = useCallback(() => {
    const newErrors = {};
    const fieldsToValidate = [
      'amount',
      'duration',
      'goal',
      'riskTolerance',
      'category',
      'monthlyContribution',
      'expectedReturn',
    ];

    fieldsToValidate.forEach((field) => {
      const err = validateField(field, formData[field], formData);
      if (err) {
        newErrors[field] = err;
      }
    });

    return newErrors;
  }, [formData, validateField]);

  // Handle controlled input changes
  const handleFieldChange = (name, value) => {
    const nextValues = { ...formData, [name]: value };
    setFormData(nextValues);

    // If field was previously touched, validate immediately
    if (touched[name]) {
      const err = validateField(name, value, nextValues);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }

    if (submitErrorSummary) {
      setSubmitErrorSummary(null);
    }
  };

  // Handle onBlur validation
  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, formData[name]);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  // Completion calculation for progress bar
  const completionPercentage = useMemo(() => {
    const coreFields = ['amount', 'duration', 'goal', 'riskTolerance', 'category'];
    const filledCount = coreFields.filter((f) => formData[f] && !errors[f]).length;
    return Math.round((filledCount / coreFields.length) * 100);
  }, [formData, errors]);

  // Reset form
  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setTouched({});
    setErrors({});
    setSubmittedData(null);
    setSubmitErrorSummary(null);
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateAll();
    setErrors(validationErrors);

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const errorCount = Object.keys(validationErrors).filter((k) => validationErrors[k]).length;

    if (errorCount > 0) {
      setSubmitErrorSummary(`Please correct ${errorCount} error${errorCount > 1 ? 's' : ''} in the form before analyzing.`);
      // Scroll to top of form
      window.scrollTo({ top: 250, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setSubmitErrorSummary(null);

    // Perform analysis calculation
    setTimeout(() => {
      const initialP = parseFloat(formData.amount) || 0;
      const years = parseFloat(formData.duration) || 1;
      const monthlyP = parseFloat(formData.monthlyContribution) || 0;
      const rateAssumption = parseFloat(formData.expectedReturn) || 12;

      // Compound interest with monthly contributions
      const r = rateAssumption / 100 / 12;
      const n = years * 12;
      const futureValueInitial = initialP * Math.pow(1 + rateAssumption / 100, years);
      const futureValueMonthly =
        r > 0 ? monthlyP * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : monthlyP * n;
      const totalFutureValue = Math.round(futureValueInitial + futureValueMonthly);
      const totalInvestedPrincipal = Math.round(initialP + monthlyP * n);
      const totalEstimatedReturns = Math.max(totalFutureValue - totalInvestedPrincipal, 0);

      // Asset Allocation based on Risk Tolerance
      let equityPct = 60;
      let debtPct = 30;
      let liquidGoldPct = 10;
      let stressDrawdownPct = -18.5;

      if (formData.riskTolerance === 'Low') {
        equityPct = 25;
        debtPct = 60;
        liquidGoldPct = 15;
        stressDrawdownPct = -8.2;
      } else if (formData.riskTolerance === 'High') {
        equityPct = 85;
        debtPct = 10;
        liquidGoldPct = 5;
        stressDrawdownPct = -32.4;
      }

      setSubmittedData({
        ...formData,
        totalInvestedPrincipal,
        totalFutureValue,
        totalEstimatedReturns,
        equityPct,
        debtPct,
        liquidGoldPct,
        stressDrawdownPct,
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      setIsSubmitting(false);

      // Smooth scroll to results
      setTimeout(() => {
        const el = document.getElementById('ra-results-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 600);
  };

  return (
    <div className="space-y-8">
      {/* ── Form Progress Indicator ── */}
      <div
        className={`p-4 rounded-2xl border ${
          isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200 shadow-sm'
        }`}
      >
        <FormProgress
          mode="percent"
          percent={completionPercentage}
        />
      </div>

      {/* ── Accessible Form Error Summary Banner ── */}
      {submitErrorSummary && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">{submitErrorSummary}</p>
            <ul className="list-disc list-inside text-xs text-rose-200/90 space-y-0.5">
              {Object.entries(errors)
                .filter(([_, v]) => Boolean(v))
                .map(([field, err]) => (
                  <li key={field}>{err}</li>
                ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── FORM CONTAINER ── */}
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* SECTION 1: Capital & Horizon */}
        <FormSection
          title="1. Capital & Investment Horizon"
          description="Enter your starting investment principal and target holding timeline."
          icon={Wallet}
          badge="Required"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Investment Amount in INR */}
            <FormField
              id="ra-amount"
              label="Initial Investment Amount"
              required
              error={touched.amount && errors.amount}
              hint="Enter your starting lump sum investment in Indian Rupees (₹)."
              labelAction={
                <button
                  type="button"
                  onClick={() => handleFieldChange('amount', Math.round(balance).toString())}
                  className="text-violet-400 hover:text-violet-300 font-semibold"
                >
                  Use Virtual Balance
                </button>
              }
            >
              <NumberInput
                id="ra-amount"
                name="amount"
                value={formData.amount}
                onChange={(val) => handleFieldChange('amount', val)}
                onBlur={() => handleBlur('amount')}
                min={1000}
                max={100000000}
                step={5000}
                prefix="₹"
                placeholder="e.g. 1,00,000"
                error={touched.amount && errors.amount}
              />

              {/* Quick Amount Preset Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  { label: '₹25K', val: '25000' },
                  { label: '₹50K', val: '50000' },
                  { label: '₹1 Lakh', val: '100000' },
                  { label: '₹5 Lakhs', val: '500000' },
                  { label: '₹10 Lakhs', val: '1000000' },
                ].map((chip) => (
                  <button
                    key={chip.val}
                    type="button"
                    onClick={() => handleFieldChange('amount', chip.val)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                      formData.amount === chip.val
                        ? 'bg-violet-600 text-white border-violet-500 shadow-sm'
                        : isDark
                        ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </FormField>

            {/* Investment Duration */}
            <FormField
              id="ra-duration"
              label="Investment Duration (Years)"
              required
              error={touched.duration && errors.duration}
              hint="How many years do you plan to remain invested before withdrawing?"
            >
              <NumberInput
                id="ra-duration"
                name="duration"
                value={formData.duration}
                onChange={(val) => handleFieldChange('duration', val)}
                onBlur={() => handleBlur('duration')}
                min={1}
                max={40}
                step={1}
                prefix=""
                suffix="Years"
                placeholder="e.g. 5"
                error={touched.duration && errors.duration}
              />

              {/* Quick Duration Preset Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  { label: '3 Yrs', val: '3' },
                  { label: '5 Yrs', val: '5' },
                  { label: '10 Yrs', val: '10' },
                  { label: '15 Yrs', val: '15' },
                  { label: '20 Yrs', val: '20' },
                ].map((chip) => (
                  <button
                    key={chip.val}
                    type="button"
                    onClick={() => handleFieldChange('duration', chip.val)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                      formData.duration === chip.val
                        ? 'bg-violet-600 text-white border-violet-500 shadow-sm'
                        : isDark
                        ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </FormField>
          </div>
        </FormSection>

        {/* SECTION 2: Goals & Category */}
        <FormSection
          title="2. Objectives & Asset Category"
          description="Identify your financial goal and preferred investment vehicle."
          icon={Target}
          badge="Required"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Investment Goal */}
            <FormField
              id="ra-goal"
              label="Primary Investment Goal"
              required
              error={touched.goal && errors.goal}
              hint="Select the financial purpose guiding this capital allocation."
            >
              <SelectInput
                id="ra-goal"
                name="goal"
                value={formData.goal}
                onChange={(e) => handleFieldChange('goal', e.target.value)}
                onBlur={() => handleBlur('goal')}
                options={GOAL_OPTIONS}
                error={touched.goal && errors.goal}
              />
            </FormField>

            {/* Investment Category */}
            <FormField
              id="ra-category"
              label="Preferred Asset Category"
              required
              error={touched.category && errors.category}
              hint="Specify the asset class to anchor your risk assessment."
            >
              <SelectInput
                id="ra-category"
                name="category"
                value={formData.category}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                onBlur={() => handleBlur('category')}
                options={CATEGORY_OPTIONS}
                error={touched.category && errors.category}
              />
            </FormField>
          </div>
        </FormSection>

        {/* SECTION 3: Risk Tolerance */}
        <FormSection
          title="3. Risk Tolerance Calibration"
          description="Select your emotional and financial capacity to withstand market fluctuations."
          icon={Shield}
          badge="Crucial Parameter"
        >
          <FormField
            id="ra-risk-tolerance"
            label="Risk Tolerance Level"
            required
            error={touched.riskTolerance && errors.riskTolerance}
            hint="Choose between Low, Moderate, or High risk profiles."
          >
            <RadioGroup
              name="riskTolerance"
              value={formData.riskTolerance}
              onChange={(val) => handleFieldChange('riskTolerance', val)}
              options={RISK_TOLERANCE_OPTIONS}
              layout="grid"
              error={touched.riskTolerance && errors.riskTolerance}
            />
          </FormField>
        </FormSection>

        {/* SECTION 4: Assumptions & Contributions (Optional) */}
        <FormSection
          title="4. Additional SIP & Return Assumptions"
          description="Model recurring monthly investments and calibrate annual return expectations."
          icon={TrendingUp}
          badge="Optional Assumptions"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Optional Monthly Contribution */}
            <FormField
              id="ra-monthly"
              label="Monthly SIP Contribution (Optional)"
              error={touched.monthlyContribution && errors.monthlyContribution}
              hint="Optional recurring monthly amount to invest (set to 0 for lump sum only)."
            >
              <NumberInput
                id="ra-monthly"
                name="monthlyContribution"
                value={formData.monthlyContribution}
                onChange={(val) => handleFieldChange('monthlyContribution', val)}
                onBlur={() => handleBlur('monthlyContribution')}
                min={0}
                max={10000000}
                step={1000}
                prefix="₹"
                suffix="/ month"
                placeholder="0"
                error={touched.monthlyContribution && errors.monthlyContribution}
              />
            </FormField>

            {/* Optional Expected Annual Return Assumption */}
            <FormField
              id="ra-return"
              label="Assumed Annual Return (Optional %)"
              error={touched.expectedReturn && errors.expectedReturn}
              hint="Hypothetical compound annual growth rate (CAGR) assumption for illustrative modeling."
            >
              <NumberInput
                id="ra-return"
                name="expectedReturn"
                value={formData.expectedReturn}
                onChange={(val) => handleFieldChange('expectedReturn', val)}
                onBlur={() => handleBlur('expectedReturn')}
                min={1}
                max={35}
                step={0.5}
                prefix=""
                suffix="% / yr"
                placeholder="12"
                error={touched.expectedReturn && errors.expectedReturn}
              />
            </FormField>
          </div>

          <div className="pt-2">
            <CheckboxField
              id="ra-crash-sim"
              name="includeCrashSimulation"
              checked={formData.includeCrashSimulation}
              onChange={(e) => handleFieldChange('includeCrashSimulation', e.target.checked)}
              label="Include Historical Market Crash Stress Test"
              description="Calculate potential portfolio drawdown in a severe market correction (-15% to -35% crash scenario)."
            />
          </div>
        </FormSection>

        {/* ── FORM ACTIONS (Reset & Submit) ── */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-white/10">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Fields</span>
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="gap-2 px-8"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{isSubmitting ? 'Calibrating Strategy…' : 'Analyze Risk & Generate Plan'}</span>
          </Button>
        </div>
      </form>

      {/* ── SUCCESS RESULTS & SUMMARY ── */}
      {submittedData && (
        <div id="ra-results-section" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Summary Card */}
          <FormSummary
            title="Calibrated Investment Profile Summary"
            subtitle={`Strategy generated successfully at ${submittedData.submittedAt}.`}
            items={[
              {
                label: 'Initial Capital',
                value: `₹${parseFloat(submittedData.amount).toLocaleString('en-IN')}`,
                icon: Wallet,
              },
              {
                label: 'Time Horizon',
                value: `${submittedData.duration} Year${submittedData.duration > 1 ? 's' : ''}`,
                icon: Calendar,
              },
              {
                label: 'Risk Profile',
                value: `${submittedData.riskTolerance} Risk`,
                badge: submittedData.riskTolerance === 'High' ? 'Aggressive' : submittedData.riskTolerance === 'Low' ? 'Conservative' : 'Balanced',
                badgeStyle: submittedData.riskTolerance === 'High' ? 'bg-rose-500/20 text-rose-300' : submittedData.riskTolerance === 'Low' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300',
                icon: Shield,
              },
              {
                label: 'Monthly SIP',
                value: submittedData.monthlyContribution && parseFloat(submittedData.monthlyContribution) > 0
                  ? `₹${parseFloat(submittedData.monthlyContribution).toLocaleString('en-IN')}/mo`
                  : 'Lump Sum Only',
                icon: PlusCircle,
              },
              {
                label: 'Total Capital To Invest',
                value: `₹${submittedData.totalInvestedPrincipal.toLocaleString('en-IN')}`,
                hint: `Principal + ${submittedData.duration * 12} monthly installments`,
                icon: PieChart,
              },
              {
                label: 'Projected Corpus (Hypothetical)',
                value: `₹${submittedData.totalFutureValue.toLocaleString('en-IN')}`,
                badge: `@ ${submittedData.expectedReturn}% CAGR`,
                badgeStyle: 'bg-violet-500/20 text-violet-300',
                hint: `Estimated wealth gain: ₹${submittedData.totalEstimatedReturns.toLocaleString('en-IN')}`,
                icon: TrendingUp,
              },
            ]}
            disclaimer="The projected future corpus is an illustrative calculation derived mathematically from your entered assumption of annual return and monthly contributions. It does NOT represent a guaranteed outcome or investment advice. Stock and mutual fund investments are subject to market risks."
            actions={
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const el = document.getElementById('ra-amount');
                    if (el) el.focus();
                  }}
                >
                  Edit Answers
                </Button>

                <Link to="/dashboard">
                  <Button variant="primary" size="sm" className="gap-1.5">
                    <span>Simulate Trades in Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            }
          />

          {/* Recommended Asset Allocation Matrix */}
          <div
            className={`rounded-2xl border p-6 space-y-4 ${
              isDark ? 'bg-[#0d0d1a] border-white/8' : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base flex items-center gap-2">
                <PieChart className="w-4 h-4 text-violet-400" />
                <span>Recommended Calibrated Asset Allocation</span>
              </h4>
              <span className="text-xs text-gray-400 font-semibold">
                Tailored for {submittedData.riskTolerance} Risk
              </span>
            </div>

            {/* Split Bar */}
            <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${submittedData.equityPct}%` }}
                className="h-full bg-violet-600 transition-all duration-500"
                title={`Equities: ${submittedData.equityPct}%`}
              />
              <div
                style={{ width: `${submittedData.debtPct}%` }}
                className="h-full bg-blue-500 transition-all duration-500"
                title={`Fixed Income & Debt: ${submittedData.debtPct}%`}
              />
              <div
                style={{ width: `${submittedData.liquidGoldPct}%` }}
                className="h-full bg-amber-400 transition-all duration-500"
                title={`Gold & Cash Reserves: ${submittedData.liquidGoldPct}%`}
              />
            </div>

            {/* Allocation Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-md bg-violet-600 shrink-0" />
                <span className="font-bold">{submittedData.equityPct}% Equities</span>
                <span className="text-gray-500">(NSE &amp; BSE Large Cap)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-md bg-blue-500 shrink-0" />
                <span className="font-bold">{submittedData.debtPct}% Fixed Income</span>
                <span className="text-gray-500">(Bonds, Debt Funds)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-md bg-amber-400 shrink-0" />
                <span className="font-bold">{submittedData.liquidGoldPct}% Gold / Cash</span>
                <span className="text-gray-500">(Emergency buffer)</span>
              </div>
            </div>

            {/* Stress Test Simulation Box */}
            {submittedData.includeCrashSimulation && (
              <div
                className={`mt-4 p-4 rounded-xl border flex items-center justify-between gap-4 ${
                  isDark ? 'bg-white/[0.02] border-white/8' : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-wider text-gray-300">
                      Market Crash Stress Test
                    </h5>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Estimated portfolio drawdown in a severe market correction
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-amber-400">
                    {submittedData.stressDrawdownPct}%
                  </span>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {submittedData.riskTolerance === 'Low'
                      ? 'High Downside Protection'
                      : submittedData.riskTolerance === 'High'
                      ? 'Volatility Exposure'
                      : 'Moderate Buffer'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RiskAnalyzerForm;
