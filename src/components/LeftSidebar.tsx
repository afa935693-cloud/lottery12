import React, { useState, useRef } from 'react';
import { RoundResult, UserAccount, UserBetHistoryItem, PlacedBet } from '../types/yuki';
import { soundManager } from '../utils/audio';

interface Props {
  user: UserAccount;
  recentRounds: RoundResult[];
  userBetHistory: UserBetHistoryItem[];
  activeBetTotal: number;
  activeBets?: PlacedBet[];
  onOpenWallet: () => void;
  onRefreshData: () => void;
  onOpenStatement?: () => void;
  currency: 'KHR' | 'USD';
  onToggleCurrency: () => void;
  onQuickDeposit?: (amountKHR: number) => void;
}

export const LeftSidebar: React.FC<Props> = ({
  user,
  recentRounds,
  userBetHistory,
  activeBetTotal,
  activeBets = [],
  onOpenWallet,
  onRefreshData,
  onOpenStatement,
  currency,
  onToggleCurrency,
  onQuickDeposit,
}) => {
  // Default to 'all' so users can immediately scroll up and down through their entire bet slip history
  const [betTab, setBetTab] = useState<'all' | 'recent3' | 'active' | 'won' | 'not_won'>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentDateStr = new Date().toISOString().split('T')[0];

  const formatMoney = (khrAmount: number) => {
    return `${khrAmount.toLocaleString()} ៛`;
  };

  // Recent 3 results only
  const latestDraws = recentRounds.slice(-3).reverse();

  // User's bet slips history sorted by latest first
  const sortedBets = [...userBetHistory].sort((a, b) => b.timestamp - a.timestamp);
  const pendingBets = sortedBets.filter((b) => b.status === 'pending');
  const wonBets = sortedBets.filter(
    (b) => b.status === 'won' || (b.won && b.status !== 'pending')
  );
  const notWonBets = sortedBets.filter(
    (b) => b.status === 'not_won' || (!b.won && b.status !== 'pending' && b.status !== 'won')
  );

  // Determine which list to display based on selected tab
  let displayBets = sortedBets;
  if (betTab === 'recent3') {
    displayBets = sortedBets.slice(0, 3);
  } else if (betTab === 'active') {
    displayBets = pendingBets;
  } else if (betTab === 'won') {
    displayBets = wonBets;
  } else if (betTab === 'not_won') {
    displayBets = notWonBets;
  }

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="w-full h-full bg-[#f8fafc] rounded-xl border border-slate-300 shadow-sm flex flex-col p-2 sm:p-2.5 text-xs text-slate-800 select-none">
      {/* Account & Date Info */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-1.5 font-bold text-slate-600">
          <span>{currentDateStr}</span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold"
            title="ប្រាក់រៀលខ្មែរ (Khmer Riel)"
          >
            ប្រាក់រៀល (៛)
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="font-mono font-black text-blue-700">{user.accountCode}</span>
          <button
            onClick={() => {
              soundManager.playClick();
              onRefreshData();
            }}
            className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
            title="Refresh"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Financial Overview (សមតុល្យទឹកប្រាក់ & លុយកំពុងភ្នាល់) */}
      <div className="py-2 space-y-1.5 border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between">
          <span
            className="text-slate-600 font-bold"
            style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
          >
            សមតុល្យទឹកប្រាក់ (Balance)
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-emerald-600 text-sm font-mono">
              {formatMoney(user.balanceKHR)}
            </span>
            <button
              onClick={onOpenWallet}
              className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 rounded shadow transition active:scale-95"
            >
              + ដាក់ប្រាក់
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span
            className="text-slate-600 font-bold"
            style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
          >
            លុយកំពុងភ្នាល់ (Active Bet)
          </span>
          <span className="font-black text-blue-600 text-sm font-mono">
            {formatMoney(activeBetTotal)}
          </span>
        </div>

        {onQuickDeposit && (
          <div className="pt-1 flex items-center justify-between text-[10px]">
            <span className="text-slate-500 font-bold">ដាក់ឥតគិតថ្លៃ:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  soundManager.playWin();
                  onQuickDeposit(100000);
                }}
                className="px-1.5 py-0.5 rounded bg-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-800 font-mono font-bold border border-emerald-300 transition shadow-2xs"
                title="បញ្ចូល +100,000៛ ភ្លាមៗដោយឥតគិតថ្លៃ"
              >
                +100K៛
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playWin();
                  onQuickDeposit(500000);
                }}
                className="px-1.5 py-0.5 rounded bg-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-800 font-mono font-bold border border-emerald-300 transition shadow-2xs"
                title="បញ្ចូល +500,000៛ ភ្លាមៗដោយឥតគិតថ្លៃ"
              >
                +500K៛
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playWin();
                  onQuickDeposit(1000000);
                }}
                className="px-1.5 py-0.5 rounded bg-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-800 font-mono font-bold border border-emerald-300 transition shadow-2xs"
                title="បញ្ចូល +1,000,000៛ ភ្លាមៗដោយឥតគិតថ្លៃ"
              >
                +1M៛
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Latest Results Section (លទ្ធផលចុងក្រោយ) */}
      <div
        style={{ marginTop: '-9px', marginBottom: '-67px' }}
        className="py-1.5 border-b border-slate-200 flex flex-col max-h-[140px] shrink-0"
      >
        <div className="flex items-center justify-between mb-1.5 shrink-0">
          <span
            className="font-black text-slate-800 text-sm"
            style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
          >
            លទ្ធផលចុងក្រោយ (Latest)
          </span>
          <button
            onClick={onRefreshData}
            className="p-0.5 text-slate-400 hover:text-blue-600 rounded"
            title="Refresh draws"
          >
            🔄
          </button>
        </div>

        <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-0 custom-scrollbar">
          {latestDraws.map((round) => (
            <div
              key={`latest-${round.roundId}`}
              className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition"
            >
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold text-slate-800">
                  {round.roundId}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {round.formattedTime}
                </span>
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5">
                {/* Size badge */}
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded text-white ${
                    round.size === 'small' ? 'bg-[#00bcd4]' : 'bg-[#ec4899]'
                  }`}
                  style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
                >
                  {round.size === 'small' ? 'តូច' : 'ធំ'}
                </span>

                {/* Color badge */}
                <span
                  className="text-xs font-black px-2 py-0.5 rounded text-white"
                  style={{
                    backgroundColor:
                      round.color === 'red'
                        ? '#dc2626'
                        : round.color === 'green'
                        ? '#16a34a'
                        : '#1d4ed8',
                    fontFamily: "'Kantumruy Pro', sans-serif",
                  }}
                >
                  {round.color === 'red' ? 'ក្រហម' : round.color === 'green' ? 'បៃតង' : 'ខៀវ'}
                </span>

                {/* Number badge - distinctly enlarged and bold */}
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-300 shadow-xs font-black">
                  <span className="text-[10px] text-amber-800 font-bold" style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>
                    លេខ
                  </span>
                  <span className="text-base font-black font-mono leading-none text-amber-950">
                    {round.winningNumber}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Bet Slips History Section (ប្រវត្តិកត់ត្រាសន្លឹកភ្នាល់) */}
      <div className="pt-2 flex-1 flex flex-col min-h-0 relative z-10 bg-[#f8fafc]">
        <div className="flex items-center justify-between mb-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🧾</span>
            <span
              className="font-black text-slate-800 text-xs sm:text-sm tracking-tight"
              style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
            >
              Bet Slips History (ប្រវត្តិកត់ត្រាសន្លឹកភ្នាល់)
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Scroll navigation helpers */}
            {displayBets.length > 2 && (
              <div className="flex items-center gap-0.5 bg-slate-200/90 rounded px-1 py-0.5">
                <button
                  onClick={scrollToTop}
                  className="px-1 text-[10px] text-slate-700 hover:text-blue-700 hover:bg-white rounded font-bold transition"
                  title="អូសឡើងលើបង្អស់ (Scroll up to latest)"
                >
                  ⬆
                </button>
                <button
                  onClick={scrollToBottom}
                  className="px-1 text-[10px] text-slate-700 hover:text-blue-700 hover:bg-white rounded font-bold transition"
                  title="អូសចុះក្រោមបង្អស់ (Scroll down to oldest)"
                >
                  ⬇
                </button>
              </div>
            )}

            {onOpenStatement && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenStatement();
                }}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-bold px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 transition"
                title="បើកផ្ទាំងរបាយការណ៍ឈ្នះចាញ់ពេញលេញ"
              >
                របាយការណ៍
              </button>
            )}
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 mb-1.5 bg-slate-200/80 p-0.5 rounded-lg shrink-0 text-[10px] font-bold overflow-x-auto">
          <button
            onClick={() => setBetTab('all')}
            className={`flex-1 py-1 px-1 rounded text-center whitespace-nowrap transition ${
              betTab === 'all'
                ? 'bg-white text-blue-800 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="មើលប្រវត្តិនៃសន្លឹកភ្នាល់ទាំងអស់ និងអូសចុះឡើងបាន"
          >
            ទាំងអស់ ({sortedBets.length})
          </button>
          <button
            onClick={() => setBetTab('recent3')}
            className={`flex-1 py-1 px-1 rounded text-center whitespace-nowrap transition ${
              betTab === 'recent3'
                ? 'bg-white text-blue-800 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ៣ ចុងក្រោយ
          </button>
          <button
            onClick={() => setBetTab('active')}
            className={`flex-1 py-1 px-1 rounded text-center whitespace-nowrap transition flex items-center justify-center gap-1 ${
              betTab === 'active'
                ? 'bg-white text-blue-800 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>កំពុងរង់ចាំ</span>
            {pendingBets.length > 0 && (
              <span className="px-1 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-mono leading-none font-bold">
                {pendingBets.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setBetTab('won')}
            className={`flex-1 py-1 px-1 rounded text-center whitespace-nowrap transition ${
              betTab === 'won'
                ? 'bg-white text-emerald-800 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ឈ្នះ ({wonBets.length})
          </button>
        </div>

        {/* Scroll Helper Hint */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 px-0.5 shrink-0">
          <div className="flex items-center gap-1">
            <span className="text-blue-600 font-bold">↕️ អូសឡើងលើ/ចុះក្រោម</span>
            <span>({displayBets.length} សន្លឹក)</span>
          </div>
          {displayBets.length > 3 && (
            <span className="text-[9px] text-slate-400 font-medium">Scroll to view all</span>
          )}
        </div>

        {/* Bet Slips Scrollable Container - user can scroll up or down to view entire bet slip history */}
        <div
          ref={scrollContainerRef}
          tabIndex={0}
          className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar pr-1 min-h-[200px] max-h-[360px] sm:max-h-[400px] lg:max-h-[440px] space-y-2 p-1 focus:outline-none focus:ring-1 focus:ring-blue-300 rounded"
          aria-label="Bet Slips History list - scrollable up and down"
        >
          {displayBets.length === 0 ? (
            <div className="p-4 bg-white rounded-lg border border-slate-200 text-center text-slate-400 text-[11px] flex flex-col items-center gap-1">
              <span>📭</span>
              <span>មិនទាន់មានសន្លឹកភ្នាល់ក្នុងជម្រើសនេះទេ</span>
              <span className="text-[10px] text-slate-400">
                (No bet slips in this category)
              </span>
            </div>
          ) : (
            displayBets.map((item, index) => {
              const isRecentTop3 = index < 3 && betTab === 'all';
              return (
                <div
                  key={`slip-${item.id}-${index}`}
                  className={`p-2 rounded-lg border text-[11px] transition shadow-xs flex flex-col gap-1.5 ${
                    item.status === 'pending'
                      ? 'bg-amber-50/90 border-amber-300 hover:border-amber-400'
                      : item.won || item.status === 'won'
                      ? 'bg-emerald-50/90 border-emerald-300 hover:border-emerald-400'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Ticket Header: Round ID, Time & Ticket # */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pb-1 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <span className="text-blue-700">#{item.roundId}</span>
                      <span>•</span>
                      <span>
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isRecentTop3 && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 text-blue-700 font-bold">
                          ថ្មីៗ #{index + 1}
                        </span>
                      )}
                      <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-bold font-mono">
                        {item.id.replace('slip_', '').slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Selected Option & Bet Amount in Khmer Riel */}
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-slate-400 font-medium">ជម្រើសភ្នាល់ (Option):</span>
                      <span
                        className="font-black text-slate-800 text-xs truncate"
                        style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
                        title={item.labelKhmer}
                      >
                        {item.labelKhmer}
                      </span>
                      {item.labelEnglish && (
                        <span className="text-[9px] text-slate-400 font-medium truncate">
                          {item.labelEnglish}
                        </span>
                      )}
                    </div>
                    <div className="text-right flex flex-col items-end shrink-0">
                      <span className="text-[10px] text-slate-400 font-medium">លុយភ្នាល់ (Amount):</span>
                      <span className="font-mono font-black text-slate-900 text-xs">
                        {item.amount.toLocaleString()}៛
                      </span>
                    </div>
                  </div>

                  {/* Odds & Result: Payout/Winnings if won or "Not Won" */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                    <span className="font-mono text-slate-500 font-bold">
                      ពន្ធ: <span className="text-blue-600 font-black">{item.odds}x</span>
                    </span>

                    <div>
                      {item.status === 'pending' ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center gap-1 animate-pulse">
                          <span>⏳</span>
                          <span>កំពុងរង់ចាំ (Pending)</span>
                        </span>
                      ) : item.won || item.status === 'won' ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-black font-mono">
                          ឈ្នះ: +{item.payout.toLocaleString()}៛
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-black font-mono">
                          Not Won
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom scroll-to-top quick jump if there are many items */}
        {displayBets.length > 4 && (
          <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200/80 mt-1 shrink-0">
            <span>បានបង្ហាញ {displayBets.length} សន្លឹក</span>
            <button
              onClick={scrollToTop}
              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5"
            >
              <span>⬆ ត្រឡប់ទៅលើបង្អស់</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
