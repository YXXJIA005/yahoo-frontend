import React, { useState } from 'react';
import { Plus, X, Search } from 'lucide-react';
import { cn } from '../lib/utils';

interface WatchlistSwitcherProps {
  watchlist: string[];
  selectedTicker: string;
  onSelect: (ticker: string) => void;
  onAdd: (ticker: string) => void;
  onRemove: (ticker: string) => void;
}

export function WatchlistSwitcher({ watchlist, selectedTicker, onSelect, onAdd, onRemove }: WatchlistSwitcherProps) {
  const [newTicker, setNewTicker] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTicker.trim()) {
      const tickers = newTicker.split(',').map(t => t.trim().toUpperCase()).filter(t => t);
      tickers.forEach(t => onAdd(t));
      setNewTicker('');
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {watchlist.map(ticker => (
        <div 
          key={ticker}
          onClick={() => onSelect(ticker)}
          className={cn(
            "group flex items-center px-4 py-2 rounded-full cursor-pointer text-sm font-bold transition-all border",
            selectedTicker === ticker 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/50" 
              : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
          )}
        >
          <span>{ticker}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemove(ticker);
            }}
            className="ml-2 -mr-1 p-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-zinc-700 transition-all text-zinc-500 hover:text-rose-400"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {isAdding ? (
        <form onSubmit={handleAdd} className="flex items-center">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-zinc-500" />
            <input
              autoFocus
              type="text"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              placeholder="e.g. TSLA, NVDA"
              className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-full pl-8 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48"
              onBlur={() => {
                if (!newTicker.trim()) setIsAdding(false);
              }}
            />
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center px-4 py-2 rounded-full border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-colors text-sm font-medium"
        >
          <Plus size={16} className="mr-1" />
          Add Ticker(s)
        </button>
      )}
    </div>
  );
}
