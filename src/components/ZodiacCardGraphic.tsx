import React from 'react';
import { AnimalCard } from '../types/yuki';

interface Props {
  animal: AnimalCard;
  isWinning?: boolean;
  betAmount?: number;
}

export const ZodiacCardGraphic: React.FC<Props> = ({ animal, isWinning = false, betAmount = 0 }) => {
  const getBadgeBg = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-gradient-to-b from-red-500 to-red-700 text-white';
      case 'green':
        return 'bg-gradient-to-b from-emerald-500 to-emerald-700 text-white';
      case 'blue':
        return 'bg-gradient-to-b from-blue-600 to-blue-800 text-white';
      default:
        return 'bg-gray-700 text-white';
    }
  };

  const getCardBorder = (color: string) => {
    if (isWinning) {
      return 'border-4 border-amber-300 ring-4 ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.8)] scale-[1.03] z-20';
    }
    switch (color) {
      case 'red':
        return 'border border-red-300/80 hover:border-red-500';
      case 'green':
        return 'border border-emerald-300/80 hover:border-emerald-500';
      case 'blue':
        return 'border border-blue-300/80 hover:border-blue-500';
      default:
        return 'border border-slate-300';
    }
  };

  return (
    <div
      className={`relative w-full aspect-square rounded-xl overflow-hidden transition-all duration-200 select-none shadow-sm ${getCardBorder(
        animal.color
      )} ${animal.image ? 'p-0 bg-[#fbf2cc]' : 'p-1 sm:p-1.5 flex flex-col justify-between bg-gradient-to-b from-[#fffbf0] via-[#fef8e7] to-[#f8ecd2]'}`}
    >
      {animal.image ? (
        <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
          <img
            src={animal.image}
            alt={`${animal.khmerName} ${animal.number}`}
            className="w-full h-full object-cover transform scale-100 hover:scale-102 transition-transform duration-200"
          />
        </div>
      ) : (
        <>
          {/* Top Header: Khmer Name */}
          <div className="flex items-center justify-between z-10">
            <span
              className="text-xs sm:text-sm font-black tracking-tight"
              style={{
                fontFamily: "'Kantumruy Pro', sans-serif",
                color: animal.accentColor,
                textShadow: '0 1px 1px rgba(255,255,255,0.8)',
              }}
            >
              {animal.khmerName}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase hidden sm:inline">
              {animal.englishName}
            </span>
          </div>

          {/* Main Center Area: Animal Symbol & Mythical Graphic */}
          <div className="relative flex-1 flex items-center justify-center my-0.5 sm:my-1">
            {/* Subtle patterned backdrop */}
            <div className="absolute inset-0 flex items-center justify-center opacity-15">
              <svg viewBox="0 0 100 100" className="w-16 h-16 text-amber-900 fill-current">
                <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" />
              </svg>
            </div>

            {/* Character Visual Avatar */}
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-3xl sm:text-4xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] transform transition-transform group-hover:scale-110">
                {animal.iconSymbol}
              </span>
            </div>
          </div>

          {/* Bottom Area: Large Number and Odds */}
          <div className="flex items-end justify-between z-10 mt-auto">
            {/* Big Number stylized matching screenshot */}
            <div className="flex items-baseline gap-1">
              <span
                className="text-2xl sm:text-3xl font-black leading-none drop-shadow-sm font-['Orbitron',sans-serif]"
                style={{ color: animal.accentColor }}
              >
                {animal.number}
              </span>
              <span
                className="text-[10px] font-bold px-1 py-0.2 rounded"
                style={{
                  backgroundColor: animal.color === 'red' ? '#fee2e2' : animal.color === 'green' ? '#dcfce7' : '#dbeafe',
                  color: animal.accentColor,
                }}
              >
                {animal.parity === 'odd' ? 'សេស' : 'គូ'}
              </span>
            </div>

            {/* Multiplier / Odds (11) on bottom right corner like screenshot */}
            <div className="flex flex-col items-end">
              <div className="text-[11px] sm:text-xs font-black text-amber-800 bg-amber-200/90 border border-amber-400 px-1.5 py-0.5 rounded shadow-inner font-mono">
                {animal.odds}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Chip overlay if user has bet on this specific number */}
      {betAmount > 0 && (
        <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none z-30">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 border-2 border-white shadow-xl flex flex-col items-center justify-center text-white animate-pulse">
            <span className="text-[8px] font-black uppercase leading-none" style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>
              ភ្នាល់
            </span>
            <span className="text-[9px] sm:text-[10px] font-black leading-tight font-mono whitespace-nowrap">
              {betAmount}៛
            </span>
          </div>
        </div>
      )}

      {/* Winning gold flash outline */}
      {isWinning && (
        <div className="absolute inset-0 border-4 border-yellow-400 rounded-lg animate-ping pointer-events-none opacity-75" />
      )}
    </div>
  );
};
