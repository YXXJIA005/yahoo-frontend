import React, { useState } from 'react';
import { StockData } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

interface ComparisonTableProps {
  data: StockData[];
  onSelectStock: (ticker: string) => void;
  selectedTicker: string;
  rsiPeriod: number;
  rangeDays: number;
}

type SortField = 'ticker' | 'price' | 'changePercent' | 'distRange' | 'rsi' | 'pegRatio' | 'beta';
type SortDirection = 'asc' | 'desc';

export function ComparisonTable({ data, onSelectStock, selectedTicker, rsiPeriod, rangeDays }: ComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>('ticker');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to desc for most financial metrics
    }
  };

  const getDistanceRangeHigh = (stock: StockData) => {
    if (!stock.price || !stock.rangeHigh) return null;
    return ((stock.price - stock.rangeHigh) / stock.rangeHigh) * 100;
  };

  const sortedData = [...data].sort((a, b) => {
    const valA = sortField === 'distRange' ? getDistanceRangeHigh(a) : a[sortField as keyof StockData];
    const valB = sortField === 'distRange' ? getDistanceRangeHigh(b) : b[sortField as keyof StockData];

    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="ml-1 text-zinc-600 group-hover:text-zinc-400" />;
    return sortDirection === 'asc' ? 
      <ArrowUp size={14} className="ml-1 text-emerald-500" /> : 
      <ArrowDown size={14} className="ml-1 text-emerald-500" />;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm mt-8">
      <div className="px-5 py-4 border-b border-zinc-800 flex justify-between items-center">
        <h3 className="font-semibold text-zinc-100">Watchlist Comparison</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-zinc-400 whitespace-nowrap">
          <thead className="text-xs text-zinc-500 uppercase bg-zinc-900 border-b border-zinc-800">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium cursor-pointer group" onClick={() => handleSort('ticker')}>
                <div className="flex items-center">Ticker <SortIcon field="ticker" /></div>
              </th>
              <th scope="col" className="px-5 py-3 font-medium cursor-pointer group" onClick={() => handleSort('price')}>
                <div className="flex items-center">Price <SortIcon field="price" /></div>
              </th>
              <th scope="col" className="px-5 py-3 font-medium cursor-pointer group" onClick={() => handleSort('changePercent')}>
                <div className="flex items-center">% Change <SortIcon field="changePercent" /></div>
              </th>
              <th scope="col" className="px-5 py-3 font-medium">
                {rangeDays}D Range
              </th>
              <th scope="col" className="px-5 py-3 font-medium cursor-pointer group" onClick={() => handleSort('distRange')}>
                <div className="flex items-center">Dist from High <SortIcon field="distRange" /></div>
              </th>
              <th scope="col" className="px-5 py-3 font-medium cursor-pointer group" onClick={() => handleSort('rsi')}>
                <div className="flex items-center">RSI ({rsiPeriod}) <SortIcon field="rsi" /></div>
              </th>
              <th scope="col" className="px-5 py-3 font-medium cursor-pointer group" onClick={() => handleSort('pegRatio')}>
                <div className="flex items-center">PEG <SortIcon field="pegRatio" /></div>
              </th>
              <th scope="col" className="px-5 py-3 font-medium cursor-pointer group" onClick={() => handleSort('beta')}>
                <div className="flex items-center">Beta <SortIcon field="beta" /></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((stock) => {
              if (stock.error) return null; // Skip errors in comparison for cleaner look

              const distRange = getDistanceRangeHigh(stock);
              const isSelected = selectedTicker === stock.ticker;

              return (
                <tr 
                  key={stock.ticker} 
                  className={cn(
                    "border-b border-zinc-800/50 hover:bg-zinc-800/50 cursor-pointer transition-colors",
                    isSelected ? "bg-zinc-800/80" : ""
                  )}
                  onClick={() => onSelectStock(stock.ticker)}
                >
                  <td className="px-5 py-4 font-bold text-zinc-200">
                    {stock.ticker}
                  </td>
                  <td className="px-5 py-4 font-medium text-white">
                    {formatCurrency(stock.price)}
                  </td>
                  <td className={cn("px-5 py-4 font-medium", (stock.changePercent ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400")}>
                    {(stock.changePercent ?? 0) >= 0 ? "+" : ""}{stock.changePercent?.toFixed(2)}%
                  </td>
                  <td className="px-5 py-4 text-xs text-zinc-500">
                    <div className="flex flex-col">
                      <span>L: {formatCurrency(stock.rangeLow)}</span>
                      <span>H: {formatCurrency(stock.rangeHigh)}</span>
                    </div>
                  </td>
                  <td className={cn("px-5 py-4", (distRange ?? 0) >= -5 ? "text-emerald-400" : "text-zinc-400")}>
                    {distRange ? `${distRange.toFixed(2)}%` : 'N/A'}
                  </td>
                  <td className={cn("px-5 py-4", 
                    (stock.rsi ?? 50) > 70 ? "text-rose-400" : 
                    (stock.rsi ?? 50) < 30 ? "text-emerald-400" : "text-zinc-400"
                  )}>
                    {stock.rsi?.toFixed(1) ?? 'N/A'}
                  </td>
                  <td className="px-5 py-4">
                    {stock.pegRatio?.toFixed(2) ?? 'N/A'}
                  </td>
                  <td className="px-5 py-4">
                    {stock.beta?.toFixed(2) ?? 'N/A'}
                  </td>
                </tr>
              );
            })}
            {sortedData.filter(s => !s.error).length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-zinc-500">
                  No valid stock data to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
