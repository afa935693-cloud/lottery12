import React, { useState } from 'react';
import { BetType, AnimalCard, PlacedBet, RoundResult } from '../types/yuki';
import { YUKI_ANIMALS } from '../data/animals';
import { ZodiacCardGraphic } from './ZodiacCardGraphic';
import { soundManager, KHMER_NUM_WORDS } from '../utils/audio';
import { BetModal, BetTargetInfo } from './BetModal';

interface Props {
  remainingSeconds: number;
  activeRoundId: string;
  roundEstimatedTime: string;
  placedBets: PlacedBet[];
  onPlaceBet: (betType: BetType, odds: number, labelKhmer: string, labelEnglish: string, amount?: number) => void;
  isDrawInProgress: boolean;
  lastSettledResult: RoundResult | null;
  oddsConfig: {
    smallBig: number;
    oddEven: number;
    color: number;
    specificNumber: number;
  };
  selectedChip?: number;
  onSelectChip?: (amount: number) => void;
  currency?: 'KHR' | 'USD';
  userBalanceKHR?: number;
  onClearBets?: () => void;
  onDoubleBets?: () => void;
  onRebet?: () => void;
  canRebet?: boolean;
  onTriggerDraw?: () => void;
}

export const BettingBoard: React.FC<Props> = ({
  remainingSeconds,
  activeRoundId,
  roundEstimatedTime,
  placedBets,
  onPlaceBet,
  isDrawInProgress,
  lastSettledResult,
  oddsConfig,
  selectedChip = 10000,
  onSelectChip,
  currency = 'KHR',
  userBalanceKHR,
  onClearBets,
  onDoubleBets,
  onRebet,
  canRebet = false,
  onTriggerDraw,
}) => {
  const [betModalTarget, setBetModalTarget] = useState<BetTargetInfo | null>(null);

  // Helper to format bet badge amount in Khmer money (example: 1000៛)
  const formatKhmerBadge = (amount: number): string => {
    return `${amount}៛`;
  };

  // Compute bets on a specific zone
  const getBetAmountForZone = (betType: BetType): number => {
    return placedBets
      .filter((b) => b.betType === betType)
      .reduce((sum, b) => sum + b.amount, 0);
  };

  const isZoneWinning = (betType: BetType): boolean => {
    if (!lastSettledResult || isDrawInProgress) return false;
    const { winningNumber, color, size, parity } = lastSettledResult;
    if (betType === 'small' && size === 'small') return true;
    if (betType === 'big' && size === 'big') return true;
    if (betType === 'odd' && parity === 'odd') return true;
    if (betType === 'even' && parity === 'even') return true;
    if (betType === 'red' && color === 'red') return true;
    if (betType === 'green' && color === 'green') return true;
    if (betType === 'blue' && color === 'blue') return true;
    if (betType === `number_${winningNumber}`) return true;
    return false;
  };

  const handleBetClick = (
    betType: BetType,
    odds: number,
    labelKhmer: string,
    labelEnglish: string
  ) => {
    if (isDrawInProgress || remainingSeconds <= 10) {
      soundManager.playCountdownTick(true);
      return;
    }
    soundManager.playClick();
    setBetModalTarget({
      betType,
      odds,
      labelKhmer,
      labelEnglish,
    });
  };

  // Close bet modal automatically when 10 seconds countdown is reached
  React.useEffect(() => {
    if (remainingSeconds <= 10 && betModalTarget !== null) {
      setBetModalTarget(null);
    }
  }, [remainingSeconds, betModalTarget]);

  // Current system clock
  const [clockStr, setClockStr] = React.useState('');
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setClockStr(`${h}:${m}:${s}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-[#f4f7fa] rounded-xl border border-slate-300 shadow-sm overflow-hidden select-none">
      {/* Top Header: Countdown & Round Info (matching image_e1dfce9c.png) */}
      <div className="flex items-stretch w-full h-10 sm:h-11 bg-[#3f5a9e] border-b border-[#2d4277] select-none overflow-hidden">
        {/* Selector 1: Left Red Countdown Box */}
        <div
          onClick={() => {
            if (!isDrawInProgress && onTriggerDraw) {
              onTriggerDraw();
            }
          }}
          title={!isDrawInProgress ? 'ចុចដើម្បីបើកលទ្ធផលភ្លាមៗ (Click to test draw)' : undefined}
          style={{ fontFamily: "'Times New Roman', Times, serif" }}
          className={`w-16 sm:w-20 text-white font-black text-lg sm:text-2xl flex items-center justify-center shrink-0 transition-colors ${
            !isDrawInProgress ? 'cursor-pointer hover:brightness-110 active:scale-95' : ''
          } ${
            isDrawInProgress
              ? 'bg-[#b91c1c] animate-pulse text-sm sm:text-base font-black'
              : remainingSeconds <= 10
              ? 'bg-[#990000] animate-pulse'
              : 'bg-[#c00000]'
          }`}
        >
          {isDrawInProgress ? 'DRAW' : remainingSeconds}
        </div>

        {/* Selector 2: Center Round & Draw Time */}
        <div className="flex-1 flex items-center justify-center gap-1.5 px-1 sm:px-2 text-white font-bold text-xs sm:text-sm font-mono truncate">
          <span className="text-white text-xs sm:text-sm opacity-90">🔄</span>
          <span className="font-mono tracking-tight font-black text-white">{activeRoundId}</span>
          <span className="text-white/95 font-bold font-mono">{roundEstimatedTime}</span>
        </div>

        {/* Selector 3: Right Digital Real-time Clock */}
        <div className="px-2 sm:px-4 flex items-center justify-end text-white font-mono font-bold text-xs sm:text-sm shrink-0">
          {clockStr}
        </div>
      </div>

      {/* 10-Second Countdown Closed Notice - Accurately Synced with Khmer Audio Figures */}
      {remainingSeconds <= 10 && !isDrawInProgress && (
        <div className="bg-red-600 text-white text-xs font-black py-1.5 px-3 text-center flex items-center justify-center gap-2 shadow-sm animate-pulse">
          <span className="text-sm">🔒</span>
          <span style={{ fontFamily: "'Kantumruy Pro', sans-serif" }} className="tracking-wide">
            បិទការភ្នាល់ (Betting Closed: {remainingSeconds} «{KHMER_NUM_WORDS[remainingSeconds]?.khmer}»)
          </span>
        </div>
      )}

      {/* Main Betting Area */}
      <div className="flex-1 p-1.5 sm:p-2 flex flex-col gap-1.5 overflow-y-auto">
        {/* Unified 5-Column x 2-Row Betting Matrix Matching Screenshot image_57d00199.png */}
        <div className="grid grid-cols-5 grid-rows-2 gap-[2px] bg-slate-300 p-[1px] rounded-sm select-none">
          {/* Row 1, Col 1: Small (តូច) */}
          <button
            type="button"
            onClick={() => handleBetClick('small', oddsConfig.smallBig, 'តូច', 'Small (1-6)')}
            className={`relative col-start-1 row-start-1 h-[52px] sm:h-[60px] flex flex-col items-center justify-center gap-1 text-white font-bold transition-all active:scale-[0.98] ${
              isZoneWinning('small') ? 'ring-4 ring-yellow-400 z-10 animate-bounce' : 'hover:brightness-105'
            }`}
            style={{ backgroundColor: '#1fb8eb' }}
          >
            <span
              className="text-base sm:text-lg font-black leading-none drop-shadow-xs"
              style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
            >
              តូច
            </span>
            <div className="bg-white text-slate-800 font-bold px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-mono shadow-xs leading-none">
              {oddsConfig.smallBig}
            </div>
            {getBetAmountForZone('small') > 0 && (
              <div className="absolute top-1 right-1 bg-amber-400 text-amber-950 font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full border border-white shadow-sm flex items-center justify-center font-mono whitespace-nowrap leading-none">
                {formatKhmerBadge(getBetAmountForZone('small'))}
              </div>
            )}
          </button>

          {/* Row 1, Col 2: Big (ធំ) */}
          <button
            type="button"
            onClick={() => handleBetClick('big', oddsConfig.smallBig, 'ធំ', 'Big (7-12)')}
            className={`relative col-start-2 row-start-1 h-[52px] sm:h-[60px] flex flex-col items-center justify-center gap-1 text-white font-bold transition-all active:scale-[0.98] ${
              isZoneWinning('big') ? 'ring-4 ring-yellow-400 z-10 animate-bounce' : 'hover:brightness-105'
            }`}
            style={{ backgroundColor: '#f0559b' }}
          >
            <span
              className="text-base sm:text-lg font-black leading-none drop-shadow-xs"
              style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
            >
              ធំ
            </span>
            <div className="bg-white text-slate-800 font-bold px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-mono shadow-xs leading-none">
              {oddsConfig.smallBig}
            </div>
            {getBetAmountForZone('big') > 0 && (
              <div className="absolute top-1 right-1 bg-amber-400 text-amber-950 font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full border border-white shadow-sm flex items-center justify-center font-mono whitespace-nowrap leading-none">
                {formatKhmerBadge(getBetAmountForZone('big'))}
              </div>
            )}
          </button>

          {/* Row 2, Col 1: Odd (សេស) */}
          <button
            type="button"
            onClick={() => handleBetClick('odd', oddsConfig.oddEven, 'សេស', 'Odd (1,3,5,7,9,11)')}
            className={`relative col-start-1 row-start-2 h-[52px] sm:h-[60px] flex flex-col items-center justify-center gap-1 text-white font-bold transition-all active:scale-[0.98] ${
              isZoneWinning('odd') ? 'ring-4 ring-yellow-400 z-10 animate-bounce' : 'hover:brightness-105'
            }`}
            style={{ backgroundColor: '#f4631b' }}
          >
            <span
              className="text-base sm:text-lg font-black leading-none drop-shadow-xs"
              style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
            >
              សេស
            </span>
            <div className="bg-white text-slate-800 font-bold px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-mono shadow-xs leading-none">
              {oddsConfig.oddEven}
            </div>
            {getBetAmountForZone('odd') > 0 && (
              <div className="absolute top-1 right-1 bg-amber-400 text-amber-950 font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full border border-white shadow-sm flex items-center justify-center font-mono whitespace-nowrap leading-none">
                {formatKhmerBadge(getBetAmountForZone('odd'))}
              </div>
            )}
          </button>

          {/* Row 2, Col 2: Even (គូ) */}
          <button
            type="button"
            onClick={() => handleBetClick('even', oddsConfig.oddEven, 'គូ', 'Even (2,4,6,8,10,12)')}
            className={`relative col-start-2 row-start-2 h-[52px] sm:h-[60px] flex flex-col items-center justify-center gap-1 text-white font-bold transition-all active:scale-[0.98] ${
              isZoneWinning('even') ? 'ring-4 ring-yellow-400 z-10 animate-bounce' : 'hover:brightness-105'
            }`}
            style={{ backgroundColor: '#f9a825' }}
          >
            <span
              className="text-base sm:text-lg font-black leading-none drop-shadow-xs"
              style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
            >
              គូ
            </span>
            <div className="bg-white text-slate-800 font-bold px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-mono shadow-xs leading-none">
              {oddsConfig.oddEven}
            </div>
            {getBetAmountForZone('even') > 0 && (
              <div className="absolute top-1 right-1 bg-amber-400 text-amber-950 font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full border border-white shadow-sm flex items-center justify-center font-mono whitespace-nowrap leading-none">
                {formatKhmerBadge(getBetAmountForZone('even'))}
              </div>
            )}
          </button>

          {/* Col 3, Row-span-2: Red (ក្រហម) */}
          <button
            type="button"
            onClick={() => handleBetClick('red', oddsConfig.color, 'ក្រហម', 'Red')}
            className={`relative col-start-3 row-start-1 row-span-2 h-full min-h-[106px] sm:min-h-[122px] flex flex-col items-center justify-between py-2 sm:py-2.5 text-white font-bold transition-all active:scale-[0.98] ${
              isZoneWinning('red') ? 'ring-4 ring-yellow-400 z-10 animate-bounce' : 'hover:brightness-105'
            }`}
            style={{ backgroundColor: '#d32f2f' }}
          >
            <span
              className="text-sm sm:text-base font-black leading-none drop-shadow-xs"
              style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
            >
              ក្រហម
            </span>
            <div className="w-[90%] bg-white text-slate-800 font-bold text-[10px] sm:text-[11px] py-0.5 rounded-xs tracking-wider font-mono border border-slate-200 text-center leading-tight shadow-xs">
              1&nbsp;&nbsp;4&nbsp;&nbsp;7&nbsp;&nbsp;10
            </div>
            <div className="bg-white text-slate-800 font-bold px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-mono shadow-xs leading-none">
              {oddsConfig.color}
            </div>
            {getBetAmountForZone('red') > 0 && (
              <div className="absolute top-1 right-1 bg-amber-400 text-amber-950 font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full border border-white shadow-sm flex items-center justify-center font-mono whitespace-nowrap leading-none">
                {formatKhmerBadge(getBetAmountForZone('red'))}
              </div>
            )}
          </button>

          {/* Col 4, Row-span-2: Green (បៃតង) */}
          <button
            type="button"
            onClick={() => handleBetClick('green', oddsConfig.color, 'បៃតង', 'Green')}
            className={`relative col-start-4 row-start-1 row-span-2 h-full min-h-[106px] sm:min-h-[122px] flex flex-col items-center justify-between py-2 sm:py-2.5 text-white font-bold transition-all active:scale-[0.98] ${
              isZoneWinning('green') ? 'ring-4 ring-yellow-400 z-10 animate-bounce' : 'hover:brightness-105'
            }`}
            style={{ backgroundColor: '#2e7d32' }}
          >
            <span
              className="text-sm sm:text-base font-black leading-none drop-shadow-xs"
              style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
            >
              បៃតង
            </span>
            <div className="w-[90%] bg-white text-slate-800 font-bold text-[10px] sm:text-[11px] py-0.5 rounded-xs tracking-wider font-mono border border-slate-200 text-center leading-tight shadow-xs">
              2&nbsp;&nbsp;5&nbsp;&nbsp;8&nbsp;&nbsp;11
            </div>
            <div className="bg-white text-slate-800 font-bold px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-mono shadow-xs leading-none">
              {oddsConfig.color}
            </div>
            {getBetAmountForZone('green') > 0 && (
              <div className="absolute top-1 right-1 bg-amber-400 text-amber-950 font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full border border-white shadow-sm flex items-center justify-center font-mono whitespace-nowrap leading-none">
                {formatKhmerBadge(getBetAmountForZone('green'))}
              </div>
            )}
          </button>

          {/* Col 5, Row-span-2: Blue (ខៀវ) */}
          <button
            type="button"
            onClick={() => handleBetClick('blue', oddsConfig.color, 'ខៀវ', 'Blue')}
            className={`relative col-start-5 row-start-1 row-span-2 h-full min-h-[106px] sm:min-h-[122px] flex flex-col items-center justify-between py-2 sm:py-2.5 text-white font-bold transition-all active:scale-[0.98] ${
              isZoneWinning('blue') ? 'ring-4 ring-yellow-400 z-10 animate-bounce' : 'hover:brightness-105'
            }`}
            style={{ backgroundColor: '#1a3b8b' }}
          >
            <span
              className="text-sm sm:text-base font-black leading-none drop-shadow-xs"
              style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
            >
              ខៀវ
            </span>
            <div className="w-[90%] bg-white text-slate-800 font-bold text-[10px] sm:text-[11px] py-0.5 rounded-xs tracking-wider font-mono border border-slate-200 text-center leading-tight shadow-xs">
              3&nbsp;&nbsp;6&nbsp;&nbsp;9&nbsp;&nbsp;12
            </div>
            <div className="bg-white text-slate-800 font-bold px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-mono shadow-xs leading-none">
              {oddsConfig.color}
            </div>
            {getBetAmountForZone('blue') > 0 && (
              <div className="absolute top-1 right-1 bg-amber-400 text-amber-950 font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full border border-white shadow-sm flex items-center justify-center font-mono whitespace-nowrap leading-none">
                {formatKhmerBadge(getBetAmountForZone('blue'))}
              </div>
            )}
          </button>
        </div>

        {/* Section 3: The 12 Specific Animal Cards (6 per row x 2 rows: 1-6 Small, 7-12 Big) */}
        <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
          {YUKI_ANIMALS.map((animal) => {
            const betTypeKey = `number_${animal.number}` as BetType;
            const betAmount = getBetAmountForZone(betTypeKey);
            const isWinning = isZoneWinning(betTypeKey);

            return (
              <button
                key={`animal-card-${animal.number}`}
                type="button"
                onClick={() =>
                  handleBetClick(
                    betTypeKey,
                    animal.odds,
                    `លេខ ${animal.number} (${animal.khmerName})`,
                    `Number ${animal.number} (${animal.englishName})`
                  )
                }
                className="w-full focus:outline-none transition-transform active:scale-95"
              >
                <ZodiacCardGraphic
                  animal={animal}
                  isWinning={isWinning}
                  betAmount={betAmount}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bet Amount Entry Modal matching image_4bfde68c.png */}
      <BetModal
        isOpen={betModalTarget !== null}
        target={betModalTarget}
        activeRoundId={activeRoundId}
        roundEstimatedTime={roundEstimatedTime}
        userBalanceKHR={userBalanceKHR ?? 1000000}
        currency={currency}
        onClose={() => setBetModalTarget(null)}
        onConfirmBet={(type, odds, kh, en, amt) => {
          onPlaceBet(type, odds, kh, en, amt);
        }}
      />
    </div>
  );
};
