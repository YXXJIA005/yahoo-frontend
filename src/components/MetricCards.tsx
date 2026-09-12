import React from 'react';
import { ArrowDownRight, ArrowUpRight, Activity, TrendingUp, DollarSign, Target } from 'lucide-react';
import { StockData } from '../types';
import { formatCurrency, formatPercent, formatCompactNumber, cn } from '../lib/utils';

interface MetricCardsProps {
  stock: StockData;
  rsiPeriod: number;
  rangeDays: number;
}

export function MetricCards({ stock, rsiPeriod, rangeDays }: MetricCardsProps) {
  if (stock.error) {
    return <div className="p-4 bg-red-950/20 text-red-400 rounded-lg border border-red-900/30">Failed to load metrics: {stock.error}</div>;
  }

  const isPositiveChange = (stock.changePercent ?? 0) >= 0;
  
  // Dynamic range calculation
  let rangePercent = 0;
  if (stock.price && stock.rangeLow && stock.rangeHigh && stock.rangeHigh !== stock.rangeLow) {
    rangePercent = ((stock.price - stock.rangeLow) / (stock.rangeHigh - stock.rangeLow)) * 100;
    rangePercent = Math.max(0, Math.min(100, rangePercent));
  }

  const rsiValue = stock.rsi ?? 0;
  let rsiStatus = "Neutral";
  let rsiColor = "text-zinc-400";
  let rsiBg = "bg-zinc-800/50";
  
  if (rsiValue > 70) {
    rsiStatus = "Overbought";
    rsiColor = "text-rose-400";
    rsiBg = "bg-rose-950/40";
  } else if (rsiValue < 30) {
    rsiStatus = "Oversold";
    rsiColor = "text-emerald-400";
    rsiBg = "bg-emerald-950/40";
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Price Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center text-zinc-400 mb-2 space-x-2 text-sm font-medium">
          <DollarSign size={16} />
          <span>Current Price</span>
        </div>
        <div className="flex items-baseline space-x-3">
          <span className="text-3xl font-bold text-white">{formatCurrency(stock.price)}</span>
          <span className={cn("flex items-center font-medium text-sm", isPositiveChange ? "text-emerald-400" : "text-rose-400")}>
            {isPositiveChange ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
            {Math.abs(stock.changePercent ?? 0).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Dynamic Range Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center text-zinc-400 mb-3 space-x-2 text-sm font-medium">
          <Activity size={16} />
          <span>{rangeDays}-Day Range</span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-zinc-400 font-medium">
            <span>{formatCurrency(stock.rangeLow)}</span>
            <span>{formatCurrency(stock.rangeHigh)}</span>
          </div>
          <div className="relative h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            {stock.rangeLow && stock.rangeHigh ? (
               <div 
                 className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                 style={{ width: `${rangePercent}%` }}
               />
            ) : null}
          </div>
          <div className="text-xs text-zinc-500 text-center mt-1">
             Current sits at {rangePercent.toFixed(1)}% of range
          </div>
        </div>
      </div>

      {/* RSI Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center text-zinc-400 space-x-2 text-sm font-medium">
             <TrendingUp size={16} />
             <span>RSI ({rsiPeriod})</span>
           </div>
           <div className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border border-zinc-800/50", rsiColor, rsiBg)}>
             {rsiStatus}
           </div>
        </div>
        <div className="flex items-baseline mt-2">
          <span className="text-3xl font-bold text-white">{rsiValue ? rsiValue.toFixed(1) : "N/A"}</span>
        </div>
      </div>

      {/* Valuation Metrics Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center text-zinc-400 mb-3 space-x-2 text-sm font-medium">
          <Target size={16} />
          <span>Fundamentals</span>
        </div>
        <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-1">
            <span className="text-zinc-500">P/E</span>
            <span className="font-medium text-zinc-200">{stock.peRatio ? stock.peRatio.toFixed(2) : "N/A"}</span>
          </div>
          <div className="flex justify-between items-center border-b border-zinc-800 pb-1">
            <span className="text-zinc-500">PEG</span>
            <span className="font-medium text-zinc-200">{stock.pegRatio ? stock.pegRatio.toFixed(2) : "N/A"}</span>
          </div>
          <div className="flex justify-between items-center border-b border-zinc-800 pb-1">
            <span className="text-zinc-500">Div Yield</span>
            <span className="font-medium text-zinc-200">{stock.dividendYield ? formatPercent(stock.dividendYield * 100) : "N/A"}</span>
          </div>
          <div className="flex justify-between items-center border-b border-zinc-800 pb-1">
            <span className="text-zinc-500">EPS</span>
            <span className="font-medium text-zinc-200">{stock.eps ? stock.eps.toFixed(2) : "N/A"}</span>
          </div>
          <div className="flex justify-between items-center border-b border-zinc-800 pb-1">
            <span className="text-zinc-500">Beta</span>
            <span className="font-medium text-zinc-200">{stock.beta ? stock.beta.toFixed(2) : "N/A"}</span>
          </div>
          <div className="flex justify-between items-center border-b border-zinc-800 pb-1">
            <span className="text-zinc-500">P/B</span>
            <span className="font-medium text-zinc-200">{stock.priceToBook ? stock.priceToBook.toFixed(2) : "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
