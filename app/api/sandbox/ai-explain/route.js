import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { symbol, shortName, currency, metrics, forecasts, backtest, selectedModel, horizonDays } = body;

    if (!symbol || !metrics) {
      return NextResponse.json(
        { error: 'Missing required analysis payload', code: 'MISSING_PAYLOAD' },
        { status: 400 }
      );
    }

    const cur = currency || 'INR';
    const chosenHorizon = horizonDays || 90;
    const modelKey = selectedModel || 'gbm';
    const activeForecast = forecasts?.[modelKey]?.forecasts?.[chosenHorizon];

    // Build verified numerical summary context for the prompt
    const verifiedDataPrompt = `
You are a Quantitative Analyst and Risk Educator for Vital Drop ("Crash. Recover. Repeat.").
Provide an educational, objective, and data-grounded analysis of ${symbol} (${shortName || symbol}) based ONLY on the verified quantitative metrics below.

RULES:
1. NEVER fabricate or alter numbers. Refer strictly to the metrics provided below.
2. DO NOT provide personalized financial advice, price guarantees, or Buy/Sell commands.
3. Highlight risk indicators (Max Drawdown, Volatility) honestly.
4. Keep the tone analytical, disciplined, and educational.

VERIFIED METRICS:
- Asset: ${symbol} (${shortName || symbol})
- Currency: ${cur}
- 5-Year Cumulative Return: ${metrics.cumulativeReturn}%
- Annualized Return: ${metrics.annualizedReturn}% p.a.
- Annualized Volatility: ${metrics.annualizedVolatility}% p.a.
- Maximum Historical Drawdown: ${metrics.maxDrawdown}% (Peak: ${metrics.mddPeakDate || 'N/A'}, Trough: ${metrics.mddTroughDate || 'N/A'})
- Sharpe Ratio (Risk-Adjusted): ${metrics.sharpeRatio}
- Current vs 50-Day SMA: ${metrics.isAboveSma50 ? 'Trading ABOVE 50-day average' : 'Trading BELOW 50-day average'}
- Current vs 200-Day SMA: ${metrics.isAboveSma200 ? 'Trading ABOVE 200-day average' : 'Trading BELOW 200-day average'}
- Volume Trend (20d vs 90d): ${metrics.volumeTrend?.momentum || 'Stable'} (${metrics.volumeTrend?.ratio || 1}x ratio)
- Selected Forecasting Model: ${forecasts?.[modelKey]?.modelName || 'GBM'}
- Horizon: ${chosenHorizon} Days
- Model Projected Expected Return: ${activeForecast?.pctChange ?? 'N/A'}% (Price: ${cur} ${activeForecast?.estimatedPrice ?? 'N/A'})
- 95% Prediction Interval: ${cur} ${activeForecast?.lower95 ?? 'N/A'} to ${cur} ${activeForecast?.upper95 ?? 'N/A'} (${activeForecast?.lower95Pct ?? 'N/A'}% to ${activeForecast?.upper95Pct ?? 'N/A'}%)
- Backtesting Validation (MAE): ${backtest?.models?.[modelKey]?.mae ?? 'N/A'} (Relative to Naive Baseline: ${backtest?.models?.[modelKey]?.relativeRmseVsNaive ?? 'N/A'}x)
- Backtest Directional Accuracy: ${backtest?.models?.[modelKey]?.directionalAccuracy ?? 'N/A'}%

STRUCTURE YOUR RESPONSE IN 4 CLEAN SECTIONS:
1. **Executive Historical Summary**: 5-year return trajectory and compound growth.
2. **Quantitative Risk Profile**: Volatility, maximum drawdown depth, and moving average trend.
3. **Statistical Forecast & Uncertainty**: Model projection, expanding prediction intervals, and walk-forward backtest reliability.
4. **Prudent Investor Takeaway**: How a risk-conscious investor should view these scenarios without assuming past performance guarantees future results.
`;

    // Check for Google GenAI / Gemini Key
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;

    if (geminiKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: verifiedDataPrompt,
        });

        const text = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return NextResponse.json({
            explanation: text,
            source: 'gemini-2.5-flash',
            timestamp: new Date().toISOString(),
          });
        }
      } catch (genAiError) {
        console.warn('[AI-Explain] Google GenAI call error, using deterministic engine:', genAiError?.message || genAiError);
      }
    }

    // Deterministic Rule-Based Quantitative Explanation Fallback
    const mddSeverity = Math.abs(metrics.maxDrawdown) > 40 ? 'substantial' : Math.abs(metrics.maxDrawdown) > 25 ? 'moderate' : 'mild';
    const volSeverity = metrics.annualizedVolatility > 35 ? 'high' : metrics.annualizedVolatility > 20 ? 'moderate' : 'low';
    const trendStatus = metrics.isAboveSma200 ? 'positive long-term structural uptrend' : 'cautionary stance below its 200-day moving average';

    const fallbackExplanation = `
### 1. Executive Historical Summary
Over the observed 5-year period, **${symbol}** delivered a cumulative total return of **${metrics.cumulativeReturn > 0 ? '+' : ''}${metrics.cumulativeReturn}%**, translating to an annualized return of **${metrics.annualizedReturn}% p.a.** The asset experienced its strongest single trading day gain of **+${metrics.bestDay?.returnPct}%** on ${metrics.bestDay?.date || 'historical records'}.

### 2. Quantitative Risk Profile
- **Annualized Volatility**: Recorded at **${metrics.annualizedVolatility}%**, indicating **${volSeverity}** price fluctuation relative to broader market benchmarks.
- **Maximum Drawdown**: Experienced a peak-to-trough contraction of **${metrics.maxDrawdown}%**, with the major decline culminating around ${metrics.mddTroughDate || 'market correction periods'}. This constitutes a **${mddSeverity}** historical stress scenario.
- **Trend Regime**: The asset is currently **${trendStatus}** (50-Day SMA: ${metrics.sma50 ? cur + ' ' + metrics.sma50 : 'N/A'}, 200-Day SMA: ${metrics.sma200 ? cur + ' ' + metrics.sma200 : 'N/A'}).
- **Risk-Adjusted Efficiency**: Generated a Sharpe ratio of **${metrics.sharpeRatio}** against baseline risk-free cash rates.

### 3. Statistical Forecast & Uncertainty (${chosenHorizon}-Day Horizon)
- **Model Framework**: Evaluated via **${forecasts?.[modelKey]?.modelName || 'Statistical Drift Engine'}**.
- **Central Scenario**: Projects an expected price of **${cur} ${activeForecast?.estimatedPrice || 'N/A'}** (${activeForecast?.pctChange > 0 ? '+' : ''}${activeForecast?.pctChange || '0'}% from current levels).
- **Statistically Defensible 95% Prediction Interval**: Ranges between **${cur} ${activeForecast?.lower95 || 'N/A'}** (${activeForecast?.lower95Pct}%) and **${cur} ${activeForecast?.upper95 || 'N/A'}** (+${activeForecast?.upper95Pct}%). This wide dispersion illustrates that single-point price targets convey false precision.
- **Walk-Forward Backtesting**: Chronological walk-forward validation across held-out historical intervals measured a Mean Absolute Error (MAE) of **${backtest?.models?.[modelKey]?.mae || 'N/A'}** with a directional accuracy of **${backtest?.models?.[modelKey]?.directionalAccuracy || '50'}%**.

### 4. Prudent Investor Takeaway
In accordance with the Vital Drop ethos (*Crash. Recover. Repeat.*), historical growth must always be balanced against drawdown risk. Statistical forecasting estimates theoretical probability distributions under historical drift and volatility assumptions, not guaranteed outcomes. Investors should incorporate stop-loss discipline and scenario planning before committing capital.
`;

    return NextResponse.json({
      explanation: fallbackExplanation.trim(),
      source: 'deterministic-quantitative-engine',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API/sandbox/ai-explain] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quantitative explanation', details: String(error?.message || error) },
      { status: 500 }
    );
  }
}
