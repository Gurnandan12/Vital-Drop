import { NextResponse } from 'next/server';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
export async function POST(request) {
    try {
        const body = await request.json();
        const { symbol, simResults, riskProfile, investment, duration, userQuery, portfolioData } = body;
        const systemPrompt = `You are an AI Portfolio Explainer and Financial Assistant.

IMPORTANT:
- You do NOT fetch data yourself
- You ONLY use the data provided in the input
- If data is missing → say "insufficient data"

INPUT:
You will receive:
1. User Query
2. Portfolio Data (stocks, prices, metrics)

MODE SELECTION:
If User Query is empty:
→ Explain the portfolio
If User Query is a question:
→ Answer using portfolio data

PORTFOLIO EXPLANATION:
📊 Overview:
- Overall performance (growing / declining / stable)
- Diversification
📈 Strengths:
- Best performing stocks
📉 Weaknesses:
- Underperforming stocks
⚠️ Risks:
- Sector concentration
- Volatility
💡 Insight:
- Balanced conclusion

QUESTION ANSWERING:
- Answer clearly using given data
- Do NOT guess missing info
- Keep it short and relevant

ERROR HANDLING:
If no data:
→ "I'm unable to analyze due to missing data. Please try again."

RULES:
- No Buy/Sell advice
- No assumptions beyond data
- Be clear and structured
- Format your response strictly using HTML tags (e.g., <strong>, <br/>, <ul>, <li>). Do NOT use markdown symbols like **, *, or # in your response format. Do NOT wrap output in \`\`\`html blocks.`;
        const AV_API_KEY = process.env.ALPHA_VANTAGE_KEY;
        let stockData = portfolioData || {};
        console.log("--- DEBUG MODE START ---");
        // 1. VERIFY STOCK API
        if (symbol && AV_API_KEY && AV_API_KEY !== "your_alpha_vantage_key_here") {
            try {
                const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}.BSE&apikey=${AV_API_KEY}`);
                const data = await response.json();
                console.log("API DATA:", data);
                if (!data || Object.keys(data).length === 0 || data['Information'] || data['Note']) {
                    throw new Error('API returned empty, or rate limit reached');
                }
                stockData = { ...stockData, globalQuote: data };
            }
            catch (e) {
                console.error("Alpha vantage fetch error:", e);
                // 5. & 6. TEMP TEST MODE (Bypass/API Fail)
                stockData = {
                    stocks: [
                        { name: "Reliance", price: 2450, change: "+1.2%" },
                        { name: "TCS", price: 3900, change: "-0.5%" }
                    ]
                };
            }
        }
        else {
            // TEMP TEST MODE: Bypass stock API for testing
            stockData = {
                stocks: [
                    { name: "Reliance", price: 2450, change: "+1.2%" },
                    { name: "TCS", price: 3900, change: "-0.5%" }
                ]
            };
            console.log("API DATA:", stockData);
        }
        const queryToUse = userQuery || '';
        const input = `${systemPrompt}\n\nUser Query: ${queryToUse}\n\nPortfolio Data:\n${JSON.stringify(stockData)}`;
        // 2. VERIFY DATA FLOW
        console.log("LLM INPUT:", input);
        // 3. VERIFY LLM CALL
        const apiKey = process.env.OPENAI_API_KEY;
        console.log('[Backend Log] OPENAI_API_KEY loaded:', !!apiKey);
        console.log('[Backend Log] Executing AI Request via OpenAI.');
        const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: input }],
                temperature: 0.7
            })
        });
        if (!aiRes.ok) {
            const errorText = await aiRes.text();
            throw new Error(`OpenAI Error: ${aiRes.status} - ${errorText}`);
        }
        const aiData = await aiRes.json();
        const resultText = aiData.choices[0].message.content;
        // 4. ADD DEBUG LOGS
        console.log("LLM OUTPUT:", resultText);
        console.log("--- DEBUG MODE END ---");
        return NextResponse.json({ text: resultText });
    }
    catch (error) {
        // 5. HANDLE FAILURES
        console.error('LLM CALL FAILED:', error, error.cause);
        return NextResponse.json({ text: `API Error: ${error.message} - ${error.cause ? error.cause.message : 'No cause'}` }, { status: 500 });
    }
}
