import React from 'react';
import { StockData } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { formatCurrency } from '../lib/utils';

interface StockChartsProps {
  stock: StockData;
  rsiPeriod: number;
  trendDays: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg shadow-xl text-sm">
        <p className="text-zinc-400 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="font-medium" style={{ color: entry.color }}>
            {entry.name}: {entry.name === 'Price' ? formatCurrency(entry.value) : entry.value.toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function StockCharts({ stock, rsiPeriod, trendDays }: StockChartsProps) {
  if (!stock.chartData || stock.chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500">
        No chart data available.
      </div>
    );
  }

  // Calculate min/max for price chart domain to make it look better
  const prices = stock.chartData.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.95;
  const maxPrice = Math.max(...prices) * 1.05;

  return (
    <div className="space-y-4">
      {/* Price Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
          {trendDays}-Day Price Trend
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stock.chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#52525b" 
                tick={{ fill: '#71717a', fontSize: 12 }} 
                tickFormatter={(val) => {
                  const date = new Date(val);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
                minTickGap={30}
              />
              <YAxis 
                domain={[minPrice, maxPrice]} 
                stroke="#52525b" 
                tick={{ fill: '#71717a', fontSize: 12 }}
                tickFormatter={(val) => `$${val.toFixed(0)}`}
                orientation="right"
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="price" 
                name="Price"
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RSI Chart */}
      {stock.rsiChartData && stock.rsiChartData.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            {rsiPeriod}-Period RSI Oscillator
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stock.rsiChartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#52525b" 
                  tick={{ fill: '#71717a', fontSize: 12 }} 
                  tickFormatter={(val) => {
                    const date = new Date(val);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                  minTickGap={30}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="#52525b" 
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  ticks={[0, 30, 50, 70, 100]}
                  orientation="right"
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="3 3" />
                <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" />
                <Line 
                  type="monotone" 
                  dataKey="rsi" 
                  name="RSI"
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
