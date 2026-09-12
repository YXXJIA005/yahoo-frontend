import React, { useState, useEffect, useCallback } from 'react';
import { WatchlistSwitcher } from './components/WatchlistSwitcher';
import { MetricCards } from './components/MetricCards';
import { StockCharts } from './components/StockCharts';
import { ComparisonTable } from './components/ComparisonTable';
import { AdvancedMetrics } from './components/AdvancedMetrics';
import { StockData, MarketDataResponse } from './types';
import { Activity, RefreshCcw, AlertTriangle, Settings2, Check, X, Download, Info } from 'lucide-react';

const DEFAULT_WATCHLIST = ['AAPL', 'MSFT', 'NVDA', 'AMZN'];

export default function App() {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('marketPulse_watchlist');
    return saved ? JSON.parse(saved) : DEFAULT_WATCHLIST;
  });
  const [selectedTicker, setSelectedTicker] = useState<string>(watchlist[0] || 'AAPL');
  
  // Custom Variables (Active)
  const [config, setConfig] = useState({
    rsiPeriod: 14,
    trendDays: 180,
    rangeDays: 50
  });

  // Custom Variables (Draft - user is editing)
  const [draftConfig, setDraftConfig] = useState({
    rsiPeriod: 14,
    trendDays: 180,
    rangeDays: 50
  });

  const [marketData, setMarketData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchMarketData = useCallback(async (tickersToFetch: string[], isRefresh = false) => {
    if (tickersToFetch.length === 0) {
      setMarketData([]);
      setLoading(false);
      return;
    }

    if (!isRefresh) setLoading(true);
    else setRefreshing(true);
    
    setError(null);

    try {
      const { rsiPeriod, trendDays, rangeDays } = config;
      const response = await fetch(`/api/market-data?tickers=${tickersToFetch.join(',')}&rsiPeriod=${rsiPeriod}&trendDays=${trendDays}&rangeDays=${rangeDays}`);
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      const json: MarketDataResponse = await response.json();
      
      if (json.error) {
        throw new Error(json.error);
      }

      setMarketData(json.data || []);
      
      // Select the first valid ticker if current is not in the list anymore
      if (!tickersToFetch.includes(selectedTicker) && json.data.length > 0) {
        setSelectedTicker(json.data[0].ticker);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch market data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedTicker, config]);

  useEffect(() => {
    localStorage.setItem('marketPulse_watchlist', JSON.stringify(watchlist));
    fetchMarketData(watchlist);
  }, [watchlist, config, fetchMarketData]);

  const handleAddTicker = (ticker: string) => {
    if (!watchlist.includes(ticker)) {
      setWatchlist(prev => {
        if (!prev.includes(ticker)) return [...prev, ticker];
        return prev;
      });
      setSelectedTicker(ticker); // Auto-select new ticker
    } else {
      setSelectedTicker(ticker);
    }
  };

  const handleRemoveTicker = (ticker: string) => {
    setWatchlist(prev => prev.filter(t => t !== ticker));
  };

  const handleManualRefresh = () => {
    fetchMarketData(watchlist, true);
  };

  const applyConfig = () => {
    setConfig(draftConfig);
  };

  const handleExportCSV = () => {
    if (!marketData.length) return;

    // Headers
    const headers = [
      'Ticker', 'Name', 'Price', 'Change %', 'RSI', 'PEG Ratio', 'P/E Ratio',
      'Gross Margin', 'Operating Margin', 'ROE', 'ROA', 'ROIC',
      'Operating Cash Flow', 'Free Cash Flow', 'FCF Yield',
      'Debt/Equity', 'Current Ratio', 'Forward P/E', 'EV/EBITDA',
      'Fundamental Quality', 'Momentum Alignment', 'Swing Trade Bias'
    ];

    // Rows
    const rows = marketData.map(s => {
      if (s.error) return [s.ticker, s.error];
      
      return [
        s.ticker,
        `"${s.name || ''}"`,
        s.price,
        s.changePercent,
        s.rsi,
        s.pegRatio,
        s.peRatio,
        s.grossMargin,
        s.operatingMargin,
        s.roe,
        s.roa,
        s.roic,
        s.operatingCashFlow,
        s.freeCashFlow,
        s.fcfYield,
        s.debtToEquity,
        s.currentRatio,
        s.forwardPE,
        s.evToEbitda,
        `"${s.fundamentalQuality || ''}"`,
        `"${s.momentumAlignment || ''}"`,
        `"${s.swingTradeBias || ''}"`
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'market_data_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Derived state
  const selectedStockData = marketData.find(s => s.ticker === selectedTicker);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30 relative">
      <header className="border-b border-zinc-900 bg-zinc-950/50 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
              <Activity size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-200">
              Yahoo Finance frontend
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex flex-wrap sm:flex-nowrap items-end gap-2 sm:gap-3 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
              <div className="flex flex-col">
                <label className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-1">RSI Period</label>
                <input 
                  type="number" 
                  min="2" 
                  max="100" 
                  value={draftConfig.rsiPeriod} 
                  onChange={(e) => setDraftConfig({...draftConfig, rsiPeriod: Number(e.target.value) || 14})}
                  className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white w-16 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-1">Trend (Days)</label>
                <input 
                  type="number" 
                  min="30" 
                  max="1000" 
                  value={draftConfig.trendDays} 
                  onChange={(e) => setDraftConfig({...draftConfig, trendDays: Number(e.target.value) || 180})}
                  className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white w-20 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-1">Range (Days)</label>
                <input 
                  type="number" 
                  min="5" 
                  max="500" 
                  value={draftConfig.rangeDays} 
                  onChange={(e) => setDraftConfig({...draftConfig, rangeDays: Number(e.target.value) || 50})}
                  className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white w-20 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow"
                />
              </div>
              <button 
                onClick={applyConfig}
                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-3 py-1.5 rounded text-xs transition-colors h-[30px] flex items-center w-full sm:w-auto justify-center"
              >
                Apply
              </button>
            </div>

            <button 
              onClick={handleExportCSV}
              disabled={loading || marketData.length === 0}
              className="flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
              title="Export Data to CSV"
            >
              <Download size={18} />
            </button>

            <button 
              onClick={handleManualRefresh}
              disabled={loading || refreshing}
              className="flex items-center text-sm font-medium text-zinc-400 hover:text-emerald-400 transition-colors disabled:opacity-50"
            >
              <RefreshCcw size={16} className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WatchlistSwitcher 
          watchlist={watchlist}
          selectedTicker={selectedTicker}
          onSelect={setSelectedTicker}
          onAdd={handleAddTicker}
          onRemove={handleRemoveTicker}
        />

        {watchlist.length >= 10 && (
          <div className="mb-6 p-4 bg-amber-950/30 border border-amber-900/50 rounded-xl flex items-start text-amber-400 text-sm">
            <Info size={18} className="mr-3 mt-0.5 flex-shrink-0" />
            <p><strong>Notice:</strong> Your watchlist has 10 or more tickers. Large watchlists may slow down data loading and increase the risk of API rate limits.</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-950/20 border border-rose-900/50 rounded-xl flex items-start text-rose-400 text-sm">
            <AlertTriangle size={18} className="mr-3 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-zinc-900 rounded-xl border border-zinc-800/50"></div>
              ))}
            </div>
            <div className="h-96 bg-zinc-900 rounded-xl border border-zinc-800/50"></div>
          </div>
        ) : selectedStockData ? (
          <>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">{selectedStockData.ticker}</h2>
                <p className="text-zinc-500 font-medium">{selectedStockData.name}</p>
              </div>
            </div>
            
            <MetricCards stock={selectedStockData} rsiPeriod={config.rsiPeriod} rangeDays={config.rangeDays} />
            <AdvancedMetrics stock={selectedStockData} />
            <StockCharts stock={selectedStockData} rsiPeriod={config.rsiPeriod} trendDays={config.trendDays} />
            <ComparisonTable 
              data={marketData} 
              onSelectStock={setSelectedTicker} 
              selectedTicker={selectedTicker} 
              rsiPeriod={config.rsiPeriod}
              rangeDays={config.rangeDays}
            />
          </>
        ) : (
          <div className="py-20 text-center text-zinc-500">
            {watchlist.length === 0 ? 
              "Your watchlist is empty. Add a ticker to get started." : 
              "No data available for the selected ticker."}
          </div>
        )}
      </main>
    </div>
  );
}
