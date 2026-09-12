import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import YahooFinance from 'yahoo-finance2';
// CJS bundle gets the module namespace here, ESM gets the class itself.
const YF = ((YahooFinance as any).default ?? YahooFinance) as typeof YahooFinance;
const yahooFinance = new YF({ suppressNotices: ['yahooSurvey'] });



async function startServer() {
  const app = express();
  const PORT = 3000;

  // --- Helpers for Calculations ---

  // Calculate standard RSI
  function calculateRSI(closes: number[], periods: number) {
    if (closes.length <= periods) return closes.map(() => null);

    let gains = 0;
    let losses = 0;
    let rsiArray: (number | null)[] = closes.map(() => null);

    // First average gain and loss
    for (let i = 1; i <= periods; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }

    let avgGain = gains / periods;
    let avgLoss = losses / periods;

    // Smoothed subsequent periods
    for (let i = periods + 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;

      avgGain = (avgGain * (periods - 1) + gain) / periods;
      avgLoss = (avgLoss * (periods - 1) + loss) / periods;

      let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsiArray[i] = 100 - (100 / (1 + rs));
    }
    
    return rsiArray;
  }

  // API Routes
  
  app.get('/api/market-data', async (req, res) => {
    try {
      const tickersQuery = req.query.tickers as string;
      const rsiPeriod = parseInt(req.query.rsiPeriod as string) || 14;
      const trendDays = parseInt(req.query.trendDays as string) || 180;
      const rangeDays = parseInt(req.query.rangeDays as string) || 50;

      if (!tickersQuery) {
        return res.status(400).json({ error: 'Missing tickers parameter' });
      }

      const tickers = tickersQuery.split(',').map(t => t.trim().toUpperCase());
      const results = [];

      // Fetch enough history for the trendDays AND the RSI calculation AND the custom rangeDays.
      // Need trading days, so * 1.5 is a safe multiplier for rangeDays (weekend compensation)
      const daysToFetch = Math.max(trendDays + rsiPeriod * 2, rangeDays * 1.5, 100);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysToFetch);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - trendDays);

      for (const ticker of tickers) {
        try {
          // Fetch quote & modules (summaryDetail, defaultKeyStatistics, price)
          const quotePromise = yahooFinance.quote(ticker);
          const modulesPromise = yahooFinance.quoteSummary(ticker, {
             modules: ['summaryDetail', 'defaultKeyStatistics', 'price', 'financialData'] 
          }).catch(() => null); // Graceful fallback
          
          // Fetch historical data
          const historicalPromise = yahooFinance.chart(ticker, { 
            period1: startDate,
            period2: new Date()
          }).then(res => res.quotes);

          const [quote, modules, historical] = await Promise.all([
            quotePromise, 
            modulesPromise, 
            historicalPromise
          ]);

          if (!quote) {
            results.push({ ticker, error: 'Ticker not found' });
            continue;
          }

          // Calculate Dynamic Range High/Low
          // `rangeDays` points backwards, we use .slice(-rangeDays)
          // Note: historical array is only trading days, so `.slice(-rangeDays)` gives exactly `rangeDays` trading sessions.
          const lastRange = historical.slice(-rangeDays);
          let rangeHigh = 0;
          let rangeLow = Infinity;
          if (lastRange.length > 0) {
             rangeHigh = Math.max(...lastRange.map(day => day.high || day.close));
             rangeLow = Math.min(...lastRange.map(day => day.low || day.close));
          }

          // Calculate RSI
          const closes = historical.map(day => day.close);
          const rsiArray = calculateRSI(closes, rsiPeriod);
          const rsi = rsiArray[rsiArray.length - 1];

          // Build Historical Chart Data for last `trendDays`
          const chartData = historical
            .filter(day => day.date >= cutoffDate)
            .map(day => ({
               date: day.date.toISOString().split('T')[0],
               price: day.close,
            }));

          // RSI series for chart
          const rsiChartData = historical.map((day, i) => ({
             date: day.date.toISOString().split('T')[0],
             rsi: rsiArray[i]
          })).filter(d => d.rsi !== null && new Date(d.date) >= cutoffDate);

          // Extract Valuation metrics
          const summaryDetail = modules?.summaryDetail || {};
          const keyStats = modules?.defaultKeyStatistics || {};
          const financialData = modules?.financialData || {};
          
          const pegRatio = keyStats.pegRatio || null;
          const peRatio = summaryDetail.trailingPE || quote.trailingPE || null;
          const marketCap = summaryDetail.marketCap || quote.marketCap || null;
          const fiftyTwoWeekHigh = summaryDetail.fiftyTwoWeekHigh || quote.fiftyTwoWeekHigh || null;
          const fiftyTwoWeekLow = summaryDetail.fiftyTwoWeekLow || quote.fiftyTwoWeekLow || null;

          const dividendYield = summaryDetail.dividendYield || null;
          const eps = keyStats.trailingEps || quote.epsTrailingTwelveMonths || null;
          const priceToBook = keyStats.priceToBook || null;
          const beta = summaryDetail.beta || keyStats.beta || null;
          const volume = summaryDetail.volume || quote.regularMarketVolume || null;

          // New Metrics
          const grossMargin = financialData.grossMargins || null;
          const operatingMargin = financialData.operatingMargins || null;
          const roe = financialData.returnOnEquity || null;
          const roa = financialData.returnOnAssets || null;
          // ROIC is not always present, sometimes we need to calculate or use returnOnEquity as fallback or leave null
          const roic = financialData.returnOnEquity && financialData.returnOnAssets 
            ? ((financialData.returnOnEquity + financialData.returnOnAssets) / 2) // Approximation if ROIC missing
            : null;

          const operatingCashFlow = financialData.operatingCashflow || null;
          const freeCashFlow = financialData.freeCashflow || null;
          const fcfYield = (freeCashFlow && marketCap) ? (freeCashFlow / marketCap) : null;
          const priceToFcf = (freeCashFlow && marketCap) ? (marketCap / freeCashFlow) : null;

          const debtToEquity = financialData.debtToEquity || null;
          const ebitda = financialData.ebitda || null;
          const totalDebt = financialData.totalDebt || null;
          const debtToEbitda = (totalDebt && ebitda) ? (totalDebt / ebitda) : null;
          
          const currentRatio = financialData.currentRatio || null;
          const quickRatio = financialData.quickRatio || null;
          
          // Interest coverage (EBITDA / Interest Expense roughly if we don't have it, but financialData might not have interestExpense. Let's leave null if not available)
          const interestCoverage = financialData.interestCoverage || null;

          const forwardPE = summaryDetail.forwardPE || keyStats.forwardPE || null;
          const evToEbitda = keyStats.enterpriseToEbitda || null;
          const evToRevenue = keyStats.enterpriseToRevenue || null;
          
          // 50-day Range Percent
          let priceTo50DayRangePercent = null;
          if (quote.regularMarketPrice && rangeLow !== null && rangeHigh !== null && rangeHigh !== rangeLow) {
            priceTo50DayRangePercent = ((quote.regularMarketPrice - rangeLow) / (rangeHigh - rangeLow)) * 100;
          }

          // Tactical Synthesis Heuristics
          const redFlags = [];
          const catalysts = [];
          
          if (debtToEquity && debtToEquity > 150) redFlags.push("High Debt/Equity Ratio");
          if (fcfYield && fcfYield < 0) redFlags.push("Negative Free Cash Flow");
          if (currentRatio && currentRatio < 1.0) redFlags.push("Low Current Ratio (Liquidity Risk)");
          if (operatingMargin && operatingMargin < 0) redFlags.push("Negative Operating Margins");
          
          if (fcfYield && fcfYield > 0.05) catalysts.push("Strong FCF Yield");
          if (evToEbitda && evToEbitda < 10) catalysts.push("Attractive EV/EBITDA");
          if (forwardPE && forwardPE < 15 && forwardPE > 0) catalysts.push("Low Forward P/E");
          if (priceTo50DayRangePercent && priceTo50DayRangePercent > 80 && rsi && rsi < 70) catalysts.push("Bullish Momentum near 50-day highs");

          let fundamentalScore = 0;
          if (grossMargin > 0.4) fundamentalScore++;
          if (roe > 0.15) fundamentalScore++;
          if (fcfYield > 0.03) fundamentalScore++;
          if (debtToEquity < 100) fundamentalScore++;
          if (currentRatio > 1.5) fundamentalScore++;
          
          let fundamentalQuality = "Average";
          if (fundamentalScore >= 4) fundamentalQuality = "High Quality";
          else if (fundamentalScore <= 1) fundamentalQuality = "Weak Fundamentals";
          else if (fundamentalScore === 3) fundamentalQuality = "Solid";

          let momentumAlignment = "Neutral";
          if (rsi) {
            if (rsi > 65) momentumAlignment = "Strongly Overbought / High Momentum";
            else if (rsi > 55) momentumAlignment = "Bullish";
            else if (rsi < 35) momentumAlignment = "Strongly Oversold / Bearish";
            else if (rsi < 45) momentumAlignment = "Bearish";
          }
          
          let swingTradeBias = "Hold";
          if (rsi && rsi < 40 && fundamentalScore >= 3) swingTradeBias = "Accumulate (Value/Oversold)";
          else if (rsi && rsi > 60 && fundamentalScore < 2) swingTradeBias = "Trim / Take Profits";
          else if (priceTo50DayRangePercent && priceTo50DayRangePercent > 80 && rsi && rsi > 50) swingTradeBias = "Breakout Watch / Long";
          else if (priceTo50DayRangePercent && priceTo50DayRangePercent < 20 && rsi && rsi < 40) swingTradeBias = "Rebound Play (High Risk)";

          results.push({
            ticker: quote.symbol,
            name: quote.shortName || quote.longName || quote.symbol,
            price: quote.regularMarketPrice,
            changePercent: quote.regularMarketChangePercent,
            rangeHigh: rangeHigh !== 0 ? rangeHigh : null,
            rangeLow: rangeLow !== Infinity ? rangeLow : null,
            rsi: rsi,
            pegRatio,
            peRatio,
            marketCap,
            fiftyTwoWeekHigh,
            fiftyTwoWeekLow,
            dividendYield,
            eps,
            priceToBook,
            beta,
            volume,
            chartData,
            rsiChartData,
            
            grossMargin,
            operatingMargin,
            roe,
            roa,
            roic,
            operatingCashFlow,
            freeCashFlow,
            fcfYield,
            priceToFcf,
            debtToEquity,
            debtToEbitda,
            currentRatio,
            quickRatio,
            interestCoverage,
            forwardPE,
            evToEbitda,
            evToRevenue,
            priceTo50DayRangePercent,
            redFlags,
            catalysts,
            fundamentalQuality,
            momentumAlignment,
            swingTradeBias
          });

        } catch (e: any) {
          console.error(`Error fetching ${ticker}:`, e.message);
          results.push({ ticker, error: e.message || 'Error fetching data' });
        }
      }

      res.json({ data: results });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
