import React from 'react';
import { StockData } from '../types';
import { formatCurrency, formatPercent, formatCompactNumber, cn } from '../lib/utils';
import { TrendingUp, Zap, Shield, Target } from 'lucide-react';

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
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm col-span-1">
          <div className="flex items-center text-zinc-400 mb-3 space-x-2 text-sm font-medium border-b border-zinc-800 pb-2">
            <Shield size={16} />
            <span>Solvency & Safety</span>
          </div>
          <div className="space-y-2 text-sm">
            <MetricRow label="Debt / Equity" value={stock.debtToEquity} format="decimal" />
            <MetricRow label="Current Ratio" value={stock.currentRatio} format="decimal" />
            <MetricRow label="Quick Ratio" value={stock.quickRatio} format="decimal" />
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

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm col-span-1">
          <div className="flex items-center text-zinc-400 mb-3 space-x-2 text-sm font-medium border-b border-zinc-800 pb-2">
            <TrendingUp size={16} />
            <span>Technical Context</span>
          </div>
          <div className="space-y-2 text-sm">
            <MetricRow label="50-Day Range Location" value={stock.priceTo50DayRangePercent} format="percent" />
            <MetricRow label="14-Period RSI" value={stock.rsi} format="decimal" />
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
