import React, { useState, useEffect } from 'react';
import { BetType } from '../types/yuki';
import { soundManager } from '../utils/audio';

export interface BetTargetInfo {
  betType: BetType;
  odds: number;
  labelKhmer: string;
  labelEnglish: string;
  colorBadge?: string;
}

interface BetModalProps {
  isOpen: boolean;
  target: BetTargetInfo | null;
  activeRoundId: string;
  roundEstimatedTime: string;
  userBalanceKHR: number;
  currency: 'KHR' | 'USD';
  onClose: () => void;
  onConfirmBet: (
    betType: BetType,
    odds: number,
    labelKhmer: string,
    labelEnglish: string,
    amount: number
  ) => void;
}

const QUICK_AMOUNTS = [
  { label: '1ពាន់', amount: 1000 },
  { label: '2ពាន់', amount: 2000 },
  { label: '5ពាន់', amount: 5000 },
  { label: '1ម៉ឺន', amount: 10000 },
  { label: '2ម៉ឺន', amount: 20000 },
  { label: '5ម៉ឺន', amount: 50000 },
  { label: '20ម៉ឺន', amount: 200000 },
  { label: '50ម៉ឺន', amount: 500000 },
];

const MIN_BET = 100;
const MAX_BET = 1000000;

export const BetModal: React.FC<BetModalProps> = ({
  isOpen,
  target,
  activeRoundId,
  roundEstimatedTime,
  userBalanceKHR,
  currency,
  onClose,
  onConfirmBet,
}) => {
  const [betAmount, setBetAmount] = useState<number>(0);
  const [singlePost, setSinglePost] = useState<boolean>(false);
  const [clockStr, setClockStr] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live ticking clock for modal sub-bar
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setClockStr(`${h}:${m}:${s}`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset state when modal opens with new target
  useEffect(() => {
    if (isOpen) {
      setBetAmount(0);
      setErrorMsg(null);
    }
  }, [isOpen, target]);

  if (!isOpen || !target) return null;

  const handleAddQuickAmount = (amt: number) => {
    soundManager.playChip();
    setBetAmount((prev) => {
      const next = prev + amt;
      return next > MAX_BET ? MAX_BET : next;
    });
    setErrorMsg(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    const num = val === '' ? 0 : parseInt(val, 10);
    if (num <= MAX_BET) {
      setBetAmount(num);
      setErrorMsg(null);
    }
  };

  const handleClear = () => {
    soundManager.playClick();
    if (betAmount > 0) {
      setBetAmount(0);
      setErrorMsg(null);
    } else {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (betAmount < MIN_BET) {
      soundManager.playCountdownTick(true);
      setErrorMsg(`ចំនួនតិចបំផុតគឺ ${MIN_BET.toLocaleString()}៛`);
      return;
    }
    if (betAmount > MAX_BET) {
      soundManager.playCountdownTick(true);
      setErrorMsg(`ចំនួនច្រើនបំផុតគឺ ${MAX_BET.toLocaleString()}៛`);
      return;
    }
    if (betAmount > userBalanceKHR) {
      soundManager.playCountdownTick(true);
      setErrorMsg('សមតុល្យទឹកប្រាក់របស់អ្នកមិនគ្រប់គ្រាន់ទេ');
      return;
    }

    soundManager.playChip();
    onConfirmBet(
      target.betType,
      target.odds,
      target.labelKhmer,
      target.labelEnglish,
      betAmount
    );
    onClose();
  };

  const handlePrint = () => {
    soundManager.playClick();
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[440px] bg-white rounded-lg shadow-2xl border-2 border-[#1c3076] overflow-hidden flex flex-col select-none">
        {/* Top Header Bar matching image_4bfde68c.png */}
        <div className="bg-[#1e3076] px-3 py-2 flex items-center justify-between border-b border-[#132258]">
          <span className="text-white font-mono font-bold text-sm tracking-wide">
            {activeRoundId} {roundEstimatedTime}
          </span>
          <div className="flex items-center gap-1.5">
            {/* Green Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              title="បោះពុម្ពវិក្កយបត្រ (Print Receipt)"
              className="w-7 h-7 bg-[#008f17] hover:bg-[#007713] text-white flex items-center justify-center rounded transition-colors active:scale-95 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
            </button>
            {/* Red Close Button */}
            <button
              type="button"
              onClick={onClose}
              title="បិទ (Close)"
              className="w-7 h-7 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black text-sm flex items-center justify-center rounded transition-colors active:scale-95 shadow-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Sub-bar: 3 Columns matching image_4bfde68c.png */}
        <div className="grid grid-cols-3 bg-[#172765] border-b border-[#121f52] divide-x divide-[#2b3c83] text-xs py-1.5 px-1 font-bold">
          {/* Bet Type */}
          <div className="flex items-center justify-center gap-1.5 px-1">
            <span className="text-white" style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>
              ប្រភេទភ្នាល់:
            </span>
            <span className="bg-[#107c10] text-white px-2 py-0.5 rounded text-[11px] font-black truncate max-w-[65px]">
              {target.labelKhmer}
            </span>
          </div>

          {/* Odds */}
          <div className="flex items-center justify-center gap-1.5 px-1">
            <span className="text-white" style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>
              ពន្ធភ្នាល់:
            </span>
            <span className="text-[#00ff48] font-mono font-black text-sm tracking-tight">
              {target.odds}
            </span>
          </div>

          {/* Time */}
          <div className="flex items-center justify-center gap-1.5 px-1">
            <span className="text-white" style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>
              ម៉ោង:
            </span>
            <span className="text-[#00ff48] font-mono font-bold text-xs tracking-tight">
              {clockStr}
            </span>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-3 bg-white flex flex-col gap-3">
          {/* Deep Blue Rounded Container matching image_4bfde68c.png */}
          <div className="bg-[#1f3796] rounded-xl p-3 sm:p-4 flex flex-col gap-3.5 shadow-md border border-[#162974]">
            {/* Top row: Label and Input */}
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="bet-amount-input"
                className="text-white font-black text-base sm:text-lg shrink-0"
                style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
              >
                លុយភ្នាល់:
              </label>
              <div className="flex-1 max-w-[210px] bg-white rounded-md px-3 py-1.5 flex items-center justify-between shadow-inner border border-slate-300">
                <input
                  id="bet-amount-input"
                  type="text"
                  inputMode="numeric"
                  value={betAmount === 0 ? '0' : betAmount.toString()}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-[#00a826] font-mono font-black text-xl text-left focus:outline-none"
                />
                <span className="text-[#00a826] font-black text-lg select-none ml-1">៛</span>
              </div>
            </div>

            {/* 8 Circular Bright Yellow Quick-Stake Buttons (4x2 grid) */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3 py-1 justify-items-center">
              {QUICK_AMOUNTS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleAddQuickAmount(item.amount)}
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#ffe600] hover:bg-[#ffd700] active:scale-95 transition-all shadow-[0_4px_10px_rgba(0,0,0,0.35)] flex items-center justify-center border-2 border-[#fff570] focus:outline-none"
                >
                  <span
                    className="text-[#d80000] font-black text-sm sm:text-base leading-none drop-shadow-xs"
                    style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Limits Row */}
          <div
            className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 px-1"
            style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
          >
            <span>ចំនួនតិចបំផុត: {MIN_BET.toLocaleString()} ៛</span>
            <span>ចំនួនច្រើនបំផុត: {MAX_BET.toLocaleString()} ៛</span>
          </div>

          {/* Error Message if any */}
          {errorMsg && (
            <div className="text-red-600 text-xs font-bold text-center bg-red-50 p-1.5 rounded border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* Single Post Checkbox */}
          <div className="flex items-center gap-2 px-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={singlePost}
                onChange={(e) => setSinglePost(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-400 focus:ring-blue-500 cursor-pointer"
              />
              <span
                className="text-xs sm:text-sm font-bold text-slate-800"
                style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
              >
                បញ្ជូនមួយប៉ុស្ត
              </span>
            </label>
          </div>

          {/* Bottom Action Buttons: ភ្នាល់ (Bet) & លុប (Clear/Cancel) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Green Confirm Bet Button */}
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.98] text-white py-2.5 rounded-md font-black text-lg transition-all shadow-md flex items-center justify-center"
              style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
            >
              ភ្នាល់
            </button>

            {/* Red Clear/Cancel Button */}
            <button
              type="button"
              onClick={handleClear}
              className="w-full bg-[#b91c1c] hover:bg-[#991b1b] active:scale-[0.98] text-white py-2.5 rounded-md font-black text-lg transition-all shadow-md flex items-center justify-center"
              style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
            >
              លុប
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
