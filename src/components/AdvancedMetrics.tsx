import React from 'react';
import { StockData } from '../types';
import { formatCurrency, formatPercent, formatCompactNumber, cn } from '../lib/utils';
import { ShieldAlert, TrendingUp, AlertCircle, Zap, Shield, Target } from 'lucide-react';

interface AdvancedMetricsProps {
  stock: StockData;
}

export function AdvancedMetrics({ stock }: AdvancedMetricsProps) {
  if (stock.error) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm col-span-1">
          <div className="flex items-center text-zinc-400 mb-3 space-x-2 text-sm font-medium border-b border-zinc-800 pb-2">
            <TrendingUp size={16} />
            <span>Profitability & Efficiency</span>
          </div>
          <div className="space-y-2 text-sm">
            <MetricRow label="Gross Margin" value={stock.grossMargin} format="percent" />
            <MetricRow label="Operating Margin" value={stock.operatingMargin} format="percent" />
            <MetricRow label="ROE" value={stock.roe} format="percent" />
            <MetricRow label="ROA" value={stock.roa} format="percent" />
            <MetricRow label="ROIC" value={stock.roic} format="percent" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm col-span-1">
          <div className="flex items-center text-zinc-400 mb-3 space-x-2 text-sm font-medium border-b border-zinc-800 pb-2">
            <Zap size={16} />
            <span>Cash Generation</span>
          </div>
          <div className="space-y-2 text-sm">
            <MetricRow label="Operating Cash Flow" value={stock.operatingCashFlow} format="compact" />
            <MetricRow label="Free Cash Flow" value={stock.freeCashFlow} format="compact" />
            <MetricRow label="FCF Yield" value={stock.fcfYield} format="percent" />
            <MetricRow label="Price / FCF" value={stock.priceToFcf} format="decimal" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm col-span-1">
          <div className="flex items-center text-zinc-400 mb-3 space-x-2 text-sm font-medium border-b border-zinc-800 pb-2">
            <Shield size={16} />
            <span>Solvency & Safety</span>
          </div>
          <div className="space-y-2 text-sm">
            <MetricRow label="Debt / Equity" value={stock.debtToEquity} format="decimal" />
            <MetricRow label="Debt / EBITDA" value={stock.debtToEbitda} format="decimal" />
            <MetricRow label="Current Ratio" value={stock.currentRatio} format="decimal" />
            <MetricRow label="Quick Ratio" value={stock.quickRatio} format="decimal" />
            <MetricRow label="Interest Coverage" value={stock.interestCoverage} format="decimal" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm col-span-1">
          <div className="flex items-center text-zinc-400 mb-3 space-x-2 text-sm font-medium border-b border-zinc-800 pb-2">
            <Target size={16} />
            <span>Valuation Multiples</span>
          </div>
          <div className="space-y-2 text-sm">
            <MetricRow label="Forward P/E" value={stock.forwardPE} format="decimal" />
            <MetricRow label="EV / EBITDA" value={stock.evToEbitda} format="decimal" />
            <MetricRow label="EV / Revenue" value={stock.evToRevenue} format="decimal" />
            <MetricRow label="P/B Ratio" value={stock.priceToBook} format="decimal" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4">
          <div className="flex items-center text-emerald-400 mb-3 space-x-2 text-sm font-medium border-b border-zinc-800 pb-2">
            <AlertCircle size={16} />
            <span>Tactical Synthesis & Red Flags</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">3-Sentence Verdict</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-zinc-950/50 p-2 rounded border border-zinc-800/50">
                  <span className="text-xs text-zinc-400">Fundamental Quality</span>
                  <span className={cn("text-xs font-bold", 
                    stock.fundamentalQuality?.includes("High") ? "text-emerald-400" :
                    stock.fundamentalQuality?.includes("Weak") ? "text-rose-400" : "text-amber-400"
                  )}>{stock.fundamentalQuality || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center bg-zinc-950/50 p-2 rounded border border-zinc-800/50">
                  <span className="text-xs text-zinc-400">Momentum Alignment</span>
                  <span className={cn("text-xs font-bold", 
                    stock.momentumAlignment?.includes("Bullish") ? "text-emerald-400" :
                    stock.momentumAlignment?.includes("Bearish") ? "text-rose-400" : "text-amber-400"
                  )}>{stock.momentumAlignment || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center bg-zinc-950/50 p-2 rounded border border-zinc-800/50">
                  <span className="text-xs text-zinc-400">Swing Trade Bias</span>
                  <span className={cn("text-xs font-bold", 
                    stock.swingTradeBias?.includes("Accumulate") || stock.swingTradeBias?.includes("Long") ? "text-emerald-400" :
                    stock.swingTradeBias?.includes("Trim") ? "text-rose-400" : "text-amber-400"
                  )}>{stock.swingTradeBias || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Technical Context</h4>
              <div className="space-y-2">
                <MetricRow label="50-Day Range Location" value={stock.priceTo50DayRangePercent} format="percent" />
                <MetricRow label="14-Period RSI" value={stock.rsi} format="decimal" />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex justify-between">
                <span>Catalysts & Risks</span>
              </h4>
              <div className="space-y-2 text-xs">
                {(stock.redFlags && stock.redFlags.length > 0) || (stock.catalysts && stock.catalysts.length > 0) ? (
                  <>
                    {stock.redFlags?.map((flag, i) => (
                      <div key={i} className="flex items-start space-x-2 text-rose-400 bg-rose-950/20 p-2 rounded border border-rose-900/30">
                        <ShieldAlert size={14} className="mt-0.5 flex-shrink-0" />
                        <span>{flag}</span>
                      </div>
                    ))}
                    {stock.catalysts?.map((cat, i) => (
                      <div key={i} className="flex items-start space-x-2 text-emerald-400 bg-emerald-950/20 p-2 rounded border border-emerald-900/30">
                        <TrendingUp size={14} className="mt-0.5 flex-shrink-0" />
                        <span>{cat}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-zinc-500 p-2">No active heuristics flagged.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      
    </div>
  );
}

function MetricRow({ label, value, format }: { label: string, value: number | null | undefined, format: 'percent' | 'compact' | 'decimal' }) {
  let displayValue = "N/A";
  if (value !== null && value !== undefined) {
    if (format === 'percent') displayValue = formatPercent(value * 100);
    else if (format === 'compact') displayValue = formatCompactNumber(value);
    else if (format === 'decimal') displayValue = value.toFixed(2);
  }

  return (
    <div className="flex justify-between items-center">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-200">{displayValue}</span>
    </div>
  );
}
