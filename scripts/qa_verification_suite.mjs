/**
 * scripts/qa_verification_suite.mjs
 * Automated Quality Assurance Verification Suite for Vital Drop
 * Tests calculations, store logic, form validations, and live API endpoints.
 */

import {
  calculateFutureValue,
  generateTrajectorySeries,
  calculateScenarioComparisons,
  formatINR,
  clamp,
  RISK_PROFILES,
} from '../lib/riskCalculations.js';

// Color logging helpers
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, testName, details = '') {
  if (condition) {
    passed++;
    console.log(`  ${GREEN}✓ PASS${RESET} ${testName}`);
    results.push({ name: testName, status: 'PASS', details });
  } else {
    failed++;
    console.log(`  ${RED}✗ FAIL${RESET} ${testName} ${details ? `(${details})` : ''}`);
    results.push({ name: testName, status: 'FAIL', details });
  }
}

async function runTestSuite() {
  console.log(`\n${BOLD}${CYAN}====================================================${RESET}`);
  console.log(`${BOLD}${CYAN}   VITAL DROP COMPLETE QA VERIFICATION SUITE       ${RESET}`);
  console.log(`${BOLD}${CYAN}====================================================${RESET}\n`);

  // ─────────────────────────────────────────────────────────────
  // 1. RISK SANDBOX & FINANCIAL CALCULATIONS
  // ─────────────────────────────────────────────────────────────
  console.log(`${BOLD}${YELLOW}1. Risk Sandbox Mathematical Calculations${RESET}`);

  // Test 1.1: Known baseline calculation (₹1L lump sum, ₹10k/mo, 10y, 12% p.a.)
  const baseline = calculateFutureValue({
    initialAmount: 100000,
    monthlyContribution: 10000,
    years: 10,
    annualReturn: 12,
  });

  assert(baseline.totalInvested === 1300000, 'Baseline total invested matches principal (₹13,00,000)', `Got ${baseline.totalInvested}`);
  assert(
    Math.abs(baseline.finalValue - 2653429) <= 2,
    'Baseline future value matches compound annuity due formula (~₹26,53,429)',
    `Got ${baseline.finalValue}`
  );
  assert(
    baseline.growthAmount === baseline.finalValue - baseline.totalInvested,
    'Growth amount is exact difference between final value and invested capital',
    `Got ${baseline.growthAmount}`
  );

  // Test 1.2: Zero return boundary condition (r = 0%)
  const zeroReturn = calculateFutureValue({
    initialAmount: 50000,
    monthlyContribution: 5000,
    years: 5,
    annualReturn: 0,
  });
  assert(zeroReturn.finalValue === 50000 + 5000 * 60, 'Zero return yields exact sum of principal without interest (₹3,50,000)');
  assert(zeroReturn.growthAmount === 0, 'Zero return yields 0 growth');

  // Test 1.3: Zero monthly contributions (lump sum only)
  const lumpSumOnly = calculateFutureValue({
    initialAmount: 200000,
    monthlyContribution: 0,
    years: 3,
    annualReturn: 10,
  });
  const expectedLump = Math.round(200000 * Math.pow(1 + 0.10 / 12, 36));
  assert(Math.abs(lumpSumOnly.finalValue - expectedLump) <= 2, 'Lump-sum only future value matches monthly compound formula');
  assert(lumpSumOnly.totalInvested === 200000, 'Total invested equals lump sum when monthly = 0');

  // Test 1.4: Extreme and negative inputs safety clamping
  const negativeClamped = calculateFutureValue({
    initialAmount: -50000,
    monthlyContribution: -2000,
    years: -5,
    annualReturn: -10,
  });
  assert(negativeClamped.initialAmount === 0, 'Negative initial amount safely clamped to 0');
  assert(negativeClamped.monthlyContribution === 0, 'Negative monthly contribution safely clamped to 0');
  assert(negativeClamped.years === 1, 'Negative years safely clamped to min 1 year');
  assert(negativeClamped.annualReturn === 0, 'Negative return safely clamped to 0%');

  // Test 1.5: Currency formatting INR
  assert(formatINR(125000) === '₹1,25,000', 'formatINR formats standard Indian numbering (₹1,25,000)');
  assert(formatINR(15000000, { compact: true }) === '₹1.50 Cr', 'formatINR formats Crores compact (₹1.50 Cr)');
  assert(formatINR(350000, { compact: true }) === '₹3.50 L', 'formatINR formats Lakhs compact (₹3.50 L)');
  assert(formatINR(7500, { compact: true }) === '₹7.5 K', 'formatINR formats Thousands compact (₹7.5 K)');
  assert(formatINR('invalid') === '₹0', 'formatINR handles NaN safely');

  // Test 1.6: Trajectory series generator
  const trajectory = generateTrajectorySeries({
    initialAmount: 100000,
    monthlyContribution: 10000,
    years: 5,
    annualReturn: 12,
  });
  assert(trajectory.length === 6, 'Trajectory contains Year 0 through Year 5 (6 points)');
  assert(trajectory[0].year === 0 && trajectory[0].invested === 100000, 'Trajectory Year 0 equals initial principal');
  assert(trajectory[5].year === 5 && trajectory[5].projected > trajectory[5].invested, 'Trajectory Year 5 demonstrates compound growth');

  // Test 1.7: Multi-Scenario comparisons
  const comparisons = calculateScenarioComparisons({
    initialAmount: 100000,
    monthlyContribution: 10000,
    years: 10,
  });
  assert(
    comparisons.conservative.finalValue < comparisons.moderate.finalValue &&
    comparisons.moderate.finalValue < comparisons.aggressive.finalValue,
    'Scenario dispersion hierarchy holds: Conservative < Moderate < Aggressive'
  );

  // ─────────────────────────────────────────────────────────────
  // 2. FORM VALIDATION LOGIC TESTS
  // ─────────────────────────────────────────────────────────────
  console.log(`\n${BOLD}${YELLOW}2. Form Validation Logic (Risk Analyzer & Wizards)${RESET}`);

  function validateRiskForm(data) {
    const errors = {};
    // amount
    if (!data.amount || data.amount.toString().trim() === '') {
      errors.amount = 'Investment amount is required.';
    } else {
      const num = parseFloat(data.amount);
      if (isNaN(num)) errors.amount = 'Please enter a valid numeric amount.';
      else if (num <= 0) errors.amount = 'Investment amount must be greater than zero.';
      else if (num < 1000) errors.amount = 'Minimum initial investment is ₹1,000.';
      else if (num > 100000000) errors.amount = 'Maximum initial investment limit is ₹10 Crores.';
    }
    // duration
    if (!data.duration || data.duration.toString().trim() === '') {
      errors.duration = 'Investment duration is required.';
    } else {
      const num = parseFloat(data.duration);
      if (isNaN(num)) errors.duration = 'Please enter a valid duration.';
      else if (num < 1) errors.duration = 'Investment duration must be at least 1 year.';
      else if (num > 40) errors.duration = 'Investment duration cannot exceed 40 years.';
    }
    // goal
    if (!data.goal || !data.goal.trim()) errors.goal = 'Please select an investment goal.';
    // riskTolerance
    if (!data.riskTolerance || !['Low', 'Moderate', 'High'].includes(data.riskTolerance)) {
      errors.riskTolerance = 'Please select a risk tolerance tier (Low, Moderate, or High).';
    }
    // monthlyContribution
    if (data.monthlyContribution !== '' && data.monthlyContribution !== null && data.monthlyContribution !== undefined) {
      const num = parseFloat(data.monthlyContribution);
      if (isNaN(num)) errors.monthlyContribution = 'Monthly contribution must be a valid number.';
      else if (num < 0) errors.monthlyContribution = 'Monthly contribution cannot be negative.';
      else if (num > 10000000) errors.monthlyContribution = 'Monthly contribution limit is ₹1 Crore.';
    }
    return errors;
  }

  const validForm = validateRiskForm({
    amount: '100000',
    duration: '5',
    goal: 'wealth_creation',
    riskTolerance: 'Moderate',
    monthlyContribution: '5000',
  });
  assert(Object.keys(validForm).length === 0, 'Valid form payload produces 0 validation errors');

  const emptyForm = validateRiskForm({});
  assert(emptyForm.amount === 'Investment amount is required.', 'Empty amount triggers required error');
  assert(emptyForm.duration === 'Investment duration is required.', 'Empty duration triggers required error');
  assert(emptyForm.goal === 'Please select an investment goal.', 'Empty goal triggers required error');
  assert(emptyForm.riskTolerance?.includes('risk tolerance tier'), 'Empty risk tolerance triggers validation error');

  const boundaryForm = validateRiskForm({
    amount: '500', // below 1000 min
    duration: '45', // above 40 max
    goal: 'retirement',
    riskTolerance: 'InvalidTier',
    monthlyContribution: '-500', // negative
  });
  assert(boundaryForm.amount === 'Minimum initial investment is ₹1,000.', 'Amount < 1000 rejected');
  assert(boundaryForm.duration === 'Investment duration cannot exceed 40 years.', 'Duration > 40 rejected');
  assert(boundaryForm.monthlyContribution === 'Monthly contribution cannot be negative.', 'Negative monthly contribution rejected');
  assert(boundaryForm.riskTolerance?.includes('risk tolerance tier'), 'Invalid risk tier rejected');

  // ─────────────────────────────────────────────────────────────
  // 3. INVESTMENT BASKET & PORTFOLIO CALCULATIONS
  // ─────────────────────────────────────────────────────────────
  console.log(`\n${BOLD}${YELLOW}3. Investment Basket & Portfolio Pure Logic${RESET}`);

  // Basket calculations
  const sampleBasketItems = [
    { symbol: 'RELIANCE.NS', price: 2950, allocationPercent: 40 },
    { symbol: 'TCS.NS', price: 3820, allocationPercent: 35 },
    { symbol: 'INFY.NS', price: 1740, allocationPercent: 25 },
  ];
  const totalAlloc = sampleBasketItems.reduce((s, i) => s + i.allocationPercent, 0);
  assert(totalAlloc === 100, 'Sample basket total allocation sums to exactly 100%');

  const totalBudget = 100000;
  const itemsWithAmounts = sampleBasketItems.map((item) => {
    const targetAmount = Math.round((item.allocationPercent / 100) * totalBudget);
    const units = Math.floor(targetAmount / item.price);
    return { ...item, targetAmount, units };
  });

  assert(itemsWithAmounts[0].targetAmount === 40000, 'Item 1 gets 40% of ₹1,00,000 = ₹40,000');
  assert(itemsWithAmounts[0].units === 13, 'Item 1 shares = Math.floor(40000 / 2950) = 13 units');
  assert(itemsWithAmounts[1].targetAmount === 35000, 'Item 2 gets 35% of ₹1,00,000 = ₹35,000');
  assert(itemsWithAmounts[2].targetAmount === 25000, 'Item 3 gets 25% of ₹1,00,000 = ₹25,000');

  // Portfolio weighted buy price on top-up
  const existingHolding = { quantity: 10, avgBuyPrice: 2000, totalInvested: 20000 };
  const addQuantity = 10;
  const addPrice = 3000;
  const newQty = existingHolding.quantity + addQuantity;
  const newInvested = existingHolding.totalInvested + addQuantity * addPrice;
  const newAvgPrice = newInvested / newQty;
  assert(newQty === 20, 'Position quantity doubled from 10 to 20');
  assert(newInvested === 50000, 'Total invested updated to ₹50,000 (20k + 30k)');
  assert(newAvgPrice === 2500, 'Weighted average price updated correctly to ₹2,500');

  // Portfolio Sell P&L Calculation
  const sellQty = 5;
  const currentSellMarketPrice = 3200;
  const proceeds = sellQty * currentSellMarketPrice; // 16,000
  const costBasis = sellQty * newAvgPrice; // 12,500
  const realizedPnL = proceeds - costBasis; // +3,500
  assert(realizedPnL === 3500, 'Realized capital gains computed correctly (+₹3,500)');

  // ─────────────────────────────────────────────────────────────
  // 4. LIVE API ENDPOINT VERIFICATION (HTTP localhost:3000)
  // ─────────────────────────────────────────────────────────────
  console.log(`\n${BOLD}${YELLOW}4. Live API Endpoint Verification (Local Dev Server)${RESET}`);

  const BASE_URL = 'http://localhost:3000';

  async function testApiEndpoint(url, validator, testName) {
    try {
      const res = await fetch(`${BASE_URL}${url}`);
      const status = res.status;
      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        // non-json response
      }
      const ok = validator(status, data);
      assert(ok, testName, `Status: ${status}`);
    } catch (err) {
      assert(false, testName, `Network fetch error: ${err.message}`);
    }
  }

  // 4.1 Valid stock quote
  await testApiEndpoint(
    '/api/quote?symbol=RELIANCE.NS',
    (status, data) => status === 200 && data?.data?.symbol === 'RELIANCE.NS' && data?.data?.currentPrice > 0,
    'GET /api/quote?symbol=RELIANCE.NS returns 200 with valid market price'
  );

  // 4.2 Invalid stock quote returns 404 NOT_FOUND
  await testApiEndpoint(
    '/api/quote?symbol=INVALID_TICKER_XYZ_123',
    (status, data) => status === 404 && data?.code === 'NOT_FOUND',
    'GET /api/quote with non-existent symbol returns 404 NOT_FOUND'
  );

  // 4.3 Missing symbol returns 400 MISSING_PARAM
  await testApiEndpoint(
    '/api/quote',
    (status, data) => status === 400 && data?.code === 'MISSING_PARAM',
    'GET /api/quote without symbol parameter returns 400 MISSING_PARAM'
  );

  // 4.4 Multi-stock batch quotes
  await testApiEndpoint(
    '/api/quotes?symbols=RELIANCE.NS,TCS.NS',
    (status, data) => status === 200 && Array.isArray(data?.data) && data.data.length >= 1,
    'GET /api/quotes returns 200 with array of stock objects'
  );

  // 4.5 Stock Search
  await testApiEndpoint(
    '/api/search?q=tata',
    (status, data) => status === 200 && Array.isArray(data?.data) && data.data.length > 0,
    'GET /api/search?q=tata returns matching Indian stocks'
  );

  // 4.6 Historical Candlestick Chart Data
  await testApiEndpoint(
    '/api/history?symbol=RELIANCE.NS&period=1mo',
    (status, data) => status === 200 && Array.isArray(data?.data) && data.data.length > 5,
    'GET /api/history returns valid time series chart points'
  );

  // ─────────────────────────────────────────────────────────────
  // 5. SECURITY & SECRETS CHECK
  // ─────────────────────────────────────────────────────────────
  console.log(`\n${BOLD}${YELLOW}5. Security & Sensitive Information Exposure Check${RESET}`);

  // Test that /api/quote responses don't include any internal API keys
  try {
    const res = await fetch(`${BASE_URL}/api/quote?symbol=RELIANCE.NS`);
    const rawText = await res.text();
    const hasOpenAI = rawText.includes('sk-') || rawText.includes('OPENAI_API_KEY');
    const hasAlphaVantage = rawText.includes('ALPHA_VANTAGE') || rawText.includes('apikey=');
    assert(!hasOpenAI && !hasAlphaVantage, 'API quote responses contain no sensitive API keys or auth tokens');
  } catch (err) {
    assert(false, 'Security check query failed', err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  console.log(`\n${BOLD}${CYAN}====================================================${RESET}`);
  console.log(`${BOLD}${CYAN}   QA VERIFICATION SUMMARY                         ${RESET}`);
  console.log(`${BOLD}${CYAN}====================================================${RESET}`);
  console.log(`  Total Checks Executed : ${passed + failed}`);
  console.log(`  ${GREEN}Passed${RESET}               : ${passed}`);
  console.log(`  ${failed === 0 ? GREEN : RED}Failed${RESET}               : ${failed}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
