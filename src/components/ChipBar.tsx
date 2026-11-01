import React from 'react';
import { CHIP_VALUES_KHR, CHIP_VALUES_USD } from '../data/animals';
import { soundManager } from '../utils/audio';

interface Props {
  selectedChip: number;
  onSelectChip: (val: number) => void;
  currency: 'KHR' | 'USD';
  onClearBets: () => void;
  onDoubleBets: () => void;
  onRebet: () => void;
  canRebet: boolean;
  activeStakesTotal: number;
  hasPlacedBets: boolean;
}

export const ChipBar: React.FC<Props> = ({
  selectedChip,
  onSelectChip,
  currency,
  onClearBets,
  onDoubleBets,
  onRebet,
  canRebet,
  activeStakesTotal,
  hasPlacedBets,
}) => {
  const chips = currency === 'KHR' ? CHIP_VALUES_KHR : CHIP_VALUES_USD;

  const chipStyles: { [key: number]: { bg: string; border: string; text: string } } = {
    // KHR
    1000: { bg: 'from-slate-100 to-slate-300', border: 'border-slate-400', text: 'text-slate-800' },
    5000: { bg: 'from-red-500 to-red-700', border: 'border-red-300', text: 'text-white' },
    10000: { bg: 'from-blue-500 to-blue-700', border: 'border-blue-300', text: 'text-white' },
    50000: { bg: 'from-emerald-500 to-emerald-700', border: 'border-emerald-300', text: 'text-white' },
    100000: { bg: 'from-purple-600 to-purple-800', border: 'border-purple-300', text: 'text-white' },
    500000: { bg: 'from-amber-400 to-amber-600', border: 'border-yellow-200', text: 'text-amber-950 font-black' },
    // USD
    0.25: { bg: 'from-slate-100 to-slate-300', border: 'border-slate-400', text: 'text-slate-800' },
    1: { bg: 'from-red-500 to-red-700', border: 'border-red-300', text: 'text-white' },
    5: { bg: 'from-blue-500 to-blue-700', border: 'border-blue-300', text: 'text-white' },
    10: { bg: 'from-emerald-500 to-emerald-700', border: 'border-emerald-300', text: 'text-white' },
    25: { bg: 'from-purple-600 to-purple-800', border: 'border-purple-300', text: 'text-white' },
    100: { bg: 'from-amber-400 to-amber-600', border: 'border-yellow-200', text: 'text-amber-950 font-black' },
  };

  const formatChipLabel = (val: number) => {
    return `${val}៛`;
  };

  return (
    <div className="w-full bg-slate-900/95 backdrop-blur text-white px-2 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-2 shadow-xl select-none">
      {/* Action Utility Buttons (Clear, Double, Rebet) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onClearBets();
          }}
          disabled={!hasPlacedBets}
          className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-600 text-rose-300 transition active:scale-95 flex items-center gap-1"
        >
          <span>✕</span>
          <span>លុប (Clear)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundManager.playChip();
            onDoubleBets();
          }}
          disabled={!hasPlacedBets}
          className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-600 text-amber-300 transition active:scale-95 flex items-center gap-1"
        >
          <span>2×</span>
          <span>ទ្វេគុណ (Double)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundManager.playChip();
            onRebet();
          }}
          disabled={!canRebet || hasPlacedBets}
          className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-600 text-cyan-300 transition active:scale-95 flex items-center gap-1"
        >
          <span>🔄</span>
          <span>ភ្នាល់ដូចមុន (Rebet)</span>
        </button>
      </div>

      {/* Chip Selectors */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto py-1">
        {chips.map((val) => {
          const isSelected = selectedChip === val;
          const style = chipStyles[val] || chipStyles[1000];

          return (
            <button
              key={`chip-${val}`}
              type="button"
              onClick={() => {
                soundManager.playChip();
                onSelectChip(val);
              }}
              className={`relative rounded-full w-10 h-10 sm:w-12 sm:h-12 flex flex-col items-center justify-center transition-all transform active:scale-95 cursor-pointer shadow-md ${
                isSelected
                  ? 'ring-4 ring-yellow-400 scale-110 -translate-y-1 shadow-[0_0_15px_rgba(250,204,21,0.6)] z-10'
                  : 'hover:scale-105 opacity-90 hover:opacity-100'
              }`}
            >
              {/* Striped Casino Chip border ring */}
              <div
                className={`w-full h-full rounded-full bg-gradient-to-br ${style.bg} border-2 ${style.border} flex items-center justify-center p-0.5`}
              >
                <div className="w-full h-full rounded-full border border-dashed border-white/60 flex items-center justify-center">
                  <span className={`text-[10px] sm:text-xs font-black font-mono leading-none ${style.text}`}>
                    {formatChipLabel(val)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Total Active Round Stake Display */}
      <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
        <span className="text-xs text-slate-400 font-medium">ភ្នាល់សរុប (Total Bet):</span>
        <span className="text-sm font-black text-amber-400 font-mono">
          {activeStakesTotal.toLocaleString()}៛
        </span>
      </div>
    </div>
  );
};
